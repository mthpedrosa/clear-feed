const SELECTORS = {
  youtube: {
    shorts: [
      'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
      'ytd-reel-shelf-renderer',
      'grid-shelf-view-model',
      'ytd-video-renderer:has(a[href^="/shorts/"])',
      '[is-shorts]',
      'ytd-guide-entry-renderer:has(a[href="/shorts/"])',
      'ytd-mini-guide-entry-renderer:has(a[href="/shorts/"])',
      '#endpoint:has(tp-yt-paper-item [title="Shorts"])',
      'a[title="Shorts"]'
    ],
    comments: [
      '#comments',
      'ytd-comments'
    ],
    home: [
      'ytd-browse[page-subtype="home"] #primary',
      'ytd-rich-grid-renderer'
    ],
    videoRec: [
      '#secondary #related',
      'ytd-watch-next-secondary-results-renderer',
      '.html5-endscreen',
      'ytd-player #endscreen'
    ],
    games: [
      'ytd-rich-section-renderer:has(a[href^="/playables"])',
      'ytd-rich-shelf-renderer:has(a[href^="/playables"])',
      'ytd-rich-section-renderer:has(ytd-mini-game-card-view-model)'
    ]
  },
  instagram: {
    reels: [
      'a[href^="/reels/"]', 
      'a[href*="/reel/"]',
      'a:has(svg[aria-label*="Reel" i])',
      'a:has(svg[aria-label*="reel" i])',
      'a:has(svg[aria-label*="Vídeo" i])',
      'a:has(svg[aria-label*="Video" i])',
      'a:has(svg[aria-label*="Clip" i])',
      'svg[aria-label*="Reels" i]',
      'div[aria-label="Reels" i]'
    ]
  },
  facebook: {
    reels: [
      'a[href^="/reels/"]', 
      'a[href*="/reel/"]',
      'div[aria-label="Reels"]'
    ],
    stories: [
      'div[aria-label="Stories"]',
      'a[href^="/stories/"]'
    ]
  }
};

let currentConfig = {
  blockYoutubeShorts: true,
  blockYoutubeGames: true,
  blockYoutubeComments: false,
  blockYoutubeHome: false,
  blockYoutubeVideoRec: false,
  blockInstagramReels: true,
  blockFacebookReels: true,
  blockFacebookStories: false,
  snoozeUntil: null,
  focusScheduleEnabled: false,
  focusStartTime: "09:00",
  focusEndTime: "17:00",
  focusDays: [1, 2, 3, 4, 5],
  isPaidUser: false,
  showExtensionIcon: true
};

const getPlatform = () => {
  const host = window.location.hostname;
  if (host.includes('youtube.com')) return 'youtube';
  if (host.includes('instagram.com')) return 'instagram';
  if (host.includes('facebook.com')) return 'facebook';
  return null;
};

const isSnoozed = () => {
  if (!currentConfig.isPaidUser) return false;
  return currentConfig.snoozeUntil && Date.now() < currentConfig.snoozeUntil;
};

const isWithinFocusSchedule = () => {
  if (!currentConfig.isPaidUser || !currentConfig.focusScheduleEnabled) return true;

  const now = new Date();
  const currentDay = now.getDay();

  if (Array.isArray(currentConfig.focusDays) && currentConfig.focusDays.length > 0) {
    if (!currentConfig.focusDays.includes(currentDay)) {
      return false;
    }
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = (currentConfig.focusStartTime || "09:00").split(':').map(Number);
  const startMinutes = startH * 60 + startM;

  const [endH, endM] = (currentConfig.focusEndTime || "17:00").split(':').map(Number);
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Crosses midnight
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
};

const injectStyles = () => {
  const platform = getPlatform();
  if (!platform) return;

  const existing = document.getElementById('noreels-fix-styles');
  if (existing) existing.remove();

  if (isSnoozed() || !isWithinFocusSchedule()) {
    return;
  }

  const activeSelectors = [];
  let customCSS = '';

  if (platform === 'youtube') {
    if (currentConfig.blockYoutubeShorts) activeSelectors.push(...SELECTORS.youtube.shorts);
    if (currentConfig.blockYoutubeGames) activeSelectors.push(...SELECTORS.youtube.games);
    if (currentConfig.blockYoutubeComments) activeSelectors.push(...SELECTORS.youtube.comments);
    if (currentConfig.blockYoutubeHome) activeSelectors.push(...SELECTORS.youtube.home);
    if (currentConfig.blockYoutubeVideoRec) {
      activeSelectors.push(...SELECTORS.youtube.videoRec);
      customCSS += `
        #primary.ytd-watch-flexy {
          max-width: 100% !important;
          margin-left: auto !important;
          margin-right: auto !important;
          padding-right: 0 !important;
        }
        ytd-watch-flexy[flexy] #primary.ytd-watch-flexy {
          margin-left: auto !important;
          margin-right: auto !important;
        }
        #columns { justify-content: center !important; }
      `;
    }
  } else if (platform === 'instagram') {
    if (currentConfig.blockInstagramReels) activeSelectors.push(...SELECTORS.instagram.reels);
  } else if (platform === 'facebook') {
    if (currentConfig.blockFacebookReels) activeSelectors.push(...SELECTORS.facebook.reels);
    if (currentConfig.blockFacebookStories) activeSelectors.push(...SELECTORS.facebook.stories);
  }

  const style = document.createElement('style');
  style.id = 'noreels-fix-styles';
  style.innerHTML = `
    ${activeSelectors.length > 0 ? activeSelectors.join(',\n') + ' { display: none !important; }' : ''}
    ${customCSS}
  `;
  (document.head || document.documentElement).appendChild(style);
};

const updateMetrics = (platform, blockedCount) => {
  chrome.storage.local.get(['totalBlocked', 'statsByPlatform', 'statsHistory'], (result) => {
    const totalBlocked = (result.totalBlocked || 0) + blockedCount;

    const statsByPlatform = result.statsByPlatform || { youtube: 0, instagram: 0, facebook: 0 };
    statsByPlatform[platform] = (statsByPlatform[platform] || 0) + blockedCount;

    const todayStr = new Date().toISOString().split('T')[0];
    const statsHistory = result.statsHistory || {};
    if (!statsHistory[todayStr]) {
      statsHistory[todayStr] = { youtube: 0, instagram: 0, facebook: 0 };
    }
    statsHistory[todayStr][platform] = (statsHistory[todayStr][platform] || 0) + blockedCount;

    chrome.storage.local.set({ totalBlocked, statsByPlatform, statsHistory });
  });
};

const processBlocks = () => {
  const platform = getPlatform();
  if (!platform) return;
  if (isSnoozed() || !isWithinFocusSchedule()) return;

  let newlyBlocked = 0;
  const selectorsToCount = [];

  if (platform === 'youtube') {
    if (currentConfig.blockYoutubeShorts) selectorsToCount.push(...SELECTORS.youtube.shorts);
    if (currentConfig.blockYoutubeGames) selectorsToCount.push(...SELECTORS.youtube.games);
  } else if (platform === 'instagram' && currentConfig.blockInstagramReels) {
    selectorsToCount.push(...SELECTORS.instagram.reels);
  } else if (platform === 'facebook') {
    if (currentConfig.blockFacebookReels) selectorsToCount.push(...SELECTORS.facebook.reels);
    if (currentConfig.blockFacebookStories) selectorsToCount.push(...SELECTORS.facebook.stories);
  }

  selectorsToCount.forEach(selector => {
    const elements = document.querySelectorAll(`${selector}:not([data-noreels-counted])`);
    elements.forEach(el => {
      el.setAttribute('data-noreels-counted', 'true');
      newlyBlocked++;
    });
  });

  if (newlyBlocked > 0) {
    updateMetrics(platform, newlyBlocked);
  }
};

const loadConfig = () => {
  chrome.storage.local.get([
    'blockYoutubeShorts', 
    'blockYoutubeGames',
    'blockYoutubeComments',
    'blockYoutubeHome',
    'blockYoutubeVideoRec',
    'blockInstagramReels', 
    'blockFacebookReels',
    'blockFacebookStories',
    'snoozeUntil',
    'focusScheduleEnabled',
    'focusStartTime',
    'focusEndTime',
    'focusDays',
    'isPaidUser',
    'showExtensionIcon'
  ], (result) => {
    currentConfig = {
      blockYoutubeShorts: result.blockYoutubeShorts !== false,
      blockYoutubeGames: result.blockYoutubeGames !== false,
      blockYoutubeComments: result.blockYoutubeComments === true,
      blockYoutubeHome: result.blockYoutubeHome === true,
      blockYoutubeVideoRec: result.blockYoutubeVideoRec === true,
      blockInstagramReels: result.blockInstagramReels !== false,
      blockFacebookReels: result.blockFacebookReels !== false,
      blockFacebookStories: result.blockFacebookStories === true,
      snoozeUntil: result.snoozeUntil || null,
      focusScheduleEnabled: result.focusScheduleEnabled === true,
      focusStartTime: result.focusStartTime || "09:00",
      focusEndTime: result.focusEndTime || "17:00",
      focusDays: result.focusDays || [1, 2, 3, 4, 5],
      isPaidUser: result.isPaidUser === true,
      showExtensionIcon: result.showExtensionIcon !== false
    };
    injectStyles();
    processBlocks();
  });
};

chrome.storage.onChanged.addListener((changes) => {
  let changed = false;
  if (changes.blockYoutubeShorts !== undefined) { currentConfig.blockYoutubeShorts = changes.blockYoutubeShorts.newValue; changed = true; }
  if (changes.blockYoutubeGames !== undefined) { currentConfig.blockYoutubeGames = changes.blockYoutubeGames.newValue; changed = true; }
  if (changes.blockYoutubeComments !== undefined) { currentConfig.blockYoutubeComments = changes.blockYoutubeComments.newValue; changed = true; }
  if (changes.blockYoutubeHome !== undefined) { currentConfig.blockYoutubeHome = changes.blockYoutubeHome.newValue; changed = true; }
  if (changes.blockYoutubeVideoRec !== undefined) { currentConfig.blockYoutubeVideoRec = changes.blockYoutubeVideoRec.newValue; changed = true; }
  if (changes.blockInstagramReels !== undefined) { currentConfig.blockInstagramReels = changes.blockInstagramReels.newValue; changed = true; }
  if (changes.blockFacebookReels !== undefined) { currentConfig.blockFacebookReels = changes.blockFacebookReels.newValue; changed = true; }
  if (changes.blockFacebookStories !== undefined) { currentConfig.blockFacebookStories = changes.blockFacebookStories.newValue; changed = true; }
  if (changes.snoozeUntil !== undefined) { currentConfig.snoozeUntil = changes.snoozeUntil.newValue; changed = true; }
  if (changes.focusScheduleEnabled !== undefined) { currentConfig.focusScheduleEnabled = changes.focusScheduleEnabled.newValue; changed = true; }
  if (changes.focusStartTime !== undefined) { currentConfig.focusStartTime = changes.focusStartTime.newValue; changed = true; }
  if (changes.focusEndTime !== undefined) { currentConfig.focusEndTime = changes.focusEndTime.newValue; changed = true; }
  if (changes.focusDays !== undefined) { currentConfig.focusDays = changes.focusDays.newValue; changed = true; }
  if (changes.isPaidUser !== undefined) { currentConfig.isPaidUser = changes.isPaidUser.newValue; changed = true; }
  if (changes.showExtensionIcon !== undefined) { currentConfig.showExtensionIcon = changes.showExtensionIcon.newValue; changed = true; }
  
  if (changed) {
    injectStyles();
    processBlocks();
    if (getPlatform() === 'youtube') {
      injectYoutubeSidebarButton();
    }
  }
});

loadConfig();

const injectYoutubeSidebarButton = () => {
  const existingBtn = document.getElementById('noreels-sidebar-button');
  
  if (!currentConfig.showExtensionIcon) {
    if (existingBtn) existingBtn.remove();
    return;
  }
  
  if (existingBtn) return;

  // Busca o item do Shorts no menu lateral para colocar logo depois dele
  const shortsLink = document.querySelector('a[title="Shorts"], a[href^="/shorts/"]');
  if (!shortsLink) return;
  
  const shortsItem = shortsLink.closest('ytd-guide-entry-renderer') || shortsLink.closest('ytd-mini-guide-entry-renderer');
  if (!shortsItem || !shortsItem.parentElement) return;

  const parentList = shortsItem.parentElement;

  const isMini = shortsItem.tagName.toLowerCase() === 'ytd-mini-guide-entry-renderer';

  // Create Button
  const btnContainer = document.createElement('div');
  btnContainer.id = 'noreels-sidebar-button';
  
  if (isMini) {
    btnContainer.style.cssText = 'display: flex; flex-direction: column; justify-content: center; align-items: center; height: 74px; cursor: pointer; border-radius: 10px; margin: 0 4px;';
  } else {
    btnContainer.style.cssText = 'display: flex; align-items: center; padding: 0 12px; height: 40px; cursor: pointer; border-radius: 10px; margin: 4px 12px;';
  }
  
  btnContainer.addEventListener('mouseover', () => {
    btnContainer.style.backgroundColor = document.documentElement.hasAttribute('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  });
  btnContainer.addEventListener('mouseout', () => {
    btnContainer.style.backgroundColor = 'transparent';
  });
  
  const icon = document.createElement('img');
  icon.src = chrome.runtime.getURL('images/icon.png');
  const isDark = document.documentElement.hasAttribute('dark');
  icon.style.cssText = `width: 24px; height: 24px; border-radius: 50%; box-sizing: border-box; ${isDark ? 'background-color: #ffffff; padding: 2px;' : ''} ${isMini ? 'margin: 0;' : 'margin-right: 24px;'}`;
  
  btnContainer.appendChild(icon);

  if (!isMini) {
    const label = document.createElement('span');
    label.textContent = 'NoReels';
    label.style.cssText = 'font-size: 1.4rem; line-height: 2rem; font-weight: 400; font-family: "Roboto","Arial",sans-serif; color: var(--yt-spec-text-primary, #0f0f0f);';
    btnContainer.appendChild(label);
  }

  // Create Dropdown Modal (Fixed to screen to avoid sidebar overflow)
  const dropdown = document.createElement('div');
  dropdown.id = 'noreels-sidebar-dropdown';
  dropdown.style.cssText = `
    display: none;
    position: fixed;
    top: 50%;
    left: 80px;
    transform: translateY(-50%);
    width: 300px;
    background: var(--yt-spec-base-background, #ffffff);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    border: 1px solid var(--yt-spec-10-percent-layer, #e5e5e5);
    z-index: 9999;
    padding: 16px;
    font-family: 'Roboto', 'Arial', sans-serif;
    color: var(--yt-spec-text-primary, #0f0f0f);
    cursor: default;
  `;

  // Dropdown Title
  const title = document.createElement('h3');
  title.textContent = 'NoReels Config';
  title.style.cssText = 'margin: 0 0 12px 0; font-size: 16px; font-weight: 500; border-bottom: 1px solid var(--yt-spec-10-percent-layer, #e5e5e5); padding-bottom: 8px;';
  dropdown.appendChild(title);

  // Toggles
  const toggles = [
    { id: 'yt-shorts', key: 'blockYoutubeShorts', label: 'Block Shorts' },
    { id: 'yt-games', key: 'blockYoutubeGames', label: 'Block Games' },
    { id: 'yt-comments', key: 'blockYoutubeComments', label: 'Hide Comments' },
    { id: 'yt-home', key: 'blockYoutubeHome', label: 'Home Recommendations' },
    { id: 'yt-video-rec', key: 'blockYoutubeVideoRec', label: 'Video Recommendations' }
  ];

  toggles.forEach(t => {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 14px;';
    
    const label = document.createElement('span');
    label.textContent = chrome.i18n ? chrome.i18n.getMessage(t.key === 'blockYoutubeShorts' ? 'blockShorts' : 
                                                            t.key === 'blockYoutubeGames' ? 'blockGames' :
                                                            t.key === 'blockYoutubeComments' ? 'hideComments' :
                                                            t.key === 'blockYoutubeHome' ? 'homeRecs' : 'videoRecs') || t.label : t.label;

    const toggleWrap = document.createElement('label');
    toggleWrap.style.cssText = 'position: relative; display: inline-block; width: 34px; height: 20px; cursor: pointer;';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.style.cssText = 'opacity: 0; width: 0; height: 0; position: absolute;';
    input.checked = currentConfig[t.key];
    
    const slider = document.createElement('span');
    slider.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background-color: ${input.checked ? '#065fd4' : '#ccc'};
      transition: .4s; border-radius: 20px;
    `;
    
    const circle = document.createElement('span');
    circle.style.cssText = `
      position: absolute; height: 16px; width: 16px; left: 2px; bottom: 2px;
      background-color: white; transition: .4s; border-radius: 50%;
      transform: ${input.checked ? 'translateX(14px)' : 'translateX(0)'};
    `;

    input.addEventListener('change', (e) => {
      slider.style.backgroundColor = e.target.checked ? '#065fd4' : '#ccc';
      circle.style.transform = e.target.checked ? 'translateX(14px)' : 'translateX(0)';
      chrome.storage.local.set({ [t.key]: e.target.checked });
    });

    slider.appendChild(circle);
    toggleWrap.appendChild(input);
    toggleWrap.appendChild(slider);
    
    row.appendChild(label);
    row.appendChild(toggleWrap);
    dropdown.appendChild(row);
  });

  // AdsOnBread Container
  const adContainer = document.createElement('div');
  adContainer.id = 'noreels-youtube-ad';
  adContainer.style.cssText = 'margin-top: 16px; display: flex; justify-content: center; border-top: 1px solid var(--yt-spec-10-percent-layer, #e5e5e5); padding-top: 16px;';
  dropdown.appendChild(adContainer);

  document.body.appendChild(dropdown);

  // Toggle Dropdown Event
  btnContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = dropdown.style.display === 'block';
    
    if (isVisible) {
      dropdown.style.display = 'none';
    } else {
      // Ajusta posição
      const rect = btnContainer.getBoundingClientRect();
      dropdown.style.left = `${rect.right + 10}px`;
      dropdown.style.top = `${rect.top}px`;
      dropdown.style.transform = 'none';
      
      dropdown.style.display = 'block';
      
      if (typeof AdsOnBread !== 'undefined') {
        try {
          AdsOnBread.load('b84f1d67-0435-4fe5-8498-3bb6f7a1ee1f', 'banner', document.getElementById('noreels-youtube-ad'), {
            theme: document.documentElement.hasAttribute('dark') ? 'dark' : 'light'
          });
        } catch (err) {
          console.error('AdsOnBread load error:', err);
        }
      }
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!btnContainer.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  parentList.insertBefore(btnContainer, shortsItem.nextSibling);
};

const observer = new MutationObserver(() => {
  const platform = getPlatform();
  if (platform) {
    if (!document.getElementById('noreels-fix-styles')) {
      injectStyles();
    }
    processBlocks();
    
    if (platform === 'youtube') {
      injectYoutubeSidebarButton();
    }
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });