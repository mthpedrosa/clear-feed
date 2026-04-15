chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['installDate'], (result) => {
    if (!result.installDate) {
      chrome.storage.local.set({ installDate: new Date().toISOString() });
    }
  });
  console.log('NoReels extension installed.');
});
