const injectStyles = () => {
  if (document.getElementById('noreels-logic-styles')) return;

  const style = document.createElement('style');
  style.id = 'noreels-logic-styles';
  style.innerHTML = `
    /* YOUTUBE - Esconde prateleiras de Shorts sem quebrar o feed */
    ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
    ytd-reel-shelf-renderer,
    grid-shelf-view-model,
    ytd-video-renderer:has(a[href^='/shorts/']),
    ytd-guide-entry-renderer:has(a[href="/shorts/"]),
    ytd-mini-guide-entry-renderer:has(a[href="/shorts/"]),
    #shorts-container,
    ytd-reel-video-renderer {
      display: none !important;
    }

    /* INSTAGRAM - Esconde apenas os botões e seções de Reels */
    a[href^='/reels/'], 
    a[href*='/reel/'], 
    svg[aria-label*='Reels'],
    span:has(> svg[aria-label*='Reels']) {
      display: none !important;
    }

    /* FACEBOOK - Esconde blocos de Reels no Feed */
    div[aria-label="Reels"], 
    div[id*="reels_tab"],
    div:has(> h2 span:contains("Reels")) {
      display: none !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
};

injectStyles();

const observer = new MutationObserver(() => {
  if (!document.getElementById('noreels-logic-styles')) {
    injectStyles();
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });