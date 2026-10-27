import { test, expect } from '@playwright/test';
import { withPublicationServer as serve } from './helpers/publicacao.js';

test.setTimeout(90000);
test.use({ hasTouch: true, isMobile: true });

test('rodapé acompanha largura e altura da escala principal, inclusive a 200%', async ({ page }) => {
  await page.goto('/sobre.html');
  const sizes = [];
  for (const [width, height] of [[390, 844], [1920, 1080], [1920, 500]]) {
    await page.setViewportSize({ width, height });
    sizes.push(await page.locator('footer p').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize)));
  }
  expect(sizes[1]).toBeGreaterThan(sizes[0]);
  expect(sizes[2]).toBeLessThan(sizes[1]);
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  expect(await page.locator('footer p').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(30);
});

const pages = ['index.html', 'queimadas.html', 'dados.html', 'prevencao.html', 'sobre.html', 'fontes.html', '404.html'];
const viewports = [[320, 568], [360, 800], [375, 812], [390, 844], [414, 896], [599, 900], [600, 900], [768, 1024], [1024, 768], [1199, 900], [1200, 900], [1440, 900], [1920, 1080], [844, 390], [896, 414], [1920, 500]];

for (const route of pages) test(`rodapé fluido sem cortes: ${route}, orientações e texto ampliado`, async ({ page }, testInfo) => {
  await serve('/', async base => {
    await page.goto(`${base}${route}`);
    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      for (const fontSize of ['100%', '200%']) {
        await page.evaluate(size => document.documentElement.style.fontSize = size, fontSize);
        const layout = await page.locator('footer').evaluate(footer => {
          const bounds = footer.getBoundingClientRect();
          const texts = [...footer.querySelectorAll('p,h2,h3,a')];
          const groups = [...footer.querySelector('.site-footer__groups').children].map(e => e.getBoundingClientRect().toJSON());
          return {
            width: innerWidth, scroll: document.documentElement.scrollWidth,
            clipped: texts.filter(el => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1).map(el => el.textContent),
            outside: texts.filter(el => { const b = el.getBoundingClientRect(); return b.left < -1 || b.right > innerWidth + 1 || b.bottom > bounds.bottom + 1; }).map(el => el.textContent),
            links: [...footer.querySelectorAll('a')].map(el => el.getBoundingClientRect().toJSON()), groups,
          };
        });
        expect(layout.scroll, `${width}×${height}/${fontSize}`).toBeLessThanOrEqual(width);
        expect(layout.clipped).toEqual([]);
        expect(layout.outside).toEqual([]);
        for (const link of layout.links) { expect(link.height).toBeGreaterThanOrEqual(44); expect(link.width).toBeGreaterThanOrEqual(44); }
        for (const [i, a] of layout.groups.entries()) for (const b of layout.groups.slice(i + 1)) {
          expect(a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1).toBe(true);
        }
        if ([320, 390, 768, 1440, 1920].includes(width) && height > 500) {
          await page.locator('footer').scrollIntoViewIfNeeded();
          await page.locator('footer img').evaluate(image => image.decode());
          await page.locator('footer').screenshot({ path: testInfo.outputPath(`footer-${width}-${fontSize}.png`), scale: 'css', animations: 'disabled' });
        }
      }
    }
    // Uma palavra longa deve quebrar sem deslocar a coluna vizinha.
    await page.locator('.site-footer__academic p').first().evaluate(el => { el.textContent += ` ${'ConteudoLongo'.repeat(12)}`; });
    await page.setViewportSize({ width: 320, height: 568 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

for (const javaScriptEnabled of [true, false]) for (const reducedMotion of ['reduce', 'no-preference']) {
  test(`percurso móvel, menu e histórico: JS ${javaScriptEnabled}, movimento ${reducedMotion}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, javaScriptEnabled, reducedMotion });
    try {
      await serve('/', async base => {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base);
        for (const [name, route] of [['Queimadas', 'queimadas'], ['Dados', 'dados'], ['Prevenção', 'prevencao'], ['Sobre o projeto', 'sobre'], ['Fontes e créditos', 'fontes'], ['Início', '']]) {
          const footer = ['sobre', 'fontes'].includes(route);
          if (!footer) await page.locator('.menu-toggle').tap();
          const link = page.locator(footer ? 'footer' : '.site-nav').getByRole('link', { name, exact: true });
          await link.tap();
          await expect(page).toHaveURL(`${base}${route}`);
          await expect(page.locator('h1')).toBeVisible();
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
        await page.goBack(); await expect(page).toHaveURL(`${base}fontes`);
        await page.goForward(); await expect(page).toHaveURL(base);
        expect(errors).toEqual([]);
      });
    } finally { await context.close(); }
  });
}

test('links internos navegam diretamente às URLs canônicas em raiz e subdiretório', async ({ page }) => {
  for (const prefix of ['/', '/projeto/']) await serve(prefix, async base => {
    for (const route of ['', 'queimadas', 'dados', 'prevencao', 'sobre', 'fontes']) {
      await page.goto(`${base}${route}`);
      const internal = await page.locator('a[href]').evaluateAll(links => links.filter(a => a.origin === location.origin).map(a => a.pathname));
      expect(internal.filter(path => path.endsWith('.html'))).toEqual([]);
    }
  });
});

test('rodapé mantém reflow com zoom CSS de 200% e foco por teclado', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/sobre.html');
  await page.evaluate(() => document.documentElement.style.zoom = '2');
  const footer = page.locator('footer');
  const metrics = await footer.evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, clipped: [...el.querySelectorAll('h2,h3,p,a')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent) }));
  expect(metrics.scroll).toBeLessThanOrEqual(metrics.width + 1);
  expect(metrics.clipped).toEqual([]);
  const top = footer.getByRole('link', { name: 'Voltar ao topo', exact: true });
  const about = footer.getByRole('link', { name: 'Sobre o projeto', exact: true });
  await top.focus();
  // O port Windows do WebKit pula links com Tab; a preferência nativa é aceite físico.
  if (browserName === 'chromium') { await page.keyboard.press('Tab'); await expect(about).toBeFocused(); }
  else await about.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/sobre$/);
});

test('marca não fragmenta palavras a 200% e atalho de topo cabe no desktop', async ({ page }) => {
  await page.goto('/sobre.html');
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  for (const width of [320, 375, 390, 414, 600, 640, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const words = await page.locator('footer h2').evaluate(el => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), result = [];
      while (walker.nextNode()) {
        const node = walker.currentNode, text = node.textContent.trim();
        if (!text) continue;
        const range = document.createRange();
        range.setStart(node, node.textContent.indexOf(text)); range.setEnd(node, node.textContent.indexOf(text) + text.length);
        result.push({ text, lines: range.getClientRects().length });
      }
      return result;
    });
    expect(words.map(word => word.text)).toEqual(['Conscientiza', 'Queimadas']);
    for (const word of words) expect(word.lines, `${width}px: ${word.text}`).toBe(1);
  }
  await page.evaluate(() => document.documentElement.style.fontSize = '100%');
  await page.setViewportSize({ width: 1920, height: 1080 });
  expect(await page.locator('footer a').first().evaluate(el => { const range = document.createRange(); range.selectNodeContents(el); return range.getClientRects().length; })).toBe(1);
});
