// Configuration
const CONFIG = {
  welcomeUrl: 'https://matheuspedrosa.site/noreels/welcome'
};

chrome.runtime.onInstalled.addListener((details) => {
  // Only open welcome page if we don't already have an installDate stored.
  // This prevents opening the site for users who already had a previous install.
  chrome.storage.local.get('installDate', (res) => {
    const hasInstallDate = !!res && !!res.installDate;

    if (!hasInstallDate) {
      // Mark install date for future checks
      chrome.storage.local.set({ installDate: new Date().toISOString() });

      // Only open welcome page when the runtime reports a fresh install
      if (details.reason === 'install') {
        chrome.tabs.create({ url: CONFIG.welcomeUrl });
      }
    }
  });

  console.log('NoReels extension installed.');
});
