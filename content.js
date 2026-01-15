const removerLixo = () => {
  // youtube
  const ytSelectors = [
    "ytd-rich-section-renderer",
    "ytd-reel-shelf-renderer",
    "grid-shelf-view-model",
    "ytd-video-renderer:has(a[href^='/shorts/'])",
    "ytd-grid-video-renderer:has(a[href^='/shorts/'])",
  ];

  // instagram
  const igSelectors = [
    "a[href='/reels/']",
    "svg[aria-label='Reels']"
  ];

  // facebook
  const fbSelectors = [
    "a[aria-label='Reels']",
    "a[href*='/reel/']",
    "a[href*='/reels/']",
    "div[aria-label='Reels']",
    "div:has(> h2 span:contains('Reels'))"
  ];

  const todosOsSeletores = [...ytSelectors, ...igSelectors, ...fbSelectors];

  todosOsSeletores.forEach(seletor => {
    document.querySelectorAll(seletor).forEach(elemento => {
      if (elemento) {
        const container = elemento.closest('.x6s0dn4') || elemento;
        container.style.display = 'none';
      }
    });
  });
};

// observe mutations to handle dynamically loaded content
const observer = new MutationObserver(() => {
  removerLixo();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// run if enabled
chrome.storage.local.get(['enabled'], (result) => {
  if (result.enabled !== false) {
    removerLixo();
  }
});