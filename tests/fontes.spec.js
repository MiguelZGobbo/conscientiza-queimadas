import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pages = ['index.html', 'queimadas.html', 'dados.html', 'prevencao.html', 'sobre.html', 'fontes.html'];
const viewports = [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080], [844, 390], [1280, 500]];
test.use({ reducedMotion: 'reduce' });

test('abre Fontes pelo atalho de todos os rodapés, mantendo a navbar', async ({ page }) => {
  let footerHTML;
  for (const path of pages) {
    await page.goto(`/${path}`);
    const footer = page.getByRole('contentinfo');
    const html = await footer.innerHTML();
    footerHTML ??= html;
    expect(html).toBe(footerHTML);
    const nav = page.getByRole('navigation', { name: 'Principal', exact: true });
    await expect(nav.getByRole('link')).toHaveText(['Início', 'Queimadas', 'Dados', 'Prevenção']);
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(['sobre.html', 'fontes.html'].includes(path) ? 0 : 1);
    const link = footer.getByRole('link', { name: 'Fontes e créditos', exact: true });
    await expect(link).toHaveAttribute('href', './fontes');
    await link.click();
    await expect(page).toHaveURL(/\/fontes$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fontes e créditos');
    await expect(footer.getByRole('link', { name: 'Feedback', exact: true })).toHaveAttribute('href', 'https://forms.gle/wLPDbMi2CeicbYYH9');
    await expect(footer.locator('.site-footer__availability')).toHaveText('Formulário externo no Google Forms. Abre em nova aba.');
  }
});

test('publica referências auditadas, com métodos distintos e créditos sem licença presumida', async ({ page }) => {
  expect((await page.goto('/fontes.html')).status()).toBe(200);
  await expect(page).toHaveTitle('Fontes e créditos — Conscientiza Queimadas');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 2 })).toHaveText([
    'Conteúdos educativos e prevenção', 'Dados e metodologia', 'Recursos e créditos', 'Referências técnicas',
  ]);
  const hrefs = await main.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(hrefs.every(href => href.startsWith('https://'))).toBe(true);
  expect(new Set(hrefs).size).toBe(hrefs.length);
  expect(hrefs.some(href => href.includes('publication-20.html'))).toBe(true);
  expect(hrefs.some(href => href.includes('/monitor-do-fogo/'))).toBe(true);
  expect(hrefs.some(href => href.includes('Desastres_em_propriedades_ruraiscomISBN2.pdf'))).toBe(true);
  expect(hrefs.some(href => /publication-(25|59|60)\.html|handle\/1\/6130|cbm\.sc\.gov|icmbio|gov\.br\/mma/.test(href))).toBe(false);
  await expect(main.locator('#fonte-raf')).toContainText('1985–2025');
  await expect(main.locator('#fonte-monitor')).toContainText('outubro de 2025 a setembro de 2026');
  await expect(main.locator('#fonte-inpe')).toContainText('AQUA_M-T');
  await expect(main.locator('#fonte-inpe')).toContainText('Plano de Dados Abertos do INPE');
  await expect(main.locator('#fonte-inpe')).toContainText('Não foi identificado um nome de licença específico para cada arquivo.');
  await expect(main.locator('#fonte-inpe')).not.toContainText('CC BY');
  const credits = main.locator('#creditos');
  await expect(credits.getByText('Imagens e ilustrações artísticas criadas para o projeto por Miguel Zager Gobbo.', { exact: true })).toHaveCount(1);
  await expect(credits).not.toContainText(/ImageGen|inteligência artificial|\bIA\b|ainda precisam ser confirmadas/);
  await expect(credits.getByRole('heading', { name: 'Paisagem do rodapé', exact: true })).toHaveCount(0);
  await expect(main.locator('#referencias-tecnicas')).toContainText('não representa certificação');
  await expect(main.locator('form, details, button')).toHaveCount(0);
});

for (const [width, height] of viewports) {
  test(`reutiliza a escala de Sobre e acomoda referências em ${width}×${height}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    const metrics = async () => page.evaluate(() => {
      const value = (selector, property) => getComputedStyle(document.querySelector(selector))[property];
      return [value('main', 'fontSize'), value('h1', 'fontSize'), value('.reading-section h2', 'fontSize'), value('.reading-section', 'paddingTop'), value('.reading-column', 'width')];
    });
    await page.goto('/sobre.html');
    const reference = await metrics();
    await page.goto('/fontes.html');
    expect(await metrics()).toEqual(reference);
    for (const size of ['100%', '200%']) {
      await page.evaluate(value => { document.documentElement.style.fontSize = value; }, size);
      const result = await page.evaluate(() => {
        const elements = [...document.querySelectorAll('main h1, main h2, main h3, main p, main li, main a')];
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          outside: elements.filter(element => { const box = element.getBoundingClientRect(); return box.left < 0 || box.right > innerWidth + 1; }).map(element => element.textContent),
          clipped: elements.filter(element => element.scrollWidth > element.clientWidth + 1 || (element.scrollHeight > element.clientHeight + 1 && getComputedStyle(element).overflowY !== 'visible')).map(element => element.textContent),
          targets: [...document.querySelectorAll('main a')].every(element => element.getBoundingClientRect().height >= 44),
        };
      });
      expect(result).toEqual({ overflow: false, outside: [], clipped: [], targets: true });
      if ([320, 1440].includes(width)) await page.screenshot({ path: testInfo.outputPath(`fontes-${size}.png`), fullPage: true, animations: 'disabled' });
    }
  });
}

test('preserva o atalho em subdiretório e retorna ao topo da própria página', async ({ page }) => {
  await page.route('**/projeto/**', async route => {
    const response = await route.fetch({ url: route.request().url().replace('/projeto/', '/') });
    await route.fulfill({ response });
  });
  await page.goto('/projeto/sobre.html');
  await page.getByRole('contentinfo').getByRole('link', { name: 'Fontes e créditos', exact: true }).click();
  await expect(page).toHaveURL(/\/projeto\/fontes$/);
  await page.getByRole('contentinfo').getByRole('link', { name: 'Voltar ao topo', exact: true }).click();
  await expect(page).toHaveURL(/\/projeto\/fontes#inicio$/);
  await expect(page.locator('#inicio')).toBeFocused();
});

test('funciona sem JavaScript, com teclado e menu móvel', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/sobre.html');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Sobre o projeto', exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Fontes e créditos', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/fontes$/);
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    const link = page.getByRole('main').getByRole('link').first();
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
    expect(await link.evaluate(element => element.matches(':focus-visible') && getComputedStyle(element).outlineStyle === 'solid')).toBe(true);
    await page.getByRole('button').click();
    await expect(page.getByRole('navigation', { name: 'Principal', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Voltar ao topo', exact: true }).click();
    await expect(page.locator('#inicio')).toBeFocused();
  } finally { await context.close(); }
});

test('não apresenta violações detectáveis pelo axe no celular e desktop', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/fontes.html');
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => (await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    })).violations.map(({ id, nodes }) => ({ id, elements: nodes.map(node => node.target) })));
    expect(violations).toEqual([]);
  }
});
