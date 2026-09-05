(() => {
  'use strict';

  const sections = [...document.querySelectorAll('.panel')];
  const counter = document.getElementById('current-slide');
  const progress = document.getElementById('progress-fill');

  const setCurrent = (section) => {
    if (!section) return;
    const index = section.dataset.index || '01';
    if (counter) counter.textContent = index;
    if (progress) progress.style.height = `${(Number(index) / sections.length) * 100}%`;
    sections.forEach(item => item.toggleAttribute('data-active', item === section));
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setCurrent(visible.target);
    }, { threshold: [0.3, 0.5, 0.7] });

    sections.forEach(section => observer.observe(section));
  }

  setCurrent(sections[0]);

  document.querySelectorAll('.panel__image').forEach((image) => {
    image.addEventListener('error', () => {
      const src = image.getAttribute('src') || '';

      // GitHub Pages é case-sensitive. Se o arquivo estiver como .png,
      // tentamos automaticamente a variante em minúsculas.
      if (src.endsWith('.PNG') && !image.dataset.lowercaseTried) {
        image.dataset.lowercaseTried = 'true';
        image.src = src.replace(/\.PNG$/, '.png');
        return;
      }

      const section = image.closest('.panel');
      if (!section) return;
      section.classList.add('is-missing');
      section.dataset.missing = `Imagem não encontrada: ${src}`;
      image.hidden = true;
    });
  });

  window.addEventListener('keydown', (event) => {
    if (!['ArrowDown','PageDown','ArrowUp','PageUp'].includes(event.key)) return;
    const active = document.querySelector('.panel[data-active]') || sections[0];
    const current = sections.indexOf(active);
    const next = (event.key === 'ArrowDown' || event.key === 'PageDown')
      ? Math.min(current + 1, sections.length - 1)
      : Math.max(current - 1, 0);
    if (next === current) return;
    event.preventDefault();
    sections[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, { passive: false });
})();
