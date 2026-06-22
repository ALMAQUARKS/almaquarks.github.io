(() => {
  const makeButton = (label, page, current) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.dataset.page = String(page);
    button.setAttribute('aria-label', `Show page ${page + 1}`);
    if (page === current) button.setAttribute('aria-current', 'page');
    return button;
  };

  document.querySelectorAll('[data-product-browser]').forEach((browser) => {
    const cards = Array.from(browser.querySelectorAll('[data-product-card]'));
    const pager = browser.querySelector('[data-product-pager]');
    const pageSize = Number(browser.dataset.pageSize || 20);
    if (!pager || cards.length <= pageSize) return;

    const totalPages = Math.ceil(cards.length / pageSize);
    let currentPage = 0;

    const render = () => {
      cards.forEach((card, index) => {
        const visible = Math.floor(index / pageSize) === currentPage;
        card.hidden = !visible;
      });

      pager.replaceChildren();
      pager.appendChild(makeButton('Prev', Math.max(0, currentPage - 1), currentPage));
      for (let page = 0; page < totalPages; page += 1) {
        pager.appendChild(makeButton(String(page + 1), page, currentPage));
      }
      pager.appendChild(makeButton('Next', Math.min(totalPages - 1, currentPage + 1), currentPage));
      pager.querySelectorAll('button').forEach((button) => {
        const page = Number(button.dataset.page);
        button.disabled = page === currentPage && (button.textContent === 'Prev' || button.textContent === 'Next');
      });
    };

    pager.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-page]');
      if (!button) return;
      const nextPage = Number(button.dataset.page);
      if (Number.isNaN(nextPage) || nextPage === currentPage) return;
      currentPage = Math.min(Math.max(nextPage, 0), totalPages - 1);
      render();
      browser.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });

    render();
  });

  const overlay = document.createElement('div');
  overlay.className = 'quarks-lightbox';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <button class="quarks-lightbox__close" type="button" aria-label="Close image">Close</button>
    <figure class="quarks-lightbox__figure">
      <img class="quarks-lightbox__image" alt="">
      <figcaption class="quarks-lightbox__caption"></figcaption>
    </figure>
  `;
  document.body.appendChild(overlay);

  const image = overlay.querySelector('.quarks-lightbox__image');
  const caption = overlay.querySelector('.quarks-lightbox__caption');
  const close = overlay.querySelector('.quarks-lightbox__close');
  let lightboxOpen = false;

  const closeLightbox = (fromPopState = false) => {
    if (!lightboxOpen) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('quarks-lightbox-open');
    lightboxOpen = false;
    if (!fromPopState && history.state && history.state.quarksLightbox) history.back();
  };

  const openLightbox = (href, title) => {
    image.src = href;
    image.alt = title || 'Expanded image';
    caption.textContent = title || '';
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('quarks-lightbox-open');
    lightboxOpen = true;
    if (!history.state || !history.state.quarksLightbox) {
      history.pushState({ quarksLightbox: true }, '', '#image');
    }
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-lightbox-image]');
    if (!trigger) return;
    event.preventDefault();
    openLightbox(trigger.href, trigger.dataset.lightboxTitle || trigger.textContent.trim());
  });

  close.addEventListener('click', () => closeLightbox(false));
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeLightbox(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox(false);
  });
  window.addEventListener('popstate', () => closeLightbox(true));
})();
