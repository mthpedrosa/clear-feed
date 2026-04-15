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
    ]
  },
  instagram: {
    reels: [
      'a[href^="/reels/"]', 
      'a[href*="/reel/"]', 
      'svg[aria-label*="Reels"]',
      'div[aria-label="Reels"]'
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
  blockYoutubeComments: true,
  blockYoutubeHome: true,
  blockYoutubeVideoRec: true,
  blockInstagramReels: true,
  blockFacebookReels: true,
  blockFacebookStories: true
};

const getPlatform = () => {
  const host = window.location.hostname;
  if (host.includes('youtube.com')) return 'youtube';
  if (host.includes('instagram.com')) return 'instagram';
  if (host.includes('facebook.com')) return 'facebook';
  return null;
};

const injectStyles = () => {
  const platform = getPlatform();
  if (!platform) return;

  const existing = document.getElementById('noreels-fix-styles');
  if (existing) existing.remove();

  const activeSelectors = [];
  let customCSS = '';

  if (platform === 'youtube') {
    if (currentConfig.blockYoutubeShorts) activeSelectors.push(...SELECTORS.youtube.shorts);
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

const updateMetrics = (blockedCount) => {
  chrome.storage.local.get(['totalBlocked'], (result) => {
    const totalBlocked = (result.totalBlocked || 0) + blockedCount;
    chrome.storage.local.set({ totalBlocked });
  });
};

const processBlocks = () => {
  const platform = getPlatform();
  if (!platform) return;

  let newlyBlocked = 0;
  const selectorsToCount = [];

  if (platform === 'youtube' && currentConfig.blockYoutubeShorts) {
    selectorsToCount.push(...SELECTORS.youtube.shorts);
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
    updateMetrics(newlyBlocked);
  }
};

const loadConfig = () => {
  chrome.storage.local.get([
    'blockYoutubeShorts', 
    'blockYoutubeComments',
    'blockYoutubeHome',
    'blockYoutubeVideoRec',
    'blockInstagramReels', 
    'blockFacebookReels',
    'blockFacebookStories'
  ], (result) => {
    currentConfig = {
      blockYoutubeShorts: result.blockYoutubeShorts !== false,
      blockYoutubeComments: result.blockYoutubeComments !== false,
      blockYoutubeHome: result.blockYoutubeHome !== false,
      blockYoutubeVideoRec: result.blockYoutubeVideoRec !== false,
      blockInstagramReels: result.blockInstagramReels !== false,
      blockFacebookReels: result.blockFacebookReels !== false,
      blockFacebookStories: result.blockFacebookStories !== false
    };
    injectStyles();
    processBlocks();
  });
};

chrome.storage.onChanged.addListener((changes) => {
  let changed = false;
  if (changes.blockYoutubeShorts) { currentConfig.blockYoutubeShorts = changes.blockYoutubeShorts.newValue; changed = true; }
  if (changes.blockYoutubeComments) { currentConfig.blockYoutubeComments = changes.blockYoutubeComments.newValue; changed = true; }
  if (changes.blockYoutubeHome) { currentConfig.blockYoutubeHome = changes.blockYoutubeHome.newValue; changed = true; }
  if (changes.blockYoutubeVideoRec) { currentConfig.blockYoutubeVideoRec = changes.blockYoutubeVideoRec.newValue; changed = true; }
  if (changes.blockInstagramReels) { currentConfig.blockInstagramReels = changes.blockInstagramReels.newValue; changed = true; }
  if (changes.blockFacebookReels) { currentConfig.blockFacebookReels = changes.blockFacebookReels.newValue; changed = true; }
  if (changes.blockFacebookStories) { currentConfig.blockFacebookStories = changes.blockFacebookStories.newValue; changed = true; }
  
  if (changed) {
    injectStyles();
    processBlocks();
  }
});

loadConfig();

const observer = new MutationObserver(() => {
  const platform = getPlatform();
  if (platform) {
    if (!document.getElementById('noreels-fix-styles')) {
      injectStyles();
    }
    processBlocks();
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });