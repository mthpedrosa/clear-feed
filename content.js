const removerLixo = () => {
    // 1. YouTube: Remove Shorts
    const ytSelectors = [
      "ytd-rich-section-renderer", 
      "ytd-reel-shelf-renderer",
      "ytd-guide-entry-renderer:has(a[title='Shorts'])",
      "a[title='Shorts']"
    ];
  
    // 2. Instagram: Remove Reels
    const igSelectors = [
      "a[href='/reels/']", 
      "svg[aria-label='Reels']"
    ];
  
    // 3. Facebook: Remove Reels procuramos por links que contenham "/reel/" no endereço ou aria-label "Reels"
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
  
  // Monitora a página para remover itens novos que aparecem no scroll
  const observer = new MutationObserver(() => {
    removerLixo();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Executa a primeira vez
  removerLixo();