const AVG_REEL_TIME_SECONDS = 30;

const CONFIG_KEYS = {
  'yt-shorts': 'blockYoutubeShorts',
  'yt-comments': 'blockYoutubeComments',
  'yt-home': 'blockYoutubeHome',
  'yt-video-rec': 'blockYoutubeVideoRec',
  'ig-reels': 'blockInstagramReels',
  'fb-reels': 'blockFacebookReels',
  'fb-stories': 'blockFacebookStories'
};

function formatTimeSaved(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function updateUI() {
  const keys = Object.values(CONFIG_KEYS).concat(['totalBlocked', 'installDate']);

  chrome.storage.local.get(keys, (result) => {
    // load toggles (reels default to true, others to false)
    Object.entries(CONFIG_KEYS).forEach(([elementId, storageKey]) => {
      const defaultTrue = ['blockYoutubeShorts', 'blockInstagramReels', 'blockFacebookReels'].includes(storageKey);
      const isEnabled = result[storageKey] !== undefined ? result[storageKey] : defaultTrue;
      const el = document.getElementById(elementId);
      if (el) el.checked = isEnabled;
    });

    // load  metrics
    const totalBlocked = result.totalBlocked || 0;
    const timeSavedSeconds = totalBlocked * AVG_REEL_TIME_SECONDS;

    const totalBlockedEl = document.getElementById('total-blocked');
    const timeSavedEl = document.getElementById('time-saved');
    
    if (totalBlockedEl) totalBlockedEl.textContent = totalBlocked.toLocaleString();
    if (timeSavedEl) timeSavedEl.textContent = formatTimeSaved(timeSavedSeconds);
  });
}

// save toggles when the toggle changes
function setupEventListeners() {
  Object.entries(CONFIG_KEYS).forEach(([elementId, storageKey]) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.addEventListener('change', (e) => {
        chrome.storage.local.set({ [storageKey]: e.target.checked });
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  setupEventListeners();
  // runtime i18n fallback for cases where __MSG_...__ isn't replaced
  try {
    const affiliateEl = document.querySelector('.affiliate-message');
    if (affiliateEl && chrome && chrome.i18n && chrome.i18n.getMessage) {
      const msg = chrome.i18n.getMessage('affiliateMessage');
      if (msg) affiliateEl.textContent = msg;
    }
  } catch (e) {
    // ignore
  }
});
