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
    // load toggles (default: true)
    Object.entries(CONFIG_KEYS).forEach(([elementId, storageKey]) => {
      const isEnabled = result[storageKey] !== false;
      document.getElementById(elementId).checked = isEnabled;
    });

    // load  metrics
    const totalBlocked = result.totalBlocked || 0;
    const timeSavedSeconds = totalBlocked * AVG_REEL_TIME_SECONDS;

    document.getElementById('total-blocked').textContent = totalBlocked.toLocaleString();
    document.getElementById('time-saved').textContent = formatTimeSaved(timeSavedSeconds);
  });
}

// save toggles when the toggle changes
function setupEventListeners() {
  Object.entries(CONFIG_KEYS).forEach(([elementId, storageKey]) => {
    document.getElementById(elementId).addEventListener('change', (e) => {
      chrome.storage.local.set({ [storageKey]: e.target.checked });
    });
  });
}

function showModal(text, onYes) {
  const modal = document.getElementById('custom-modal');
  const modalText = document.getElementById('modal-text');
  const btnYes = document.getElementById('modal-btn-yes');
  const btnNo = document.getElementById('modal-btn-no');

  modalText.textContent = text;
  btnYes.textContent = chrome.i18n.getMessage("btnYes") || "Yes";
  btnNo.textContent = chrome.i18n.getMessage("btnNo") || "No, thanks";

  modal.style.display = 'flex';

  const closeAndClean = () => {
    modal.style.display = 'none';
    btnYes.onclick = null;
    btnNo.onclick = null;
  };

  btnYes.onclick = () => {
    onYes();
    closeAndClean();
  };

  btnNo.onclick = () => {
    closeAndClean();
  };
}

document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  setupEventListeners();

  chrome.storage.local.get(['hasSeenProfileSuggestion', 'hasSeenRateSuggestion', 'installDate'], (result) => {
    const installDate = result.installDate ? new Date(result.installDate) : null;
    const diffDays = installDate ? (new Date() - installDate) / (1000 * 60 * 60 * 24) : 0;

    if (!result.hasSeenProfileSuggestion) {
      setTimeout(() => {
        const msg = chrome.i18n.getMessage("profileSuggestion") || "Welcome to NoReels! Since it's your first time using the extension, would you like to check out the developer's LinkedIn profile?";
        showModal(msg, () => {
          chrome.tabs.create({ url: 'https://www.linkedin.com/in/matheus-pedrosa-custodio/' });
        });
        chrome.storage.local.set({ hasSeenProfileSuggestion: true });
      }, 500);
    } else if (installDate && diffDays >= 2 && !result.hasSeenRateSuggestion) {
      setTimeout(() => {
        const msg = chrome.i18n.getMessage("rateSuggestion") || "You've been using NoReels for a few days! Would you like to rate our extension to help us grow?";
        showModal(msg, () => {
          const extId = chrome.runtime.id;
          chrome.tabs.create({ url: `https://chromewebstore.google.com/detail/noreels-remove-youtube-sh/hkfmoiiekflhhnkaoboalifligaehben?authuser=0&hl=pt-BR` });
        });
        chrome.storage.local.set({ hasSeenRateSuggestion: true });
      }, 500);
    }
  });
});