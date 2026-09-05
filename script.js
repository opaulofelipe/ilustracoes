(() => {
  'use strict';

  document.querySelectorAll('.work img, .intro__portrait').forEach((image) => {
    // Deterrents only: public image URLs and screenshots remain accessible.
    image.addEventListener('contextmenu', (event) => event.preventDefault());
    image.addEventListener('dragstart', (event) => event.preventDefault());
    image.addEventListener('error', () => {
      const current = image.getAttribute('src') || '';
      if (current.endsWith('.PNG')) {
        image.src = current.replace(/\.PNG$/, '.png');
      }
    }, { once: true });
  });
})();
