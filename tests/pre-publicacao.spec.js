import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { withPublicationServer as serve } from './helpers/publicacao.js';

const require = createRequire(import.meta.url);
const pages = ['index.html', 'queimadas.html', 'dados.html', 'prevencao.html', 'sobre.html', 'fontes.html'];
test.setTimeout(60000);
test.use({ trace: 'retain-on-failure' });

for (const prefix of ['/', '/projeto/']) {
  test(`distribuição real ${prefix}: seis páginas, recursos, fragmentos e navegação`, async ({ page }) => {
    await serve(prefix, async base => {
      const failures = [];
      page.on('pageerror', error => failures.push(error.message));
      page.on('requestfailed', request => failures.push(request.url()));
      page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
      const titles = new Set(), descriptions = new Set();
      for (const route of pages) {
        expect((await page.goto(`${base}${route}`)).status()).toBe(200);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
        titles.add(await page.title());
        descriptions.add(await page.locator('meta[name="description"]').getAttribute('content'));
        const brokenFragments = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.hash.slice(1)).filter(id => id && !document.getElementById(decodeURIComponent(id))));
        expect(brokenFragments).toEqual([]);
        const links = await page.locator('a[href]').evaluateAll(links => links.map(link => link.href));
        for (const url of new Set(links.filter(url => url.startsWith(base)))) expect((await page.request.get(url)).status(), url).toBe(200);
        await page.locator('footer').scrollIntoViewIfNeeded();
        await page.locator('footer img').evaluate(image => image.decode());
        expect(await page.locator('footer img').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
        expect(await page.evaluate(() => [...document.styleSheets].every(sheet => sheet.cssRules.length > 0))).toBe(true);
      }
      expect(titles.size).toBe(6);
      expect(descriptions.size).toBe(6);
      expect(failures).toEqual([]);
      await page.goto(`${base}dados.html`);
      await page.getByRole('button', { name: 'Acre', exact: true }).click();
      await expect(page.locator('[data-uf="AC"]')).toHaveAttribute('aria-pressed', 'true');
      await page.locator('.site-nav a[href="./prevencao.html"]').click();
      await expect(page).toHaveURL(`${base}prevencao.html`);
    });
  });
}

test('distribuição mantém acessibilidade detectável nas seis páginas em celular e desktop', async ({ page }) => {
  await serve('/projeto/', async base => {
    await page.route(`${base}axe-test.js`, async route => route.fulfill({ contentType: 'text/javascript', body: await readFile(require.resolve('axe-core/axe.min.js')) }));
    for (const width of [390, 1440]) for (const route of pages) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}${route}`);
      await page.addScriptTag({ url: `${base}axe-test.js` });
      const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations);
      expect(violations, `${route} / ${width}px`).toEqual([]);
    }
  });
});

test('Dados adia somente a imagem distante do rodapé e a exibe ao rolar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const images = [];
  page.on('request', request => { if (request.url().includes('footer-background')) images.push(request.url()); });
  await page.goto('/dados.html', { waitUntil: 'networkidle' });
  expect(images).toEqual([]);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect.poll(() => images.length).toBe(1);
  await page.locator('footer img').evaluate(image => image.decode());
  expect(await page.locator('footer img').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test('CSP candidata em Report-Only permite navegação, SVG e seleção estadual', async ({ page }) => {
  const policy = "default-src 'self'; base-uri 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; frame-src 'none'; frame-ancestors 'none'; form-action 'none'";
  await serve('/', async base => {
    await page.addInitScript(() => {
      window.policyViolations = [];
      document.addEventListener('securitypolicyviolation', event => window.policyViolations.push({ directive: event.violatedDirective, blocked: event.blockedURI }));
    });
    await page.goto(`${base}index.html`);
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.policyViolations)).toEqual([]);
    await page.locator('.site-nav a[href="./dados.html"]').click();
    await page.getByRole('button', { name: 'Acre', exact: true }).click();
    await expect(page.locator('[data-uf="AC"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.locator('footer img').evaluate(image => image.decode());
    expect(await page.evaluate(() => window.policyViolations)).toEqual([]);
  }, { 'Content-Security-Policy-Report-Only': policy });
});
