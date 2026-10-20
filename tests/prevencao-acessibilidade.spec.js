import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const sectionIds = ['evitar-queimadas', 'encontrar-incendio', 'proteger-da-fumaca'];
const responsiveViewports = [
  [320, 568],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
  [844, 390],
  [1280, 500],
];

test('publica a estrutura semântica e os atalhos previstos para prevenção', async ({ page }) => {
  const response = await page.goto('/prevencao.html');
  expect(response.status()).toBe(200);
  await expect(page.locator('body')).toHaveClass(/(?:^|\s)prevencao-page(?:\s|$)/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.locator('main#conteudo')).toHaveCount(1);
  await expect(page.locator('header#inicio')).toHaveAttribute('tabindex', '-1');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prevenir queimadas é proteger vidas.');
  await expect(page.locator('.reading-intro a[href="tel:193"]')).toHaveCount(1);

  const contents = page.getByRole('navigation', { name: 'Nesta página' });
  await expect(contents.getByRole('link').evaluateAll(links => links.map(link => link.getAttribute('href')))).resolves.toEqual(
    sectionIds.map(id => `#${id}`),
  );
  for (const id of sectionIds) {
    await expect(page.locator(`section#${id}.reading-section`)).toHaveAttribute('tabindex', '-1');
  }
  await expect(page.locator('#encontrar-incendio ol > li')).toHaveCount(4);
});

test('reutiliza o rodapé e retorna ao início da própria página', async ({ page }) => {
  await page.goto('/');
  const existingFooter = await page.getByRole('contentinfo').innerHTML();

  await page.goto('/prevencao.html');
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  expect(await page.getByRole('contentinfo').innerHTML()).toBe(existingFooter);
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Voltar ao topo', exact: true })).toHaveAttribute('href', '#inicio');
});

test('menu mobile abre por teclado, expõe os links e fecha com Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/prevencao.html');

  const toggle = page.locator('.menu-toggle');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const navigation = page.getByRole('navigation', { name: 'Principal' });
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(navigation.getByRole('link').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();

  const shortcut = page.getByRole('navigation', { name: 'Nesta página' }).getByRole('link').first();
  await shortcut.focus();
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus-visible');
  await expect(focused).toHaveCount(1);
  expect(await focused.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid');
});

test('atalhos e retorno ao topo funcionam sem JavaScript e com movimento reduzido', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:4173/prevencao.html');
    const links = page.getByRole('navigation', { name: 'Nesta página' }).getByRole('link');
    for (const id of sectionIds) {
      await page.locator(`nav[aria-label="Nesta página"] a[href="#${id}"]`).focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeFocused();
    }

    const top = page.getByRole('contentinfo').getByRole('link', { name: 'Voltar ao topo', exact: true });
    await top.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/prevencao\.html#inicio$/);
    await expect(page.locator('#inicio')).toBeFocused();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  } finally {
    await context.close();
  }
});

test('não apresenta violações WCAG 2.2 AA detectadas pelo axe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/prevencao.html');
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const violations = await page.evaluate(async () => (await axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
  })).violations.map(({ id, nodes }) => ({ id, elements: nodes.map(node => node.target) })));
  expect(violations).toEqual([]);
});

test('mantém leitura sem overflow em oito viewports e com texto ampliado a 200%', async ({ page }, testInfo) => {
  for (const [width, height] of responsiveViewports) {
    await page.setViewportSize({ width, height });
    await page.goto('/prevencao.html');
    for (const fontSize of ['100%', '200%']) {
      await page.evaluate(size => { document.documentElement.style.fontSize = size; }, fontSize);
      const dimensions = await page.evaluate(() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        overflowingText: [...document.querySelectorAll('main p, main h1, main h2, main h3, main li')]
          .filter(element => element.scrollWidth > element.clientWidth)
          .map(element => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`),
      }));
      expect(dimensions.document, `${width}×${height} com texto em ${fontSize}`).toBeLessThanOrEqual(dimensions.viewport);
      expect(dimensions.overflowingText, `${width}×${height} com texto em ${fontSize}`).toEqual([]);
    }

    if ([320, 1440].includes(width) && height !== 390) {
      await page.evaluate(() => { document.documentElement.style.fontSize = '100%'; });
      await page.screenshot({
        path: testInfo.outputPath(`prevencao-${width}-pagina.png`),
        fullPage: true,
        animations: 'disabled',
      });
      for (const [name, selector] of [
        ['introducao', '.reading-intro'],
        ['atalhos', '.reading-contents'],
        ...sectionIds.map(id => [id, `#${id}`]),
        ['proximo', '.reading-next'],
        ['rodape', '.site-footer'],
      ]) {
        await page.locator(selector).screenshot({
          path: testInfo.outputPath(`prevencao-${width}-${name}.png`),
          animations: 'disabled',
        });
      }
    }
  }
});

test('atalhos e contato de emergência têm alvos de pelo menos 44 px', async ({ page }) => {
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/prevencao.html');
    const primaryLinks = [
      ...await page.getByRole('navigation', { name: 'Nesta página' }).getByRole('link').all(),
      page.locator('.reading-intro a[href="tel:193"]'),
    ];
    for (const link of primaryLinks) {
      const box = await link.boundingBox();
      expect(box?.height, `${width}×${height}: ${await link.getAttribute('href')}`).toBeGreaterThanOrEqual(44);
    }
  }
});
