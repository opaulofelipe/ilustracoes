(() => {
  'use strict';

  const works = [...document.querySelectorAll('.work')];
  const progress = document.getElementById('scroll-progress-fill');

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const luminance = (r, g, b) => {
    const values = [r, g, b].map((value) => {
      const channel = value / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return (0.2126 * values[0]) + (0.7152 * values[1]) + (0.0722 * values[2]);
  };

  const sampleEdgeColor = (image) => {
    try {
      const canvas = document.createElement('canvas');
      const size = 24;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;

      ctx.drawImage(image, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      let r = 0, g = 0, b = 0, count = 0;
      const edge = 3;

      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const isEdge = x < edge || y < edge || x >= size - edge || y >= size - edge;
          if (!isEdge) continue;
          const i = (y * size + x) * 4;
          const alpha = data[i + 3] / 255;
          if (alpha < 0.25) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count += 1;
        }
      }

      if (!count) return null;
      return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
    } catch (_) {
      return null;
    }
  };

  const applyImagePresentation = (image) => {
    const work = image.closest('.work');
    if (!work || !image.naturalWidth || !image.naturalHeight) return;

    const color = sampleEdgeColor(image);
    if (color) {
      const [r, g, b] = color;
      work.style.setProperty('--work-bg', `rgb(${r} ${g} ${b})`);
      const light = luminance(r, g, b) > 0.48;
      work.dataset.tone = light ? 'light' : 'dark';
      work.style.setProperty('--number-color', light ? 'rgba(32, 32, 48, .58)' : 'rgba(248, 246, 241, .78)');
    }

    const imageRatio = image.naturalWidth / image.naturalHeight;
    const viewportRatio = window.innerWidth / window.innerHeight;
    const similarity = Math.min(imageRatio, viewportRatio) / Math.max(imageRatio, viewportRatio);

    // Só usa cover quando o corte será pequeno. Em proporções muito diferentes,
    // preserva a ilustração inteira com contain.
    work.dataset.fit = similarity >= 0.78 ? 'cover' : 'contain';
  };

  const loadWithCaseFallback = (image) => {
    let triedLowercase = false;

    const onError = () => {
      if (!triedLowercase && image.src.endsWith('.PNG')) {
        triedLowercase = true;
        image.src = image.src.replace(/\.PNG$/, '.png');
        return;
      }

      const work = image.closest('.work');
      if (!work) return;
      work.classList.add('is-missing');
      const filename = image.getAttribute('src').split('/').pop();
      work.dataset.missing = `Não encontrei ${filename}`;
      image.hidden = true;
    };

    image.addEventListener('error', onError);
  };

  document.querySelectorAll('.work__image').forEach((image) => {
    loadWithCaseFallback(image);

    if (image.complete && image.naturalWidth) {
      applyImagePresentation(image);
    } else {
      image.addEventListener('load', () => applyImagePresentation(image), { once: true });
    }
  });

  const setActiveWork = (work) => {
    if (!work) return;
    works.forEach((item) => item.toggleAttribute('data-active', item === work));
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveWork(visible.target);
    }, { threshold: [0.3, 0.5, 0.7] });

    works.forEach((work) => observer.observe(work));
  }

  const updateProgress = () => {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const value = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
    progress.style.width = `${value * 100}%`;
  };

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll('.work__image').forEach((image) => {
        if (image.complete && image.naturalWidth) applyImagePresentation(image);
      });
    }, 120);
  });

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();
