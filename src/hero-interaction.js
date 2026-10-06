(() => {
  const hero = document.querySelector('.hero');
  const art = hero.querySelector('.landscape--desktop');
  const glow = art.querySelector('.cursor-glow');
  const smoke = art.querySelector('.smoke-response');
  const smokeTextures = [...art.querySelectorAll('.smoke-texture')];
  const flames = [...art.querySelectorAll('.flame')];
  const enabled = matchMedia('(min-width: 960px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let geometry;
  let pointer;
  let frame = 0;
  let activeFlame;
  let loadedTextures = 0;

  // Carrega a textura somente quando será usada; a versão inline cobre falha ou ausência de JS.
  for (const texture of smokeTextures) {
    texture.addEventListener('load', () => {
      loadedTextures += 1;
      if (loadedTextures === smokeTextures.length) art.classList.add('is-smoke-ready');
    }, { once: true });
  }
  function loadSmokeTexture() {
    if (!enabled.matches) return;
    for (const texture of smokeTextures) {
      if (!texture.hasAttribute('href')) texture.setAttribute('href', texture.dataset.src);
    }
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    pointer = undefined;
    art.classList.remove('is-pointer-active');
    glow.removeAttribute('transform');
    smoke.style.removeProperty('transform');
    if (activeFlame) {
      activeFlame.style.removeProperty('transform');
      activeFlame.style.removeProperty('opacity');
      activeFlame = undefined;
    }
  }

  function measure() {
    // A matriz considera também o recorte do SVG em viewports baixas ou largas.
    const matrix = art.getScreenCTM();
    if (!matrix) return;
    geometry = {
      inverse: matrix.inverse(),
      anchors: flames.map(element => {
        const bounds = element.getBBox();
        return { element, x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
      }),
    };
  }

  function render() {
    frame = 0;
    if (!pointer || !geometry) return;
    const point = new DOMPoint(pointer.x, pointer.y).matrixTransform(geometry.inverse);
    // A área de leitura permanece protegida, inclusive quando o cursor passa pelo texto.
    if (point.x < 830 || point.x > 1440 || point.y < 280 || point.y > 900) {
      reset();
      return;
    }
    art.classList.add('is-pointer-active');
    glow.setAttribute('transform', `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
    smoke.style.transform = `translate(${((point.x - 1135) / 305 * 6).toFixed(2)}px, ${((point.y - 590) / 310 * 4).toFixed(2)}px)`;

    let nearest;
    let distance = 180;
    for (const anchor of geometry.anchors) {
      const candidateDistance = Math.hypot(point.x - anchor.x, point.y - anchor.y);
      if (candidateDistance < distance) {
        nearest = anchor;
        distance = candidateDistance;
      }
    }
    if (activeFlame && activeFlame !== nearest?.element) {
      activeFlame.style.removeProperty('transform');
      activeFlame.style.removeProperty('opacity');
      activeFlame = undefined;
    }
    if (nearest) {
      const strength = 1 - distance / 180;
      const lean = Math.max(-4, Math.min(4, (point.x - nearest.x) / 30)) * strength;
      activeFlame = nearest.element;
      activeFlame.style.transform = `rotate(${lean.toFixed(2)}deg) scaleY(${(1 + strength * .08).toFixed(3)})`;
      activeFlame.style.opacity = String(.87 + strength * .13);
    }
  }

  function follow(event) {
    if (!enabled.matches || event.pointerType !== 'mouse' || event.target.closest('a, button, h1, p')) {
      reset();
      return;
    }
    if (!geometry) measure();
    pointer = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(render);
  }

  hero.addEventListener('pointerenter', () => {
    if (enabled.matches) measure();
  });
  hero.addEventListener('pointermove', follow, { passive: true });
  hero.addEventListener('pointerleave', reset);
  hero.addEventListener('pointercancel', reset);
  enabled.addEventListener('change', () => { reset(); geometry = undefined; loadSmokeTexture(); });
  window.addEventListener('resize', () => { reset(); geometry = undefined; }, { passive: true });
  window.addEventListener('scroll', () => { reset(); geometry = undefined; }, { passive: true });
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  loadSmokeTexture();
})();
