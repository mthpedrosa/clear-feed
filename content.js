const injectStyles = () => {
  if (document.getElementById('noreels-fix-styles')) return;

  const style = document.createElement('style');
  style.id = 'noreels-fix-styles';
  style.innerHTML = `
    /* YOUTUBE: Vídeos e Prateleiras */
    ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
    ytd-reel-shelf-renderer,
    grid-shelf-view-model,
    ytd-video-renderer:has(a[href^='/shorts/']),
    [is-shorts],

    /* YOUTUBE: Botões da Barra Lateral (O que causou a rejeição) */
    ytd-guide-entry-renderer:has(a[href="/shorts/"]),
    ytd-mini-guide-entry-renderer:has(a[href="/shorts/"]),
    #endpoint:has(tp-yt-paper-item [title="Shorts"]),
    a[title="Shorts"],

    /* INSTAGRAM & FACEBOOK */
    a[href^='/reels/'], 
    a[href*='/reel/'], 
    svg[aria-label*='Reels'],
    div[aria-label="Reels"] {
      display: none !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
};

injectStyles();

const observer = new MutationObserver(() => {
  if (!document.getElementById('noreels-fix-styles')) {
    injectStyles();
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });