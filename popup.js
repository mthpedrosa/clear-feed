const checkbox = document.getElementById('toggleBlock');
const statusLabel = document.getElementById('statusLabel');

// load 
chrome.storage.local.get(['enabled'], (result) => {
  const isEnabled = result.enabled !== false;
  checkbox.checked = isEnabled;
  statusLabel.innerText = isEnabled ? 'Blocking Active' : 'Blocking Paused';
});

// save the change
checkbox.addEventListener('change', () => {
  const isEnabled = checkbox.checked;
  chrome.storage.local.set({ enabled: isEnabled });
  statusLabel.innerText = isEnabled ? 'Blocking Active' : 'Blocking Paused';
  
  // Reload the current page to apply/remove the block.
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.reload(tabs[0].id);
  });
});