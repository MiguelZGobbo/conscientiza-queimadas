import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const approved = JSON.parse(readFileSync(new URL('./fixtures/prevencao-aprovado.json', import.meta.url), 'utf8'));
const normalize = text => text.replace(/\s+/g, ' ').trim();

test('publica integralmente as orientações aprovadas na ordem de leitura', async ({ page }) => {
  const response = await page.goto('/prevencao.html');
  expect(response.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prevenir queimadas é proteger vidas.');
  const main = page.getByRole('main');
  const text = normalize(await main.innerText());
  let position = 0;
  for (const block of approved) {
    const expected = normalize(block);
    const found = text.indexOf(expected, position);
    expect(found, expected).toBeGreaterThanOrEqual(position);
    position = found + expected.length;
  }
  await expect(main.locator('details, [role="alert"], [aria-live]')).toHaveCount(0);
  await expect(page.locator('#encontrar-incendio ol > li')).toHaveCount(4);
  await expect(main).toContainText('O canal de denúncias ambientais não substitui o Corpo de Bombeiros em situações de emergência.');
  await expect(main).toContainText('Se houver ameaça direta das chamas ou orientação de evacuação');
});

test('oferece emergência na abertura e distingue os três canais oficiais', async ({ page }) => {
  await page.goto('/prevencao.html');
  const intro = page.locator('.reading-intro');
  await expect(intro).toContainText('Viu um incêndio? Afaste-se do perigo e ligue 193.');
  await expect(intro.getByRole('link', { name: /193/ })).toHaveAttribute('href', 'tel:193');
  await expect(intro.locator('a[href="#encontrar-incendio"]')).toBeVisible();
  for (const [number, href] of [['193', 'tel:193'], ['199', 'tel:199'], ['0800 061 8080', 'tel:08000618080']]) {
    await expect(page.locator('#encontrar-incendio').getByRole('link', { name: number, exact: true })).toHaveAttribute('href', href);
  }
  await expect(page.locator('#encontrar-incendio')).toContainText('segunda a sexta-feira, das 7h às 19h');
  await expect(page.getByRole('link', { name: 'Fala.BR', exact: true })).toHaveAttribute('href', 'https://falabr.cgu.gov.br/');
});

test('encerra sem bibliografia visível e preserva o acesso prático ao Fala.BR', async ({ page }, testInfo) => {
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/prevencao.html');
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { name: 'Fontes oficiais', exact: true })).toHaveCount(0);
    await expect(main.locator('.prevention-sources')).toHaveCount(0);
    expect(await main.locator('a[href^="https:"]').evaluateAll(links => links.map(link => link.href))).toEqual(['https://falabr.cgu.gov.br/']);
    await expect(main.getByRole('heading', { name: 'A prevenção depende de todos', exact: true })).toBeVisible();
    await page.locator('.reading-next').screenshot({ path: testInfo.outputPath(`encerramento-${width}.png`), animations: 'disabled' });
  }
});

test('integra quatro páginas com destinos relativos, página atual e rodapés idênticos', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let footer;
  for (const [path, current] of [['index.html', 'Início'], ['queimadas.html', 'Queimadas'], ['dados.html', 'Dados'], ['prevencao.html', 'Prevenção']]) {
    await page.goto(`/${path}`);
    const nav = page.getByRole('navigation', { name: 'Principal', exact: true });
    await expect(nav.getByRole('link')).toHaveText(['Início', 'Queimadas', 'Dados', 'Prevenção']);
    await expect(nav.locator('[aria-current="page"]')).toHaveText(current);
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(nav.getByRole('link', { name: 'Prevenção', exact: true })).toHaveAttribute('href', './prevencao');
    const html = await page.getByRole('contentinfo').innerHTML();
    if (footer === undefined) footer = html;
    expect(html).toBe(footer);
    const paths = await nav.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')));
    expect(paths.every(path => path.startsWith('./'))).toBe(true);
  }
  await page.goto('/queimadas.html');
  await page.getByRole('link', { name: 'Explorar os dados das queimadas', exact: true }).click();
  await expect(page).toHaveURL(/\/dados$/);
  await page.getByRole('link', { name: 'Conhecer as orientações de prevenção', exact: true }).click();
  await expect(page).toHaveURL(/\/prevencao$/);
  const urls = await page.locator('a[href], link[href], script[src], img[src]').evaluateAll(elements => elements.map(element => element.href || element.src));
  for (const url of new Set(urls.filter(url => url.startsWith('http://127.0.0.1:4173/')))) {
    expect((await page.request.get(url)).ok(), url).toBe(true);
  }
});

test('mantém a navegação quando publicado em subdiretório', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/projeto/**', async route => {
    const response = await route.fetch({ url: route.request().url().replace('/projeto/', '/') });
    await route.fulfill({ response });
  });
  await page.goto('/projeto/prevencao.html');
  const nav = page.getByRole('navigation', { name: 'Principal', exact: true });
  await nav.getByRole('link', { name: 'Queimadas', exact: true }).click();
  await expect(page).toHaveURL(/\/projeto\/queimadas$/);
  await nav.getByRole('link', { name: 'Prevenção', exact: true }).click();
  await expect(page).toHaveURL(/\/projeto\/prevencao$/);
});
