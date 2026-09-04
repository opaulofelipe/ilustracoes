(() => {
  'use strict';

  const sections = [...document.querySelectorAll('.artwork')];
  const counter = document.querySelector('#current-slide');

  if ('IntersectionObserver' in window && counter) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.dataset.index) {
          counter.textContent = visible.target.dataset.index;
        }
      },
      {
        threshold: [0.35, 0.5, 0.65, 0.8]
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  document.querySelectorAll('.artwork__image').forEach((image) => {
    image.addEventListener(
      'error',
      () => {
        const section = image.closest('.artwork');
        if (!section) return;

        section.classList.add('is-missing');
        section.dataset.missing = `Adicione ${image.getAttribute('src')} ao repositório`;
        image.hidden = true;
      },
      { once: true }
    );
  });
})();
