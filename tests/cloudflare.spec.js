import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { withPublicationServer as serve } from './helpers/publicacao.js';
import { chooseState } from './helpers/dados.js';

const require = createRequire(import.meta.url);
const pages = ['index.html', 'queimadas.html', 'dados.html', 'prevencao.html', 'sobre.html', 'fontes.html', '404.html'];
test.setTimeout(90000);

test('cabeçalhos distribuídos protegem documentos, recursos e erros', async ({ page }) => {
  await serve('/', async base => {
    for (const path of [...pages, 'src/styles.css', 'src/dados.js', 'nivel/ausente']) {
      const response = await page.request.get(`${base}${path}`);
      expect(response.status()).toBe(path === 'nivel/ausente' ? 404 : 200);
      expect(response.headers()['x-frame-options']).toBe('DENY');
      expect(response.headers()['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
      expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
      const policy = response.headers()['content-security-policy'] || response.headers()['content-security-policy-report-only'];
      expect(response.headers()['content-security-policy']).toBeDefined();
      expect(policy).toContain("frame-ancestors 'none'");
      expect(policy).toContain("style-src 'self' 'unsafe-inline'");
    }
  });
});

for (const [width, height] of [[390, 844], [1440, 900], [320, 844]]) {
  test(`CSP e apresentação da distribuição em ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.policyViolations = [];
      document.addEventListener('securitypolicyviolation', event => window.policyViolations.push(event.violatedDirective));
    });
    await serve('/', async base => {
      for (const path of pages) {
        await page.goto(`${base}${path}`);
        await expect(page.locator('h1')).toBeVisible();
        await page.locator('footer').scrollIntoViewIfNeeded();
        await page.locator('footer img').evaluate(image => image.decode());
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(await page.evaluate(() => window.policyViolations)).toEqual([]);
        await page.screenshot({ path: testInfo.outputPath(`${path}-${width}.png`), fullPage: true });
      }
      await page.goto(`${base}dados`);
      const states = await page.locator('#state-select option').evaluateAll(options => options.map(option => option.value).filter(Boolean));
      expect(states).toHaveLength(27);
      for (const uf of states) {
        await chooseState(page, uf);
        await expect(page.locator(`[data-uf="${uf}"]`)).toHaveAttribute('aria-pressed', 'true');
      }
      for (const selector of ['.biome-chart', '.state-comparison', '#national-focus-annual', '#national-focus-cumulative', '#state-focus-monthly', '#state-focus-annual']) {
        const figure = page.locator(selector);
        await figure.focus();
        await figure.press('End');
        await expect(figure.locator('[data-chart-active]')).toHaveCount(1);
        await figure.press('Enter');
        await figure.press('Escape');
        await expect(figure.locator('[data-chart-active]')).toHaveCount(0);
      }
      const feedback = page.locator('footer a[href="https://forms.gle/wLPDbMi2CeicbYYH9"]');
      await expect(feedback).toHaveAttribute('rel', 'noopener noreferrer');
      expect(await page.evaluate(() => window.policyViolations)).toEqual([]);
      if (width < 960) {
        await page.locator('#inicio').scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Abrir menu' }).click();
      }
      await page.locator('.site-nav a[href="./prevencao"]').click();
      await expect(page).toHaveURL(`${base}prevencao`);
      expect(await page.evaluate(() => window.policyViolations)).toEqual([]);
      expect(errors).toEqual([]);
    });
  });
}

test('404 profunda mantém recursos, teclado e retorno à Home', async ({ page }) => {
  await serve('/', async base => {
    const failures = [];
    page.on('response', response => { if (response.request().resourceType() !== 'document' && response.status() >= 400) failures.push(response.url()); });
    expect((await page.goto(`${base}caminho/acentua%C3%A7%C3%A3o/ausente`)).status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('Página não encontrada');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.locator('footer img').evaluate(image => image.decode());
    await page.getByRole('link', { name: 'Voltar ao início', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(base);
    expect(failures).toEqual([]);
  });
});

test('bloqueia incorporação por outra página', async ({ page }) => {
  await serve('/', async base => {
    const blocked = [];
    page.on('console', message => { if (/X-Frame-Options|frame-ancestors/i.test(message.text())) blocked.push(message.text()); });
    await page.route(`${base}teste-iframe`, route => route.fulfill({ contentType: 'text/html', body: `<iframe src="${base}sobre.html" title="Incorporação"></iframe>` }));
    await page.goto(`${base}teste-iframe`);
    await expect.poll(() => blocked.length).toBeGreaterThan(0);
    expect(await page.locator('iframe').evaluate(frame => frame.contentDocument?.querySelector('h1')?.textContent || '')).toBe('');
  });
});

for (const javaScriptEnabled of [true, false]) {
  test.describe(`404 e texto ampliado; JS ${javaScriptEnabled}`, () => {
    test.use({ javaScriptEnabled, reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
    test('preserva leitura e navegação sem depender de JavaScript', async ({ page }) => {
      await page.route('**/src/styles.css', async route => {
        const response = await route.fetch();
        await route.fulfill({ response, body: `${await response.text()}\nhtml { font-size: 200% !important; }` });
      });
      await serve('/', async base => {
        for (const path of pages) {
          await page.goto(`${base}${path}`);
          await expect(page.locator('h1')).toBeVisible();
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
        await page.goto(`${base}404.html`);
        await page.getByRole('link', { name: 'Voltar ao início', exact: true }).click();
        await expect(page).toHaveURL(base);
      });
    });
  });
}

test('404 tem acessibilidade detectável em celular e desktop', async ({ page }) => {
  await serve('/', async base => {
    await page.route(`${base}axe-test.js`, async route => route.fulfill({ contentType: 'text/javascript', body: await readFile(require.resolve('axe-core/axe.min.js')) }));
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}404.html`);
      await page.addScriptTag({ url: `${base}axe-test.js` });
      const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations);
      expect(violations).toEqual([]);
    }
  });
});
