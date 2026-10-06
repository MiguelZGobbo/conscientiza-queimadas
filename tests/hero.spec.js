import { test, expect } from '@playwright/test';

const headline = 'Quando o fogo avança, não é só a mata que se perde.';
const description = 'Entenda como as queimadas afetam o ambiente, a saúde e a vida das comunidades — e saiba como prevenir.';

async function readNativeMenuExpanded(page) {
  // Consulta a árvore acessível real: o estado nativo não é um atributo ARIA no DOM.
  const session = await page.context().newCDPSession(page);
  const { nodes } = await session.send('Accessibility.getFullAXTree');
  await session.detach();
  return nodes.find(node => node.role?.value === 'button').properties.find(property => property.name === 'expanded').value.value;
}

test('Home contém somente o Hero, com textos exatos e um CTA configurável', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Conscientiza Queimadas');
  const favicon = page.locator('link[rel="icon"]');
  await expect(favicon).toHaveAttribute('type', 'image/svg+xml');
  const iconResponse = await page.request.get(await favicon.evaluate(el => el.href));
  expect(iconResponse.ok()).toBe(true);
  expect(iconResponse.headers()['content-type']).toContain('image/svg+xml');
  await expect(page.locator('.brand__name')).toHaveText('Conscientiza Queimadas');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(headline);
  await expect(page.locator('.hero__description')).toHaveText(description);
  await expect(page.locator('main section')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(0);
  await expect(page.locator('main a')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Entenda os impactos' })).toHaveAttribute('href', './dados-e-impactos');
  await expect(page.locator('.hero__cta')).toHaveText('Entenda os impactos');
  await expect(page.locator('.hero__landscape')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.hero__landscape text')).toHaveCount(0);
});

for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080], [844, 390]]) {
  test(`conteúdo legível e sem overflow em ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const layout = await page.evaluate(() => {
      const bounds = (selector) => {
        const { left, right, top, bottom } = document.querySelector(selector).getBoundingClientRect();
        return { left, right, top, bottom };
      };
      return {
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
        heading: bounds('h1'),
        cta: bounds('.hero__cta'),
        hero: bounds('.hero'),
        nav: bounds('.site-header'),
      };
    });
    expect(layout.scroll).toBeLessThanOrEqual(layout.client);
    expect(layout.heading.left).toBeGreaterThanOrEqual(16);
    expect(layout.heading.right).toBeLessThanOrEqual(width - 16);
    expect(layout.heading.top).toBeGreaterThanOrEqual(layout.nav.bottom);
    expect(layout.cta.bottom).toBeLessThan(layout.hero.bottom);
    expect(await page.locator('.brand__name').evaluate(el => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getClientRects().length;
    })).toBe(1);
    const cta = page.getByRole('link', { name: 'Entenda os impactos' });
    await cta.focus();
    await expect(cta).toBeInViewport();
    expect(await cta.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  });
}

test('menu mobile funciona por teclado, fecha com Esc e ao sair com Tab', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button');
  const nav = page.getByRole('navigation', { name: 'Principal' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).toBeHidden();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Início', exact: true })).toBeInViewport();
  await expect(nav.getByRole('link', { name: 'Sobre', exact: true })).toBeInViewport();
  for (const name of ['Início', 'Dados e impactos', 'Prevenção', 'Sobre']) {
    await page.keyboard.press('Tab');
    await expect(nav.getByRole('link', { name, exact: true })).toBeFocused();
  }
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(nav).toBeHidden();
  await page.keyboard.press('Enter');
  for (let index = 0; index < 5; index += 1) await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Entenda os impactos' })).toBeFocused();
  await expect(nav).toBeHidden();
});

test('mouse ilumina a arte, reage na chama próxima e reseta ao sair', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const art = page.locator('.landscape--desktop');
  const glow = art.locator('.cursor-glow');
  const flame = art.locator('.flame').nth(3);
  const vegetationBefore = await art.locator('use[href="#tree-broad"]').first().evaluate(el => getComputedStyle(el).transform);
  const bounds = await flame.boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await expect(glow).toHaveCSS('opacity', '1');
  await expect.poll(() => flame.evaluate(el => el.style.transform)).not.toBe('');
  await expect.poll(() => art.locator('.smoke-response').evaluate(el => el.style.transform)).not.toBe('');
  const position = await glow.getAttribute('transform');
  await page.mouse.move(bounds.x + bounds.width / 2 + 30, bounds.y + bounds.height / 2);
  await expect.poll(() => glow.getAttribute('transform')).not.toBe(position);
  expect(await art.locator('use[href="#tree-broad"]').first().evaluate(el => getComputedStyle(el).transform)).toBe(vegetationBefore);
  await page.mouse.move(10, 10);
  await expect(glow).toHaveCSS('opacity', '0');
  expect(await art.locator('.flame').evaluateAll(elements => elements.every(el => !el.style.transform))).toBe(true);
  expect(await art.locator('.smoke-response').evaluate(el => el.style.transform)).toBe('');
});

test('alterar reduced motion desativa e reseta a interação desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.mouse.move(1150, 740);
  await expect(page.locator('.cursor-glow')).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.cursor-glow')).toHaveCSS('opacity', '0');
  expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  await expect.poll(() => page.locator('.landscape--desktop .flame').evaluateAll(elements => elements.every(el => !el.style.transform))).toBe(true);
  await page.mouse.move(1200, 700);
  await expect(page.locator('.cursor-glow')).toHaveCSS('opacity', '0');
});

test('touch mantém a paisagem estática mesmo em largura desktop', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await page.mouse.move(1150, 740);
  await expect(page.locator('.cursor-glow')).toHaveCSS('opacity', '0');
  expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  expect(await page.evaluate(() => performance.getEntriesByType('resource').some(entry => entry.name.endsWith('/smoke.svg')))).toBe(false);
  await context.close();
});

test('fumaça texturizada fica restrita ao desktop com mouse e movimento permitido', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const texture = page.locator('.landscape--desktop .smoke-texture');
  await expect(texture).toHaveCount(2);
  await expect(page.locator('.landscape--desktop')).toHaveClass(/is-smoke-ready/);
  await expect(page.locator('.smoke-layers')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.smoke-layers')).toBeHidden();
  await expect(page.locator('.landscape--desktop .smoke-simple')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.smoke-layers')).toBeHidden();
  expect(await page.locator('.landscape--mobile .smoke').evaluate(el => getComputedStyle(el).filter)).toBe('none');
  await page.reload();
  expect(await page.evaluate(() => performance.getEntriesByType('resource').some(entry => entry.name.endsWith('/smoke.svg')))).toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  await expect(page.locator('.landscape--desktop .smoke-simple')).toBeVisible();
  expect(await page.evaluate(() => performance.getEntriesByType('resource').some(entry => entry.name.endsWith('/smoke.svg')))).toBe(false);
});

test('fumaça simples continua visível se a textura local falhar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/smoke.svg', route => route.abort());
  await page.goto('/');
  await expect(page.locator('.landscape--desktop .smoke-simple')).toBeVisible();
  await expect(page.locator('.smoke-layers')).toBeHidden();
  await page.mouse.move(1150, 740);
  await expect(page.locator('.cursor-glow')).toHaveCSS('opacity', '1');
});

test('duas camadas de fumaça sobem e reiniciam invisíveis em dois ciclos', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.landscape--desktop')).toHaveClass(/is-smoke-ready/);
  const cycles = await page.locator('.smoke-layer').evaluateAll(elements => elements.map(element => {
    const animation = element.getAnimations().find(item => item.animationName === 'smoke-rise');
    if (!animation) return null;
    animation.pause();
    const { delay, duration } = animation.effect.getTiming();
    return {
      duration,
      cycles: [1, 2].map(cycle => [0, .15, .4, .65, .85, .9999, 1].map(progress => {
        animation.currentTime = delay + (cycle + progress) * duration;
        const style = getComputedStyle(element);
        const matrix = new DOMMatrix(style.transform);
        return { opacity: Number(style.opacity), y: matrix.m42, scale: matrix.m22 };
      })),
    };
  }));
  expect(cycles.every(Boolean)).toBe(true);
  expect(cycles.map(item => item.duration).sort((a, b) => a - b)).toEqual([18000, 22000]);
  for (const layer of cycles) {
    for (const samples of layer.cycles) {
      expect(samples[0].opacity).toBe(0);
      expect(samples.at(-2).opacity).toBeLessThan(.001);
      expect(samples.at(-1).opacity).toBe(0);
      expect(samples.at(-2).y).toBeLessThan(-79);
      for (let index = 1; index < samples.length - 1; index += 1) {
        expect(samples[index].y).toBeLessThan(samples[index - 1].y);
        expect(samples[index].scale).toBeLessThanOrEqual(1.081);
      }
    }
  }
  const sway = await page.locator('.smoke-layer').evaluateAll(elements => elements.map(element => {
    const rise = element.getAnimations().find(animation => animation.animationName === 'smoke-rise');
    const riseTiming = rise.effect.getTiming();
    rise.currentTime = riseTiming.delay + riseTiming.duration * 1.85;
    const texture = element.querySelector('.smoke-texture');
    const oscillation = texture.getAnimations().find(animation => animation.animationName === 'smoke-sway');
    oscillation.pause();
    const swayTiming = oscillation.effect.getTiming();
    oscillation.currentTime = swayTiming.delay + swayTiming.duration;
    const scale = new DOMMatrix(getComputedStyle(element).transform).m11;
    return Math.abs(new DOMMatrix(getComputedStyle(texture).transform).m41 * scale);
  }));
  expect(sway.every(displacement => displacement <= 12)).toBe(true);
});

test('menu fecha ao clicar fora e se adapta ao mudar para desktop', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  await toggle.click();
  await page.locator('.hero__description').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(toggle).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeHidden();
});

test('reduced motion interrompe animações e mantém navegação operável', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  expect(await page.locator('.embers').first().evaluate(el => getComputedStyle(el).display)).toBe('none');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
});

test('navegação e conteúdo permanecem acessíveis sem JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 568 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button').click();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(headline);
  expect(await readNativeMenuExpanded(page)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('menu continua operável quando o arquivo JavaScript falha', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.route('**/navigation.js', route => route.abort());
  await page.goto('/');
  const toggle = page.getByRole('button');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
  expect(await readNativeMenuExpanded(page)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Início', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeHidden();
});

test('texto ampliado a 200% em 320 px continua legível e sem overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const cta = page.getByRole('link', { name: 'Entenda os impactos' });
  await cta.focus();
  await expect(cta).toBeInViewport();
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Sobre', exact: true }).focus();
  await expect(page.getByRole('link', { name: 'Sobre', exact: true })).toBeInViewport();
});

test('carregamento lento do script não desloca o conteúdo e recursos são locais e leves', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.heroLayoutShift = 0;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.heroLayoutShift += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.route('**/navigation.js', async route => {
    await new Promise(resolve => setTimeout(resolve, 350));
    await route.continue();
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible();
  const metrics = await page.evaluate(() => ({
    shift: window.heroLayoutShift,
    resources: performance.getEntriesByType('resource').map(entry => ({ name: entry.name, size: entry.decodedBodySize })),
    htmlSize: performance.getEntriesByType('navigation')[0].decodedBodySize,
  }));
  expect(metrics.shift).toBeLessThan(0.01);
  expect(metrics.resources.every(resource => new URL(resource.name).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(metrics.resources.reduce((size, resource) => size + resource.size, metrics.htmlSize)).toBeLessThan(40000);
});
