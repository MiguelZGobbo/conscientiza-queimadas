import { test, expect } from '@playwright/test';

for (const [width, minimumHeight, maximumHeight, minimumDepth] of [[1440, 221, 252, 90], [390, 119, 138, 25]]) {
  test(`frente de fogo tem escala e bases em profundidade em ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const flames = await page.locator(`${width < 960 ? '.landscape--mobile' : '.landscape--desktop'} .flame`).evaluateAll(elements => elements.map(element => {
      const { x, y, width, height } = element.getBBox();
      return { x, bottom: y + height, width, height };
    }));
    expect(Math.max(...flames.map(flame => flame.height))).toBeGreaterThanOrEqual(minimumHeight);
    expect(Math.max(...flames.map(flame => flame.height))).toBeLessThanOrEqual(maximumHeight);
    const bases = flames.map(flame => flame.bottom);
    expect(Math.max(...bases) - Math.min(...bases)).toBeGreaterThanOrEqual(minimumDepth);
    // O fogo permanece na região da mata; a coluna de leitura continua protegida.
    expect(flames.every(flame => flame.x >= (width < 960 ? 180 : 830))).toBe(true);
  });
}

test('fogo alterna ritmos sem saltos e anima apenas transformação e opacidade', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.landscape--desktop')).toHaveClass(/is-smoke-ready/);
  const motion = await page.locator('.landscape--desktop').evaluate(element => {
    const animations = element.getAnimations({ subtree: true });
    const flames = animations.filter(animation => animation.effect.target.matches('.flame__shape'));
    const durations = [...new Set(flames.map(animation => animation.effect.getTiming().duration))].sort((a, b) => a - b);
    const continuous = flames.every(animation => {
      animation.pause();
      const { duration, delay } = animation.effect.getTiming();
      const styleAt = time => {
        animation.currentTime = delay + time;
        const style = getComputedStyle(animation.effect.target);
        return { transform: style.transform, opacity: style.opacity };
      };
      return JSON.stringify(styleAt(duration)) === JSON.stringify(styleAt(duration * 2)) && JSON.stringify(styleAt(duration * 2)) === JSON.stringify(styleAt(duration * 3));
    });
    const properties = [...new Set(animations.flatMap(animation => animation.effect.getKeyframes().flatMap(frame => Object.keys(frame))))];
    return { durations, continuous, properties };
  });
  expect(motion.durations).toEqual([2300, 3100, 4200]);
  expect(motion.continuous).toBe(true);
  expect(motion.properties.filter(property => !['offset', 'computedOffset', 'easing', 'composite', 'transform', 'opacity'].includes(property))).toEqual([]);
});

test('cena completa fica estática sem JavaScript ou se o script da arte falhar', async ({ browser }) => {
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 1440, height: 900 } });
    try {
      const page = await context.newPage();
      if (javaScriptEnabled) await page.route('**/hero-interaction.js', route => route.abort());
      await page.goto('http://127.0.0.1:4173/');
      await expect(page.locator('.landscape--desktop .smoke-simple')).toBeVisible();
      await expect(page.locator('.landscape--desktop .fire-front')).toBeVisible();
      expect(await page.locator('.hero__landscape').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
    } finally { await context.close(); }
  }
});

test('rodapé escolhe variante mais detalhada em telas densas nas quatro páginas', async ({ browser }) => {
  const widths = [];
  for (const deviceScaleFactor of [1, 2]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor });
    const page = await context.newPage();
    try {
      for (const path of ['index', 'queimadas', 'dados', 'prevencao']) {
        await page.goto(`http://127.0.0.1:4173/${path}.html`);
        const image = page.locator('.site-footer__landscape img');
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveAttribute('srcset', /1920w/);
        const details = await image.evaluate(async image => {
          await image.decode();
          const response = await fetch(image.currentSrc);
          const blob = await response.blob();
          const bitmap = await createImageBitmap(blob);
          const width = bitmap.width;
          bitmap.close();
          return { width, bytes: blob.size, filter: getComputedStyle(image).filter, rendered: image.getBoundingClientRect().width, mask: getComputedStyle(image.closest('.site-footer__landscape')).maskImage };
        });
        expect(details.filter).toBe('none');
        expect(details.mask).toBe('none');
        expect(details.width).toBeGreaterThanOrEqual(details.rendered * deviceScaleFactor);
        expect(details.bytes).toBeLessThanOrEqual(450000);
        if (path === 'index') widths.push(details.width);
      }
    } finally {
      await context.close();
    }
  }
  expect(widths[1]).toBeGreaterThan(widths[0]);
});

test('textos e navegação mantêm contraste AA sobre a paisagem SVG renderizada', async ({ page }) => {
  test.setTimeout(30000);
  for (const [width, height, fontSize] of [[390, 844, '100%'], [768, 1024, '100%'], [1440, 900, '100%'], [1920, 1080, '100%'], [1440, 500, '100%'], [1440, 500, '200%'], [390, 844, '200%'], [768, 1024, '200%']]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(size => document.documentElement.style.fontSize = size, fontSize);
    if (width >= 960) await expect(page.locator('.landscape--desktop')).toHaveClass(/is-smoke-ready/);
    const selectors = '.hero h1, .hero h1 span, .hero__description, .hero__impacts-link, .site-header a';
    // Ocultar/restaurar o texto não deve medir uma cor intermediária da transição da navbar.
    await page.addStyleTag({ content: `${selectors} { transition: none !important; }` });
    const hide = await page.addStyleTag({ content: `${selectors} { color: transparent !important; text-decoration-color: transparent !important; } .site-header svg, .site-nav a::after { visibility: hidden; }` });
    const background = (await page.screenshot({ animations: 'disabled', fullPage: true })).toString('base64');
    await hide.evaluate(element => element.remove());
    const contrasts = await page.evaluate(async ({ selectors, background }) => {
      const image = new Image(); image.src = `data:image/png;base64,${background}`; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
      const luminance = rgb => {
        const channels = rgb.map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
        return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
      };
      return [...document.querySelectorAll(selectors)].filter(element => element.getClientRects().length).map(element => {
        const bounds = element.getBoundingClientRect();
        const foreground = luminance(getComputedStyle(element).color.match(/[\d.]+/g).slice(0, 3).map(Number));
        const pixels = context.getImageData(Math.floor(bounds.left), Math.floor(bounds.top), Math.ceil(bounds.width), Math.ceil(bounds.height)).data;
        let minimum = Infinity;
        for (let index = 0; index < pixels.length; index += 4) {
          const color = luminance([pixels[index], pixels[index + 1], pixels[index + 2]]);
          minimum = Math.min(minimum, (Math.max(foreground, color) + .05) / (Math.min(foreground, color) + .05));
        }
        return { text: element.textContent.trim(), minimum };
      });
    }, { selectors, background });
    for (const result of contrasts) expect(result.minimum, `${width}×${height} / ${fontSize}: ${result.text}`).toBeGreaterThanOrEqual(4.5);
  }
});

for (const [width, deviceScaleFactor] of [[390, 1], [390, 2], [768, 2], [1199, 2], [1440, 1], [1920, 2]]) {
  test(`paisagem SVG nítida e sem pintura raster em ${width}px / ${deviceScaleFactor}×`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 1080 }, deviceScaleFactor });
    try {
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:4173/');
      const art = page.locator(width < 960 ? '.landscape--mobile' : '.landscape--desktop');
      await expect(art).toBeVisible();
      await expect(art.locator('use[href="#tree-broad"]')).not.toHaveCount(0);
      expect(await page.evaluate(() => performance.getEntriesByType('resource').some(entry => /\/hero-[\w-]+\.webp$/.test(new URL(entry.name).pathname)))).toBe(false);
      if (width < 960) expect(await art.evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const density = await page.locator('.site-footer__landscape img').evaluate(async image => {
        await image.decode();
        const blob = await (await fetch(image.currentSrc)).blob();
        const bitmap = await createImageBitmap(blob);
        const rect = image.getBoundingClientRect();
        const paintedWidth = Math.max(rect.width, rect.height * bitmap.width / bitmap.height);
        const result = { actual: bitmap.width, required: paintedWidth * devicePixelRatio, bytes: blob.size };
        bitmap.close();
        return result;
      });
      expect(density.actual).toBeGreaterThanOrEqual(Math.ceil(density.required));
      expect(density.bytes).toBeLessThanOrEqual(450000);
    } finally { await context.close(); }
  });
}
