import { test, expect } from '@playwright/test';
import { withPublicationServer as serve } from './helpers/publicacao.js';

const fontPath = 'src/fonts/fraunces-v38-latin-600.woff2';
test.use({ reducedMotion: 'reduce' });

async function fontUsed(page) {
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#hero-title span' });
    return (await session.send('CSS.getPlatformFontsForNode', { nodeId })).fonts;
  } finally { await session.detach(); }
}

test('usa Fraunces real somente na Home, com as frases separadas', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect((await fontUsed(page)).some(font => font.isCustomFont && /Fraunces/.test(font.familyName))).toBe(true);
  const title = await page.locator('#hero-title').evaluate(element => {
    const first = document.createRange();
    first.selectNodeContents(element.firstChild);
    const lastLine = [...first.getClientRects()].at(-1);
    const span = element.querySelector('span');
    return { firstBottom: lastLine.bottom, secondTop: span.getBoundingClientRect().top, weight: getComputedStyle(span).fontWeight };
  });
  expect(title.secondTop).toBeGreaterThan(title.firstBottom);
  expect(title.weight).toBe('600');
  await expect(page.locator(`link[rel='preload'][as='font']`)).toHaveAttribute('href', `./${fontPath}`);
  for (const route of ['queimadas', 'dados', 'prevencao', 'sobre', 'fontes']) {
    await page.goto(`/${route}`);
    await expect(page.locator('link[as="font"]')).toHaveCount(0);
    expect(await page.evaluate(() => performance.getEntriesByType('resource').some(resource => /\.woff2(?:$|\?)/.test(resource.name)))).toBe(false);
  }
});

test('fonte lenta mantém a composição estável depois de mostrar o fallback', async ({ page }) => {
  let release;
  const fontGate = new Promise(resolve => { release = resolve; });
  await page.addInitScript(() => {
    window.editorialShift = 0;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.editorialShift += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.route(`**/${fontPath}`, async route => { await fontGate; await route.continue(); });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(200);
    const before = await page.locator('.hero__description').boundingBox();
    release();
    await page.waitForLoadState('load');
    await page.evaluate(() => document.fonts.ready);
    const after = await page.locator('.hero__description').boundingBox();
    expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => window.editorialShift)).toBeLessThan(.01);
    await expect(page.locator('#hero-title')).toBeVisible();
  } finally { release(); }
});

test('fonte bloqueada mantém leitura, reserva da cena e chamada por teclado', async ({ page }) => {
  await page.route(`**/${fontPath}`, route => route.abort());
  for (const [width, height, size] of [[320, 568, '100%'], [320, 568, '200%'], [1920, 500, '100%']]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(size => document.documentElement.style.fontSize = size, size);
    expect((await fontUsed(page)).some(font => font.isCustomFont)).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const layout = await page.evaluate(() => {
      const box = selector => document.querySelector(selector).getBoundingClientRect();
      return { title: box('#hero-title').bottom, description: box('.hero__description').top, link: box('.hero__impacts-link').bottom, hero: box('.hero').bottom };
    });
    expect(layout.title).toBeLessThan(layout.description);
    expect(layout.link).toBeLessThan(layout.hero);
    const link = page.getByRole('link', { name: 'Descubra os impactos das queimadas', exact: true });
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#impactos')).toBeFocused();
  }
});

for (const prefix of ['/', '/projeto/']) test(`fonte e licença funcionam na distribuição ${prefix} com a CSP atual`, async ({ page }) => {
  await serve(prefix, async base => {
    const external = [];
    page.on('request', request => { if (new URL(request.url()).origin !== new URL(base).origin) external.push(request.url()); });
    await page.addInitScript(() => {
      window.fontPolicyViolations = [];
      document.addEventListener('securitypolicyviolation', event => window.fontPolicyViolations.push(event.violatedDirective));
    });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    expect((await fontUsed(page)).some(font => font.isCustomFont && /Fraunces/.test(font.familyName))).toBe(true);
    const response = await page.request.get(`${base}${fontPath}`);
    expect(response.headers()['content-type']).toBe('font/woff2');
    expect((await response.body()).length).toBe(17172);
    const license = await page.request.get(`${base}src/fonts/OFL-Fraunces.txt`);
    expect(await license.text()).toContain('SIL OPEN FONT LICENSE Version 1.1');
    expect(await page.evaluate(() => window.fontPolicyViolations)).toEqual([]);
    expect(external).toEqual([]);
  });
});
