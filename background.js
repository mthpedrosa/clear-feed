// Configuration
const CONFIG = {
  welcomeUrl: 'https://matheuspedrosa.site/noreels/welcome'
};

chrome.runtime.onInstalled.addListener((details) => {
  // Only open welcome page if we don't already have an installDate stored.
  chrome.storage.local.get('installDate', (res) => {
    const hasInstallDate = !!res && !!res.installDate;

    if (!hasInstallDate) {
      chrome.storage.local.set({ installDate: new Date().toISOString() });

      if (details.reason === 'install') {
        chrome.tabs.create({ url: CONFIG.welcomeUrl });
      }
    }
  });

  console.log('NoReels extension installed.');
});

// Handle alarm events (e.g. Temporary Pause expiration)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'endSnooze') {
    chrome.storage.local.remove('snoozeUntil', () => {
      console.log('NoReels: Temporary pause ended. Blocking resumed.');
    });
  }
});

