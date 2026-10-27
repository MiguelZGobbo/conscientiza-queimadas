import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const approved = JSON.parse(readFileSync(new URL('./fixtures/sobre-aprovado.json', import.meta.url), 'utf8'));
const viewports = [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080], [844, 390], [1280, 500]];
const pages = ['index.html', 'queimadas.html', 'dados.html', 'prevencao.html', 'sobre.html', 'fontes.html'];

test.use({ reducedMotion: 'reduce' });

test('publica somente os três blocos institucionais com o texto integral aprovado', async ({ page }) => {
  const response = await page.goto('/sobre.html');
  expect(response.status()).toBe(200);
  await expect(page).toHaveTitle('Sobre o projeto — Conscientiza Queimadas');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Conscientiza Queimadas/);
  const main = page.getByRole('main');
  await expect(main).toHaveAttribute('id', 'conteudo');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('Sobre o projeto');
  await expect(main.getByRole('heading', { level: 2 })).toHaveText(['Origem e trajetória', 'Responsável pelo projeto']);
  await expect(main.locator('section')).toHaveCount(3);
  await expect(main.locator('p')).toHaveCount(7);
  expect(await main.locator('h1, h2, p').allTextContents()).toEqual(approved);
  await expect(main.locator('img, svg, form, details, nav, h3')).toHaveCount(0);
});

test('abre Sobre pelo rodapé das quatro páginas sem acrescentá-la à navbar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let footer;
  for (const path of pages) {
    await page.goto(`/${path}`);
    const nav = page.getByRole('navigation', { name: 'Principal', exact: true });
    await expect(nav.getByRole('link')).toHaveText(['Início', 'Queimadas', 'Dados', 'Prevenção']);
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(['sobre.html', 'fontes.html'].includes(path) ? 0 : 1);
    const currentFooter = page.getByRole('contentinfo');
    const html = await currentFooter.innerHTML();
    if (footer === undefined) footer = html;
    expect(html).toBe(footer);
    await expect(currentFooter.locator('.site-footer__academic > p').first()).toHaveText('Projeto desenvolvido ao longo das Atividades Extensionistas I, II e III do curso de Engenharia de Software da UNINTER.');
    await expect(currentFooter.getByRole('link', { name: 'Fontes e créditos', exact: true })).toHaveAttribute('href', './fontes');
    await expect(currentFooter.getByRole('link', { name: 'Feedback', exact: true })).toHaveAttribute('href', 'https://forms.gle/wLPDbMi2CeicbYYH9');
    const link = currentFooter.getByRole('link', { name: 'Sobre o projeto', exact: true });
    await expect(link).toHaveAttribute('href', './sobre');
    await link.click();
    await expect(page).toHaveURL(/\/sobre$/);
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
  }
});

test('resolve a página e os recursos locais em subdiretório', async ({ page }) => {
  await page.route('**/projeto/**', async route => {
    const response = await route.fetch({ url: route.request().url().replace('/projeto/', '/') });
    await route.fulfill({ response });
  });
  await page.goto('/projeto/index.html');
  await page.getByRole('contentinfo').getByRole('link', { name: 'Sobre o projeto', exact: true }).click();
  await expect(page).toHaveURL(/\/projeto\/sobre$/);
  const urls = await page.locator('a[href], link[href], script[src], img[src]').evaluateAll(elements => elements.map(element => element.href || element.src));
  for (const url of new Set(urls.filter(url => url.startsWith('http://127.0.0.1:4173/')))) {
    expect(new URL(url).pathname).toMatch(/^\/projeto\//);
    expect((await page.request.get(url.replace('/projeto/', '/'))).ok(), url).toBe(true);
  }
  await page.getByRole('contentinfo').getByRole('link', { name: 'Voltar ao topo', exact: true }).click();
  await expect(page).toHaveURL(/\/projeto\/sobre#inicio$/);
  await expect(page.locator('#inicio')).toBeFocused();
});

for (const [width, height] of viewports) {
  test(`acomoda conteúdo e rodapé em ${width}×${height}, com texto a 200%`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.goto('/sobre.html');
    for (const size of ['100%', '200%']) {
      await page.evaluate(value => { document.documentElement.style.fontSize = value; }, size);
      const layout = await page.evaluate(() => {
        const blocks = [...document.querySelectorAll('main h1, main h2, main p')];
        const bounds = blocks.map(element => element.getBoundingClientRect().toJSON());
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          clipped: [...document.querySelectorAll('main h1, main h2, main p, footer h2, footer h3, footer p, footer li, footer a')]
            .filter(element => element.scrollWidth > element.clientWidth || (element.scrollHeight > element.clientHeight && getComputedStyle(element).overflowY !== 'visible'))
            .map(element => element.textContent),
          overlap: bounds.some((box, index) => index > 0 && box.top < bounds[index - 1].bottom - 1),
          outside: bounds.some(box => box.left < 0 || box.right > innerWidth),
          bodyFont: parseFloat(getComputedStyle(document.querySelector('.reading-section__body')).fontSize),
        };
      });
      expect(layout.overflow, size).toBe(false);
      expect(layout.clipped, size).toEqual([]);
      expect(layout.overlap, size).toBe(false);
      expect(layout.outside, size).toBe(false);
      expect(layout.bodyFont).toBeGreaterThanOrEqual(size === '200%' ? 32 : 16);
      if ([320, 1440].includes(width)) {
        await page.screenshot({ path: testInfo.outputPath(`sobre-${size}.png`), fullPage: true, animations: 'disabled' });
      }
    }
  });
}

test('compartilha a escala fluida de fontes e espaçamentos com Queimadas e Prevenção', async ({ page }) => {
  test.setTimeout(45000);
  const samples = [];
  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height });
    let reference;
    for (const path of ['queimadas.html', 'prevencao.html', 'sobre.html']) {
      await page.goto(`/${path}`);
      const metrics = await page.evaluate(() => {
        const styles = selector => getComputedStyle(document.querySelector(selector));
        return {
          body: styles('.reading-section__body').fontSize,
          h1: styles('main h1').fontSize,
          h2: styles('.reading-section h2').fontSize,
          gap: styles('.reading-section__layout').rowGap,
          sectionSpace: styles('.reading-section').paddingTop,
          introSpace: styles('.page-intro').paddingTop,
          column: styles('.reading-column').width,
          gutter: styles('.reading-column').paddingLeft,
        };
      });
      if (reference === undefined) reference = metrics;
      expect(metrics, `${path} em ${width}×${height}`).toEqual(reference);
      if (path === 'sobre.html') samples.push(metrics);
    }
  }
  expect(new Set(samples.map(sample => sample.body)).size).toBeGreaterThan(1);
  expect(new Set(samples.map(sample => sample.h1)).size).toBeGreaterThan(1);
  expect(new Set(samples.map(sample => sample.sectionSpace)).size).toBeGreaterThan(1);
});

for (const width of [390, 1440]) {
  test(`preserva menu, atalho de conteúdo e foco visível por teclado em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/sobre.html');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    if (width < 960) {
      const toggle = page.locator('.menu-toggle');
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Tab');
      await expect(page.getByRole('navigation', { name: 'Principal', exact: true }).getByRole('link').first()).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(toggle).toBeFocused();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    }
    const footer = page.getByRole('contentinfo');
    const top = footer.getByRole('link', { name: 'Voltar ao topo', exact: true });
    const about = footer.getByRole('link', { name: 'Sobre o projeto', exact: true });
    await top.focus();
    await page.keyboard.press('Tab');
    await expect(about).toBeFocused();
    await expect(about).toBeInViewport();
    expect(await about.evaluate(element => element.matches(':focus-visible') && getComputedStyle(element).outlineStyle === 'solid')).toBe(true);
    const box = await about.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press('Shift+Tab');
    await expect(top).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/sobre\.html#inicio$/);
    await expect(page.locator('#inicio')).toBeFocused();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  });
}

test('navega pelo rodapé e volta ao topo sem JavaScript, respeitando movimento reduzido', async ({ browser }) => {
  for (const reducedMotion of ['reduce', 'no-preference']) {
    const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion, viewport: { width: 390, height: 844 } });
    try {
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:4173/index.html');
      await page.getByRole('contentinfo').getByRole('link', { name: 'Sobre o projeto', exact: true }).click();
      await expect(page).toHaveURL(/\/sobre$/);
      await page.getByRole('button').click();
      await expect(page.getByRole('navigation', { name: 'Principal', exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
      const top = page.getByRole('contentinfo').getByRole('link', { name: 'Voltar ao topo', exact: true });
      await top.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/sobre#inicio$/);
      await expect(page.locator('#inicio')).toBeFocused();
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(reducedMotion === 'reduce' ? 'auto' : 'smooth');
      await page.getByRole('button').focus();
      await page.keyboard.press('Enter');
      await page.getByRole('navigation', { name: 'Principal', exact: true }).getByRole('link', { name: 'Prevenção', exact: true }).focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/prevencao$/);
      await page.getByRole('button').focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('navigation', { name: 'Principal', exact: true })).toBeVisible();
    } finally {
      await context.close();
    }
  }
});

test('não apresenta violações detectáveis pelo axe WCAG 2.2 AA, inclusive no novo link', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/sobre.html');
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const about = page.getByRole('contentinfo').getByRole('link', { name: 'Sobre o projeto', exact: true });
    for (const state of ['normal', 'hover', 'focus']) {
      if (state === 'hover') await about.hover();
      if (state === 'focus') {
        await page.mouse.move(0, 0);
        await page.getByRole('contentinfo').getByRole('link', { name: 'Voltar ao topo', exact: true }).focus();
        await page.keyboard.press('Tab');
      }
      const violations = await page.evaluate(async () => (await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
      })).violations.map(({ id, nodes }) => ({ id, elements: nodes.map(node => node.target) })));
      expect(violations, `${width}px, ${state}`).toEqual([]);
    }
  }
});
