'use strict';
document.addEventListener('error', event => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.dataset.imageFallback) return;
  image.style.display = 'none';
  const mode = image.dataset.imageFallback;
  if (mode !== 'hide' && image.nextElementSibling) image.nextElementSibling.style.display = mode;
}, true);
