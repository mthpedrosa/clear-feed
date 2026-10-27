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
    ],
    explore: [
      'a[href="/explore/"]',
      'a[href^="/explore/"]',
      'a:has(svg[aria-label*="Explore" i])',
      'a:has(svg[aria-label*="Explorar" i])'
    ],
    stories: [
      'div[aria-label="Stories" i]',
      'a[href^="/stories/"]',
      'main section div[role="presentation"]:has(ul li button canvas)'
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
    ],
    games: [
      'a[href*="/gaming/"]',
      'a[href*="/games/"]',
      'div[aria-label="Gaming" i]',
      'div[aria-label="Jogos" i]',
      'a[aria-label="Gaming" i]',
      'a[aria-label="Jogos" i]'
    ]
  },
  linkedin: {
    videos: [
      'a[href*="/feed/video"]',
      'a[href*="/video/"]',
      'div[data-view-name="feed-short-video-shelf"]',
      'section:has(a[href*="/video/"])'
    ],
    games: [
      'a[href*="/games/"]',
      'aside section:has(a[href*="/games/"])',
      '.feed-shared-update-v2:has(a[href*="/games/"])',
      '[data-view-name*="game"]'
    ],
    news: [
      '#feed-news-module',
      '.news-module',
      'aside section:has(#feed-news-module)',
      '[data-view-name="news-module"]'
    ]
  },
  x: {
    forYou: [
      'div[role="tablist"] > div[role="presentation"]:first-child:has(a[href="/home"][role="tab"])'
    ],
    trends: [
      '[aria-label="Timeline: Trending now"]',
      '[data-testid="trend"]',
      '[data-testid="sidebarColumn"] section:has([data-testid="trend"])'
    ],
    explore: [
      'a[data-testid="AppTabBar_Explore_Link"]',
      'a[href="/explore"]'
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
  blockInstagramExplore: false,
  blockInstagramStories: false,
  blockFacebookReels: true,
  blockFacebookStories: false,
  blockFacebookGames: true,
  blockLinkedinVideos: true,
  blockLinkedinGames: true,
  blockLinkedinNews: false,
  blockXForYou: false,
  blockXTrends: true,
  blockXExplore: false,
  snoozeUntil: null,
  focusScheduleEnabled: false,
  focusStartTime: "09:00",
  focusEndTime: "17:00",
  focusDays: [1, 2, 3, 4, 5],
  isPaidUser: false,
  showExtensionIcon: true,
  isDarkMode: false
};

const getPlatform = () => {
  const host = window.location.hostname;
  if (host.includes('youtube.com')) return 'youtube';
  if (host.includes('instagram.com')) return 'instagram';
  if (host.includes('facebook.com')) return 'facebook';
  if (host.includes('linkedin.com')) return 'linkedin';
  if (host.includes('x.com') || host.includes('twitter.com')) return 'x';
  return null;
};

const isSnoozed = () => {
  return Boolean(currentConfig.snoozeUntil && Date.now() < currentConfig.snoozeUntil);
};

const isWithinFocusSchedule = () => {
  if (!currentConfig.focusScheduleEnabled) return true;

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

const isBlockingActive = () => {
  return !isSnoozed() && isWithinFocusSchedule();
};

const handleDirectUrlRedirects = () => {
  const platform = getPlatform();
  if (!platform || !isBlockingActive()) return;

  const path = window.location.pathname;

  if (platform === 'youtube' && currentConfig.blockYoutubeShorts) {
    if (path.startsWith('/shorts')) {
      const segments = path.split('/').filter(Boolean);
      const videoId = segments[1];
      const targetUrl = videoId
        ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
        : 'https://www.youtube.com/';
      window.location.replace(targetUrl);
    }
  } else if (platform === 'instagram') {
    if (currentConfig.blockInstagramReels && (path.startsWith('/reels') || path.startsWith('/reel/'))) {
      window.location.replace('https://www.instagram.com/');
    } else if (currentConfig.blockInstagramExplore && path.startsWith('/explore')) {
      window.location.replace('https://www.instagram.com/');
    } else if (currentConfig.blockInstagramStories && path.startsWith('/stories/')) {
      window.location.replace('https://www.instagram.com/');
    }
  } else if (platform === 'facebook' && currentConfig.blockFacebookReels) {
    if (path.startsWith('/reel') || path.startsWith('/reels')) {
      window.location.replace('https://www.facebook.com/');
    }
  } else if (platform === 'linkedin' && currentConfig.blockLinkedinGames) {
    if (path.startsWith('/games')) {
      window.location.replace('https://www.linkedin.com/feed/');
    }
  } else if (platform === 'x' && currentConfig.blockXExplore) {
    if (path.startsWith('/explore')) {
      window.location.replace('https://x.com/home');
    }
  }
};

const injectStyles = () => {
  const platform = getPlatform();
  if (!platform) return;

  const existing = document.getElementById('noreels-fix-styles');

  if (!isBlockingActive()) {
    if (existing) existing.remove();
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
    if (currentConfig.blockInstagramExplore) activeSelectors.push(...SELECTORS.instagram.explore);
    if (currentConfig.blockInstagramStories) activeSelectors.push(...SELECTORS.instagram.stories);
  } else if (platform === 'facebook') {
    if (currentConfig.blockFacebookReels) activeSelectors.push(...SELECTORS.facebook.reels);
    if (currentConfig.blockFacebookStories) activeSelectors.push(...SELECTORS.facebook.stories);
    if (currentConfig.blockFacebookGames) activeSelectors.push(...SELECTORS.facebook.games);
  } else if (platform === 'linkedin') {
    if (currentConfig.blockLinkedinVideos) activeSelectors.push(...SELECTORS.linkedin.videos);
    if (currentConfig.blockLinkedinGames) activeSelectors.push(...SELECTORS.linkedin.games);
    if (currentConfig.blockLinkedinNews) activeSelectors.push(...SELECTORS.linkedin.news);
  } else if (platform === 'x') {
    if (currentConfig.blockXForYou) activeSelectors.push(...SELECTORS.x.forYou);
    if (currentConfig.blockXTrends) activeSelectors.push(...SELECTORS.x.trends);
    if (currentConfig.blockXExplore) activeSelectors.push(...SELECTORS.x.explore);
  }

  const newStyleContent = `
    ${activeSelectors.length > 0 ? activeSelectors.join(',\n') + ' { display: none !important; }' : ''}
    ${customCSS}
  `;

  if (existing) {
    if (existing.innerHTML !== newStyleContent) {
      existing.innerHTML = newStyleContent;
    }
    return;
  }

  const style = document.createElement('style');
  style.id = 'noreels-fix-styles';
  style.innerHTML = newStyleContent;
  (document.head || document.documentElement).appendChild(style);
};

let pendingMetrics = { youtube: 0, instagram: 0, facebook: 0, linkedin: 0, x: 0 };
let isFlushingMetrics = false;

const flushMetrics = () => {
  if (isFlushingMetrics) return;
  const toFlush = { ...pendingMetrics };
  const totalNew = toFlush.youtube + toFlush.instagram + toFlush.facebook + toFlush.linkedin + toFlush.x;
  if (totalNew === 0) return;

  pendingMetrics = { youtube: 0, instagram: 0, facebook: 0, linkedin: 0, x: 0 };
  isFlushingMetrics = true;

  chrome.storage.local.get(['totalBlocked', 'statsByPlatform', 'statsHistory'], (result) => {
    const totalBlocked = (result.totalBlocked || 0) + totalNew;

    const statsByPlatform = result.statsByPlatform || { youtube: 0, instagram: 0, facebook: 0, linkedin: 0, x: 0 };
    const todayStr = new Date().toISOString().split('T')[0];
    const statsHistory = result.statsHistory || {};
    if (!statsHistory[todayStr]) {
      statsHistory[todayStr] = { youtube: 0, instagram: 0, facebook: 0, linkedin: 0, x: 0 };
    }

    ['youtube', 'instagram', 'facebook', 'linkedin', 'x'].forEach((plat) => {
      if (toFlush[plat] > 0) {
        statsByPlatform[plat] = (statsByPlatform[plat] || 0) + toFlush[plat];
        statsHistory[todayStr][plat] = (statsHistory[todayStr][plat] || 0) + toFlush[plat];
      }
    });

    chrome.storage.local.set({ totalBlocked, statsByPlatform, statsHistory }, () => {
      isFlushingMetrics = false;
      if (pendingMetrics.youtube + pendingMetrics.instagram + pendingMetrics.facebook + pendingMetrics.linkedin + pendingMetrics.x > 0) {
        flushMetrics();
      }
    });
  });
};

const updateMetrics = (platform, blockedCount) => {
  if (!platform || blockedCount <= 0) return;
  pendingMetrics[platform] = (pendingMetrics[platform] || 0) + blockedCount;
  flushMetrics();
};

const processBlocks = () => {
  const platform = getPlatform();
  if (!platform || !isBlockingActive()) return;

  let newlyBlocked = 0;
  const selectorsToCount = [];

  if (platform === 'youtube') {
    if (currentConfig.blockYoutubeShorts) selectorsToCount.push(...SELECTORS.youtube.shorts);
    if (currentConfig.blockYoutubeGames) selectorsToCount.push(...SELECTORS.youtube.games);
  } else if (platform === 'instagram') {
    if (currentConfig.blockInstagramReels) selectorsToCount.push(...SELECTORS.instagram.reels);
    if (currentConfig.blockInstagramExplore) selectorsToCount.push(...SELECTORS.instagram.explore);
    if (currentConfig.blockInstagramStories) selectorsToCount.push(...SELECTORS.instagram.stories);
  } else if (platform === 'facebook') {
    if (currentConfig.blockFacebookReels) selectorsToCount.push(...SELECTORS.facebook.reels);
    if (currentConfig.blockFacebookStories) selectorsToCount.push(...SELECTORS.facebook.stories);
    if (currentConfig.blockFacebookGames) selectorsToCount.push(...SELECTORS.facebook.games);
  } else if (platform === 'linkedin') {
    if (currentConfig.blockLinkedinVideos) selectorsToCount.push(...SELECTORS.linkedin.videos);
    if (currentConfig.blockLinkedinGames) selectorsToCount.push(...SELECTORS.linkedin.games);
    if (currentConfig.blockLinkedinNews) selectorsToCount.push(...SELECTORS.linkedin.news);
  } else if (platform === 'x') {
    if (currentConfig.blockXForYou) selectorsToCount.push(...SELECTORS.x.forYou);
    if (currentConfig.blockXTrends) selectorsToCount.push(...SELECTORS.x.trends);
    if (currentConfig.blockXExplore) selectorsToCount.push(...SELECTORS.x.explore);
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

const injectPlatformSidebarButton = () => {
  const platform = getPlatform();
  if (platform === 'youtube') {
    injectYoutubeSidebarButton();
  } else if (platform === 'facebook') {
    injectFacebookSidebarButton();
  } else if (platform === 'instagram') {
    injectInstagramSidebarButton();
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
    'blockInstagramExplore',
    'blockInstagramStories',
    'blockFacebookReels',
    'blockFacebookStories',
    'blockFacebookGames',
    'blockLinkedinVideos',
    'blockLinkedinGames',
    'blockLinkedinNews',
    'blockXForYou',
    'blockXTrends',
    'blockXExplore',
    'snoozeUntil',
    'focusScheduleEnabled',
    'focusStartTime',
    'focusEndTime',
    'focusDays',
    'isPaidUser',
    'showExtensionIcon',
    'isDarkMode'
  ], (result) => {
    currentConfig = {
      blockYoutubeShorts: result.blockYoutubeShorts !== false,
      blockYoutubeGames: result.blockYoutubeGames !== false,
      blockYoutubeComments: result.blockYoutubeComments === true,
      blockYoutubeHome: result.blockYoutubeHome === true,
      blockYoutubeVideoRec: result.blockYoutubeVideoRec === true,
      blockInstagramReels: result.blockInstagramReels !== false,
      blockInstagramExplore: result.blockInstagramExplore === true,
      blockInstagramStories: result.blockInstagramStories === true,
      blockFacebookReels: result.blockFacebookReels !== false,
      blockFacebookStories: result.blockFacebookStories === true,
      blockFacebookGames: result.blockFacebookGames !== false,
      blockLinkedinVideos: result.blockLinkedinVideos !== false,
      blockLinkedinGames: result.blockLinkedinGames !== false,
      blockLinkedinNews: result.blockLinkedinNews === true,
      blockXForYou: result.blockXForYou === true,
      blockXTrends: result.blockXTrends !== false,
      blockXExplore: result.blockXExplore === true,
      snoozeUntil: result.snoozeUntil || null,
      focusScheduleEnabled: result.focusScheduleEnabled === true,
      focusStartTime: result.focusStartTime || "09:00",
      focusEndTime: result.focusEndTime || "17:00",
      focusDays: result.focusDays || [1, 2, 3, 4, 5],
      isPaidUser: result.isPaidUser === true,
      showExtensionIcon: result.showExtensionIcon !== false,
      isDarkMode: result.isDarkMode === true
    };
    handleDirectUrlRedirects();
    injectStyles();
    processBlocks();
    injectPlatformSidebarButton();
  });
};

const applyDropdownTheme = (dropdownId, defaultLightBg, defaultLightText, defaultLightBorder) => {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  const isDark = currentConfig.isDarkMode;
  const bg = isDark ? '#1a1a1a' : defaultLightBg;
  const text = isDark ? '#FFFFFF' : defaultLightText;
  const border = isDark ? '#444444' : defaultLightBorder;

  dropdown.style.background = bg;
  dropdown.style.color = text;
  dropdown.style.borderColor = border;
  const title = dropdown.querySelector('h3');
  if (title) {
    title.style.borderColor = border;
    title.style.color = text;
  }
  dropdown.querySelectorAll('span').forEach(span => {
    if (!span.style.backgroundColor && !span.style.borderRadius) {
      span.style.color = text;
    }
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
  if (changes.blockInstagramExplore !== undefined) { currentConfig.blockInstagramExplore = changes.blockInstagramExplore.newValue; changed = true; }
  if (changes.blockInstagramStories !== undefined) { currentConfig.blockInstagramStories = changes.blockInstagramStories.newValue; changed = true; }
  if (changes.blockFacebookReels !== undefined) { currentConfig.blockFacebookReels = changes.blockFacebookReels.newValue; changed = true; }
  if (changes.blockFacebookStories !== undefined) { currentConfig.blockFacebookStories = changes.blockFacebookStories.newValue; changed = true; }
  if (changes.blockFacebookGames !== undefined) { currentConfig.blockFacebookGames = changes.blockFacebookGames.newValue; changed = true; }
  if (changes.blockLinkedinVideos !== undefined) { currentConfig.blockLinkedinVideos = changes.blockLinkedinVideos.newValue; changed = true; }
  if (changes.blockLinkedinGames !== undefined) { currentConfig.blockLinkedinGames = changes.blockLinkedinGames.newValue; changed = true; }
  if (changes.blockLinkedinNews !== undefined) { currentConfig.blockLinkedinNews = changes.blockLinkedinNews.newValue; changed = true; }
  if (changes.blockXForYou !== undefined) { currentConfig.blockXForYou = changes.blockXForYou.newValue; changed = true; }
  if (changes.blockXTrends !== undefined) { currentConfig.blockXTrends = changes.blockXTrends.newValue; changed = true; }
  if (changes.blockXExplore !== undefined) { currentConfig.blockXExplore = changes.blockXExplore.newValue; changed = true; }
  if (changes.snoozeUntil !== undefined) { currentConfig.snoozeUntil = changes.snoozeUntil.newValue; changed = true; }
  if (changes.focusScheduleEnabled !== undefined) { currentConfig.focusScheduleEnabled = changes.focusScheduleEnabled.newValue; changed = true; }
  if (changes.focusStartTime !== undefined) { currentConfig.focusStartTime = changes.focusStartTime.newValue; changed = true; }
  if (changes.focusEndTime !== undefined) { currentConfig.focusEndTime = changes.focusEndTime.newValue; changed = true; }
  if (changes.focusDays !== undefined) { currentConfig.focusDays = changes.focusDays.newValue; changed = true; }
  if (changes.isPaidUser !== undefined) { currentConfig.isPaidUser = changes.isPaidUser.newValue; changed = true; }
  if (changes.showExtensionIcon !== undefined) { currentConfig.showExtensionIcon = changes.showExtensionIcon.newValue; changed = true; }
  if (changes.isDarkMode !== undefined) { 
    currentConfig.isDarkMode = changes.isDarkMode.newValue; 
    changed = true; 
    
    applyDropdownTheme(
      'noreels-sidebar-dropdown',
      'var(--yt-spec-base-background, #ffffff)',
      'var(--yt-spec-text-primary, #0f0f0f)',
      'var(--yt-spec-10-percent-layer, #e5e5e5)'
    );
    applyDropdownTheme('noreels-fb-dropdown', '#ffffff', '#050505', '#ced0d4');
    applyDropdownTheme('noreels-ig-dropdown', '#ffffff', '#000000', '#dbdbdb');
  }
  
  if (changed) {
    handleDirectUrlRedirects();
    injectStyles();
    processBlocks();
    injectPlatformSidebarButton();
  }
});

loadConfig();

const injectYoutubeSidebarButton = () => {
  const existingBtn = document.getElementById('noreels-sidebar-button');
  const existingDropdown = document.getElementById('noreels-sidebar-dropdown');
  
  if (!currentConfig.showExtensionIcon) {
    if (existingBtn) existingBtn.remove();
    if (existingDropdown) existingDropdown.remove();
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

  if (existingDropdown) existingDropdown.remove();

  // Create Dropdown Modal (Fixed to screen to avoid sidebar overflow)
  const dropdown = document.createElement('div');
  dropdown.id = 'noreels-sidebar-dropdown';
  
  const bg = currentConfig.isDarkMode ? '#1a1a1a' : 'var(--yt-spec-base-background, #ffffff)';
  const border = currentConfig.isDarkMode ? '#444444' : 'var(--yt-spec-10-percent-layer, #e5e5e5)';
  const textClr = currentConfig.isDarkMode ? '#FFFFFF' : 'var(--yt-spec-text-primary, #0f0f0f)';
  
  dropdown.style.cssText = `
    display: none;
    position: fixed;
    top: 50%;
    left: 80px;
    transform: translateY(-50%);
    width: 300px;
    background: ${bg};
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    border: 1px solid ${border};
    z-index: 9999;
    padding: 16px;
    font-family: 'Roboto', 'Arial', sans-serif;
    color: ${textClr};
    cursor: default;
  `;

  // Dropdown Title
  const title = document.createElement('h3');
  title.textContent = 'NoReels Config';
  title.style.cssText = `margin: 0 0 12px 0; font-size: 16px; font-weight: 500; border-bottom: 1px solid ${border}; padding-bottom: 8px; color: ${textClr};`;
  dropdown.appendChild(title);

  // Toggles
  const toggles = [
    { id: 'yt-shorts', key: 'blockYoutubeShorts', label: 'Block Shorts' },
    { id: 'yt-games', key: 'blockYoutubeGames', label: 'Block Games' },
    { id: 'yt-comments', key: 'blockYoutubeComments', label: 'Block Comments' },
    { id: 'yt-home', key: 'blockYoutubeHome', label: 'Block Home Recs' },
    { id: 'yt-video-rec', key: 'blockYoutubeVideoRec', label: 'Block Video Recs' }
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

  const warningText = document.createElement('p');
  warningText.textContent = chrome.i18n ? chrome.i18n.getMessage('removeMenuWarning') || 'You can hide this menu in the extension settings.' : 'You can hide this menu in the extension settings.';
  warningText.style.cssText = `margin: 10px 0 0 0; font-size: 11px; text-align: center; color: ${currentConfig.isDarkMode ? '#888888' : '#777777'};`;
  dropdown.appendChild(warningText);

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

const injectFacebookSidebarButton = () => {
  const existingBtn = document.getElementById('noreels-fb-sidebar-button');
  const existingDropdown = document.getElementById('noreels-fb-dropdown');
  
  if (!currentConfig.showExtensionIcon) {
    if (existingBtn) existingBtn.remove();
    if (existingDropdown) existingDropdown.remove();
    return;
  }
  
  if (existingBtn) return;

  const reelsLink = document.querySelector('a[href^="/reels/"], a[href*="/reel/"], div[aria-label="Reels"], a[href*="/watch/"]');
  if (!reelsLink) return;
  
  const reelsItem = reelsLink.closest('li') || reelsLink.closest('div[role="listitem"]') || reelsLink.parentElement;
  if (!reelsItem || !reelsItem.parentElement) return;

  const parentList = reelsItem.parentElement;

  const btnContainer = document.createElement('div');
  btnContainer.id = 'noreels-fb-sidebar-button';
  btnContainer.style.cssText = 'display: flex; align-items: center; padding: 8px; cursor: pointer; border-radius: 8px; margin: 4px 8px;';
  
  btnContainer.addEventListener('mouseover', () => {
    btnContainer.style.backgroundColor = currentConfig.isDarkMode || document.documentElement.classList.contains('__fb-dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  });
  btnContainer.addEventListener('mouseout', () => {
    btnContainer.style.backgroundColor = 'transparent';
  });

  const icon = document.createElement('img');
  icon.src = chrome.runtime.getURL('images/icon.png');
  const isDark = currentConfig.isDarkMode || document.documentElement.classList.contains('__fb-dark-mode');
  icon.style.cssText = `width: 24px; height: 24px; border-radius: 50%; box-sizing: border-box; ${isDark ? 'background-color: #ffffff; padding: 2px;' : ''} margin-right: 12px;`;
  
  btnContainer.appendChild(icon);

  const label = document.createElement('span');
  label.textContent = 'NoReels';
  label.style.cssText = 'font-size: 15px; font-weight: 500; font-family: Segoe UI, Helvetica, Arial, sans-serif; color: ' + (isDark ? '#E4E6EB' : '#050505') + ';';
  btnContainer.appendChild(label);

  if (existingDropdown) existingDropdown.remove();

  const dropdown = document.createElement('div');
  dropdown.id = 'noreels-fb-dropdown';
  
  const bg = currentConfig.isDarkMode ? '#1a1a1a' : '#ffffff';
  const border = currentConfig.isDarkMode ? '#444444' : '#ced0d4';
  const textClr = currentConfig.isDarkMode ? '#FFFFFF' : '#050505';
  
  dropdown.style.cssText = `
    display: none;
    position: fixed;
    top: 50%;
    left: 80px;
    transform: translateY(-50%);
    width: 300px;
    background: ${bg};
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    border: 1px solid ${border};
    z-index: 9999;
    padding: 16px;
    font-family: Segoe UI, Helvetica, Arial, sans-serif;
    color: ${textClr};
    cursor: default;
  `;

  const title = document.createElement('h3');
  title.textContent = 'NoReels Config';
  title.style.cssText = `margin: 0 0 12px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid ${border}; padding-bottom: 8px; color: ${textClr};`;
  dropdown.appendChild(title);

  const toggles = [
    { id: 'fb-reels', key: 'blockFacebookReels', label: 'Block Reels' },
    { id: 'fb-stories', key: 'blockFacebookStories', label: 'Block Stories' },
    { id: 'fb-games', key: 'blockFacebookGames', label: 'Block Games' }
  ];

  toggles.forEach(t => {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 14px;';
    
    const lblSpan = document.createElement('span');
    lblSpan.textContent = chrome.i18n ? chrome.i18n.getMessage(t.key === 'blockFacebookReels' ? 'blockReels' : 
                                                            t.key === 'blockFacebookStories' ? 'blockStories' :
                                                            'blockGames') || t.label : t.label;

    const toggleWrap = document.createElement('label');
    toggleWrap.style.cssText = 'position: relative; display: inline-block; width: 34px; height: 20px; cursor: pointer;';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.style.cssText = 'opacity: 0; width: 0; height: 0; position: absolute;';
    input.checked = currentConfig[t.key];
    
    const slider = document.createElement('span');
    slider.style.cssText = `
      position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
      background-color: ${input.checked ? '#1877F2' : (currentConfig.isDarkMode ? '#444' : '#ccc')};
      transition: .4s; border-radius: 20px;
    `;
    
    const circle = document.createElement('span');
    circle.style.cssText = `
      position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px;
      background-color: white; transition: .4s; border-radius: 50%;
      transform: ${input.checked ? 'translateX(14px)' : 'none'};
    `;
    
    slider.appendChild(circle);
    toggleWrap.appendChild(input);
    toggleWrap.appendChild(slider);

    input.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      slider.style.backgroundColor = isChecked ? '#1877F2' : (currentConfig.isDarkMode ? '#444' : '#ccc');
      circle.style.transform = isChecked ? 'translateX(14px)' : 'none';
      
      const updateObj = {};
      updateObj[t.key] = isChecked;
      chrome.storage.local.set(updateObj);
    });

    row.appendChild(lblSpan);
    row.appendChild(toggleWrap);
    dropdown.appendChild(row);
  });

  const warningTextFb = document.createElement('p');
  warningTextFb.textContent = chrome.i18n ? chrome.i18n.getMessage('removeMenuWarning') || 'You can hide this menu in the extension settings.' : 'You can hide this menu in the extension settings.';
  warningTextFb.style.cssText = `margin: 10px 0 0 0; font-size: 11px; text-align: center; color: ${currentConfig.isDarkMode ? '#888888' : '#777777'};`;
  dropdown.appendChild(warningTextFb);

  const adSlot = document.createElement('div');
  adSlot.id = 'noreels-fb-ad';
  adSlot.style.cssText = `margin-top: 15px; display: flex; justify-content: center; min-height: 50px; border-top: 1px solid ${border}; padding-top: 15px;`;
  dropdown.appendChild(adSlot);

  document.body.appendChild(dropdown);

  btnContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = dropdown.style.display === 'block';
    
    if (isVisible) {
      dropdown.style.display = 'none';
    } else {
      const rect = btnContainer.getBoundingClientRect();
      dropdown.style.left = `${rect.right + 10}px`;
      dropdown.style.top = `${rect.top}px`;
      dropdown.style.transform = 'none';
      
      dropdown.style.display = 'block';
      
      if (typeof AdsOnBread !== 'undefined') {
        try {
          AdsOnBread.load('b84f1d67-0435-4fe5-8498-3bb6f7a1ee1f', 'banner', document.getElementById('noreels-fb-ad'), {
            theme: currentConfig.isDarkMode ? 'dark' : 'light'
          });
        } catch (err) {
          console.error('AdsOnBread load error:', err);
        }
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (!btnContainer.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  parentList.insertBefore(btnContainer, reelsItem.nextSibling);
};

const injectInstagramSidebarButton = () => {
  const existingBtn = document.getElementById('noreels-ig-sidebar-button');
  const existingDropdown = document.getElementById('noreels-ig-dropdown');

  if (!currentConfig.showExtensionIcon) {
    if (existingBtn) existingBtn.remove();
    if (existingDropdown) existingDropdown.remove();
    return;
  }

  if (existingBtn) return;

  const reelsLink = document.querySelector('a[href^="/reels/"], a[href*="/reel/"]');
  if (!reelsLink) return;

  const reelsItem = reelsLink.closest('span') || reelsLink.parentElement;
  if (!reelsItem || !reelsItem.parentElement) return;

  const parentList = reelsItem.parentElement;

  const btnContainer = document.createElement('div');
  btnContainer.id = 'noreels-ig-sidebar-button';
  btnContainer.style.cssText = 'display: flex; align-items: center; padding: 12px; cursor: pointer; border-radius: 8px; margin: 4px 0; transition: background-color 0.2s;';

  const isIgDark = currentConfig.isDarkMode || document.documentElement.classList.contains('_aa4d') || window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)';

  btnContainer.addEventListener('mouseover', () => {
    btnContainer.style.backgroundColor = isIgDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  });
  btnContainer.addEventListener('mouseout', () => {
    btnContainer.style.backgroundColor = 'transparent';
  });

  const icon = document.createElement('img');
  icon.src = chrome.runtime.getURL('images/icon.png');
  icon.style.cssText = `width: 24px; height: 24px; border-radius: 50%; box-sizing: border-box; ${isIgDark ? 'background-color: #ffffff; padding: 2px;' : ''} margin-right: 16px; flex-shrink: 0;`;
  btnContainer.appendChild(icon);

  const label = document.createElement('span');
  label.textContent = 'NoReels';
  label.style.cssText = `font-size: 16px; font-weight: 400; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: ${isIgDark ? '#F5F5F5' : '#000000'};`;
  btnContainer.appendChild(label);

  if (existingDropdown) existingDropdown.remove();

  const dropdown = document.createElement('div');
  dropdown.id = 'noreels-ig-dropdown';

  const bg = currentConfig.isDarkMode ? '#1a1a1a' : '#ffffff';
  const border = currentConfig.isDarkMode ? '#444444' : '#dbdbdb';
  const textClr = currentConfig.isDarkMode ? '#FFFFFF' : '#000000';

  dropdown.style.cssText = `
    display: none;
    position: fixed;
    top: 50%;
    left: 80px;
    transform: translateY(-50%);
    width: 300px;
    background: ${bg};
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    border: 1px solid ${border};
    z-index: 9999;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: ${textClr};
    cursor: default;
  `;

  const title = document.createElement('h3');
  title.textContent = 'NoReels Config';
  title.style.cssText = `margin: 0 0 12px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid ${border}; padding-bottom: 8px; color: ${textClr};`;
  dropdown.appendChild(title);

  const toggles = [
    { id: 'ig-reels', key: 'blockInstagramReels', i18nKey: 'blockReels', label: 'Block Reels' },
    { id: 'ig-explore', key: 'blockInstagramExplore', i18nKey: 'blockExplore', label: 'Block Explore' },
    { id: 'ig-stories', key: 'blockInstagramStories', i18nKey: 'blockStories', label: 'Block Stories' }
  ];

  toggles.forEach(t => {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 14px;';

    const lblSpan = document.createElement('span');
    lblSpan.textContent = chrome.i18n ? chrome.i18n.getMessage(t.i18nKey) || t.label : t.label;

    const toggleWrap = document.createElement('label');
    toggleWrap.style.cssText = 'position: relative; display: inline-block; width: 34px; height: 20px; cursor: pointer;';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.style.cssText = 'opacity: 0; width: 0; height: 0; position: absolute;';
    input.checked = currentConfig[t.key];

    const slider = document.createElement('span');
    slider.style.cssText = `
      position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
      background-color: ${input.checked ? '#E1306C' : (currentConfig.isDarkMode ? '#444' : '#ccc')};
      transition: .4s; border-radius: 20px;
    `;

    const circle = document.createElement('span');
    circle.style.cssText = `
      position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px;
      background-color: white; transition: .4s; border-radius: 50%;
      transform: ${input.checked ? 'translateX(14px)' : 'none'};
    `;

    slider.appendChild(circle);
    toggleWrap.appendChild(input);
    toggleWrap.appendChild(slider);

    input.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      slider.style.backgroundColor = isChecked ? '#E1306C' : (currentConfig.isDarkMode ? '#444' : '#ccc');
      circle.style.transform = isChecked ? 'translateX(14px)' : 'none';
      chrome.storage.local.set({ [t.key]: isChecked });
    });

    row.appendChild(lblSpan);
    row.appendChild(toggleWrap);
    dropdown.appendChild(row);
  });

  const warningTextIg = document.createElement('p');
  warningTextIg.textContent = chrome.i18n ? chrome.i18n.getMessage('removeMenuWarning') || 'You can hide this menu in the extension settings.' : 'You can hide this menu in the extension settings.';
  warningTextIg.style.cssText = `margin: 10px 0 0 0; font-size: 11px; text-align: center; color: ${currentConfig.isDarkMode ? '#888888' : '#777777'};`;
  dropdown.appendChild(warningTextIg);

  const adSlot = document.createElement('div');
  adSlot.id = 'noreels-ig-ad';
  adSlot.style.cssText = `margin-top: 15px; display: flex; justify-content: center; min-height: 50px; border-top: 1px solid ${border}; padding-top: 15px;`;
  dropdown.appendChild(adSlot);

  document.body.appendChild(dropdown);

  btnContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = dropdown.style.display === 'block';

    if (isVisible) {
      dropdown.style.display = 'none';
    } else {
      const rect = btnContainer.getBoundingClientRect();
      dropdown.style.left = `${rect.right + 10}px`;
      dropdown.style.top = `${rect.top}px`;
      dropdown.style.transform = 'none';

      dropdown.style.display = 'block';

      if (typeof AdsOnBread !== 'undefined') {
        try {
          AdsOnBread.load('b84f1d67-0435-4fe5-8498-3bb6f7a1ee1f', 'banner', document.getElementById('noreels-ig-ad'), {
            theme: currentConfig.isDarkMode ? 'dark' : 'light'
          });
        } catch (err) {
          console.error('AdsOnBread load error:', err);
        }
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (!btnContainer.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  parentList.insertBefore(btnContainer, reelsItem.nextSibling);
};

let observerDebounceTimer = null;

const observer = new MutationObserver(() => {
  const platform = getPlatform();
  if (!platform) return;

  // Keep style injection immediate to prevent visual flicker
  if (isBlockingActive() && !document.getElementById('noreels-fix-styles')) {
    injectStyles();
  }

  // Debounce heavy DOM queries and sidebar injection
  if (observerDebounceTimer) return;
  observerDebounceTimer = setTimeout(() => {
    observerDebounceTimer = null;
    handleDirectUrlRedirects();
    injectStyles();
    processBlocks();
    injectPlatformSidebarButton();
  }, 200);
});

observer.observe(document.documentElement, { childList: true, subtree: true });