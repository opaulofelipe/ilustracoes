(() => {
  'use strict';

  const sections = [...document.querySelectorAll('.panel')];
  const counter = document.getElementById('current-slide');
  const progressFill = document.getElementById('progress-fill');

  const setCurrent = (section) => {
    if (!section) return;

    const currentIndex = section.dataset.index || '01';

    if (counter) {
      counter.textContent = currentIndex;
    }

    if (progressFill) {
      const total = sections.length || 1;
      const percentage = (Number(currentIndex) / total) * 100;
      progressFill.style.height = `${percentage}%`;
    }

    sections.forEach((item) => {
      item.toggleAttribute('data-active', item === section);
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries[0]) {
        setCurrent(visibleEntries[0].target);
      }
    }, {
      threshold: [0.3, 0.45, 0.6, 0.75]
    });

    sections.forEach((section) => observer.observe(section));
  }

  setCurrent(sections[0]);

  document.querySelectorAll('.panel__image').forEach((image) => {
    image.addEventListener('error', () => {
      const section = image.closest('.panel');
      if (!section) return;

      section.classList.add('is-missing');
      section.dataset.missing = `Adicione ${image.getAttribute('src')} ao repositório`;
      image.hidden = true;
    }, { once: true });
  });

  window.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(event.key)) return;

    const activeSection = document.querySelector('.panel[data-active]') || sections[0];
    const currentPosition = sections.indexOf(activeSection);
    const nextPosition = event.key === 'ArrowDown' || event.key === 'PageDown'
      ? Math.min(currentPosition + 1, sections.length - 1)
      : Math.max(currentPosition - 1, 0);

    if (nextPosition === currentPosition) return;

    event.preventDefault();
    sections[nextPosition].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, { passive: false });
})();
