(() => {
  'use strict';

  document.querySelectorAll('.work img').forEach((image) => {
    image.addEventListener('error', () => {
      const current = image.getAttribute('src') || '';
      if (current.endsWith('.PNG')) {
        image.src = current.replace(/\.PNG$/, '.png');
      }
    }, { once: true });
  });
})();
