import { chooseState } from './helpers/dados.js';
import { test, expect } from '@playwright/test';

import { focusData, focusMetadata } from '../src/focos-base.js';
const annualTotals = focusData.BR.annual;
const number = value => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);

test('gráficos têm uma única apresentação em listas acessíveis, sem opções de tabela', async ({ page }) => {
  await page.goto('/dados.html');
  for (const uf of ['', 'ES']) {
    if (uf) await chooseState(page, uf);
    await expect(page.locator('main table, main details, main summary')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText('em tabela');
  }
  for (const [selector, count] of [['.biome-chart', 6], ['#state-comparison', 2], ['#national-focus-cumulative', 9], ['#national-focus-annual', 23], ['#state-focus-monthly', 12], ['#state-focus-annual', 23]]) {
    const figure = page.locator(selector);
    await expect(figure).toHaveAccessibleName(/.+/);
    await expect(figure.getByRole('listitem')).toHaveCount(count);
    const snapshot = await figure.ariaSnapshot();
    expect(snapshot.match(/- listitem/g)).toHaveLength(count);
    // A forma das barras é decorativa; o rótulo e o valor pertencem ao mesmo item.
    const rows = figure.getByRole('listitem');
    for (const row of await rows.all()) {
      for (const value of await row.locator('strong').all()) await expect(value).toHaveText(/^\d[\d.,]*$/);
      for (const bar of await row.locator('.bar').all()) await expect(bar).toHaveAttribute('aria-hidden', 'true');
    }
  }
  const monthly = await page.locator('#state-focus-monthly').ariaSnapshot();
  expect(monthly).toContain('Ago/2026 · maior contagem');
  expect(monthly).toContain('89');
  const annual = await page.locator('#state-focus-annual').ariaSnapshot();
  expect(annual.indexOf('2021')).toBeLessThan(annual.lastIndexOf('2025'));
  expect(annual).toContain('385');
});

test('apresentação mantém valores nas barras e elimina blocos duplicados', async ({ page }) => {
  await page.goto('/dados.html');
  await chooseState(page, 'ES');
  await expect(page.locator('#state-metrics, .focus-metrics')).toHaveCount(0);
  await expect(page.locator('#state-comparison')).toContainText('5.151');
  await expect(page.locator('#state-comparison')).toContainText(number((await import('../src/dados-base.js')).states.ES.referenceAverage));
  await expect(page.locator('#state-focus-annual .focus-chart__row').last()).toContainText('385');
  const peak = page.locator('#state-focus-monthly .focus-chart__row').filter({ hasText: 'maior contagem' });
  // Apenas o marcador do mês máximo fica visível, sem um segundo indicador acima do gráfico.
  await expect(peak.locator('[data-peak-index]:visible')).toHaveCount(1);
  await expect(page.locator('#state-focus-monthly [data-peak-index="10"]')).toBeVisible();
  await expect(page.locator('#state-focus-monthly .focus-chart__row').nth(10)).toContainText('89');
  await chooseState(page, 'AC');
  await expect(page.locator('#state-focus-monthly [data-peak-index="7"]')).toBeHidden();
  await expect(page.locator('#state-focus-monthly [data-peak-index="11"]')).toBeVisible();
});

test('sumário segue Queimadas e leva às três seções com foco no destino', async ({ page }) => {
  await page.goto('/dados.html');
  const contents = page.getByRole('navigation', { name: 'Nesta página', exact: true });
  await expect(contents.getByRole('link')).toHaveText(['O retrato do fogo no Brasil', 'Explore os estados brasileiros', 'Entenda os dados']);
  await contents.getByRole('link', { name: 'Explore os estados brasileiros' }).click();
  await expect(page.locator('#estados')).toBeFocused();
  expect(await contents.evaluate(element => element.previousElementSibling.matches('.data-intro'))).toBe(true);
  const styles = await contents.evaluate(element => ({
    columns: getComputedStyle(element.querySelector('ul')).gridTemplateColumns.split(' ').length,
    linkHeight: element.querySelector('a').getBoundingClientRect().height,
  }));
  expect(styles.columns).toBe(1);
  expect(styles.linkHeight).toBeGreaterThanOrEqual(44);
});

test('mapa centraliza e redimensiona proporcionalmente pela largura e altura', async ({ page }) => {
  const measurements = [];
  for (const [width, height] of [[1440, 900], [1920, 1080], [1920, 420], [390, 844], [320, 568]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/dados.html');
    const map = page.locator('.brazil-map');
    const original = await map.boundingBox();
    const ratio = await map.evaluate(element => element.viewBox.baseVal.width / element.viewBox.baseVal.height);
    expect(original.width / original.height).toBeCloseTo(ratio, 2);
    expect(original.height).toBeLessThanOrEqual(height * .65 + 1);
    expect(original.width).toBeLessThanOrEqual(640 + 1);
    expect(Math.abs(original.x + original.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    await chooseState(page, 'ES');
    const selected = await map.boundingBox();
    expect(selected.x).toBeCloseTo(original.x, 1);
    const flow = await page.locator('.state-layout').evaluate(element => {
      const map = element.querySelector('.state-map').getBoundingClientRect();
      const results = element.querySelector('#state-results').getBoundingClientRect();
      return { mapBottom: map.bottom, resultsTop: results.top, mapTop: map.top + scrollY };
    });
    expect(flow.resultsTop).toBeGreaterThanOrEqual(flow.mapBottom);
    expect(flow.mapTop).toBeCloseTo(original.y, 0);
    measurements.push(original.width);
  }
  expect(measurements[1]).toBeGreaterThan(measurements[2]);
  expect(measurements[3]).toBeGreaterThan(measurements[4]);
});

test('27 estados não exibem retângulo e distinguem foco geométrico de seleção e hover', async ({ page }) => {
  await page.goto('/dados.html');
  const states = page.locator('.brazil-map [data-uf]');
  for (const state of await states.all()) {
    await state.focus();
    await state.press('Enter');
    expect(await state.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('none');
    const contour = page.locator('[data-map-outline="focus"]');
    await expect(contour).toBeVisible();
    const focus = await contour.evaluate(element => ({
      outline: getComputedStyle(element).outlineStyle,
      dashes: getComputedStyle(element).strokeDasharray,
      width: parseFloat(getComputedStyle(element).strokeWidth),
    }));
    expect(focus.outline).toBe('none');
    expect(focus.dashes).not.toBe('none');
    expect(focus.width).toBeGreaterThanOrEqual(3);
  }
  const mt = page.getByRole('button', { name: 'Mato Grosso', exact: true });
  await mt.click();
  await mt.hover();
  expect(await mt.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('none');
  expect(await mt.evaluate(element => getComputedStyle(element).fill)).toBe('rgb(155, 62, 36)');
  await page.locator('#state-combobox').focus();
  await page.keyboard.press('Tab');
  const acre = page.getByRole('button', { name: 'Acre', exact: true });
  await acre.hover();
  await acre.press('Enter');
  expect(await page.locator('[data-map-outline="focus"]').evaluate(element => parseFloat(getComputedStyle(element).strokeWidth))).toBeGreaterThanOrEqual(3);
});

test('panorama separa anos completos e acompanhamento acumulado de 2026', async ({ page }) => {
  await page.goto('/dados.html');
  const annual = page.locator('#national-focus-annual .focus-chart__row');
  await expect(annual).toHaveCount(23);
  for (const [i, value] of annualTotals.entries()) {
    await expect(annual.nth(i)).toContainText(String(2003 + i));
    await expect(annual.nth(i)).toContainText(number(value));
  }
  await expect(page.locator('#national-focus-cumulative').getByRole('listitem')).toHaveCount(9);
  await expect(page.locator('#panorama')).toContainText('detecções');
});

test('novos indicadores acompanham todas as 27 UFs e conservam as escalas em zero', async ({ page }) => {
  await page.goto('/dados.html');
  const { focusData } = await import('../src/focos-base.js');
  for (const [uf, data] of Object.entries(focusData).filter(([key]) => key !== 'BR')) {
    await chooseState(page, uf);
    await expect(page.locator('#state-focus-annual .focus-chart__row [data-value-index="22"]')).toHaveText(number(data.annual[22]));
    await expect(page.locator('#state-focus-monthly .focus-chart__row')).toHaveCount(12);
    await expect(page.locator('#state-focus-annual .focus-chart__row')).toHaveCount(23);
    const widths = await page.locator('#state-focus-monthly .focus-chart__row').evaluateAll(elements => elements.map(element => parseFloat(element.style.getPropertyValue('--share'))));
    const limit = Number(await page.locator("#state-focus-monthly").getAttribute("data-scale-max"));
    expect(limit).toBeGreaterThanOrEqual(Math.max(...data.monthly));
    data.monthly.forEach((value, index) => expect(widths[index]).toBeCloseTo(value / limit * 100, 3));
  }
  await chooseState(page, 'ES');
  await expect(page.locator('#state-focus-annual .focus-chart__row [data-value-index="22"]')).toHaveText('385');
  await expect(page.locator('#comparison-area')).toHaveText('5.151');
  await expect(page.getByRole('status', { name: 'Consulta estadual' })).toContainText('472 focos');
});

test('empates mensais apresentam todos os meses e dados incompletos não viram zero', async ({ page }) => {
  await page.route('**/src/focos-base.js', async route => {
    const { focusData, focusMetadata } = await import('../src/focos-base.js');
    const copy = structuredClone(focusData);
    copy.ES.monthly = [200, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copy.AC.monthly = null;
    await route.fulfill({ contentType: 'text/javascript', body: `export const focusData = ${JSON.stringify(copy)}; export const focusMetadata = ${JSON.stringify(focusMetadata)};` });
  });
  await page.goto('/dados.html');
  await chooseState(page, 'ES');
  await expect(page.locator('#state-focus-monthly [data-peak-index]:visible')).toHaveCount(2);
  await expect(page.locator('#state-focus-monthly [data-peak-index="0"]')).toBeVisible();
  await expect(page.locator('#state-focus-monthly [data-peak-index="1"]')).toBeVisible();
  await expect(page.getByRole('status', { name: 'Consulta estadual' })).toContainText('Outubro/2025 e novembro/2025 · 200 focos em cada mês');
  await chooseState(page, 'AC');
  await expect(page.locator('#state-focus-unavailable')).toHaveText('Dados não disponíveis para esta consulta.');
  await expect(page.locator('#state-focus-data')).toBeHidden();
  await expect(page.locator('#comparison-area')).toHaveText('122.524');
});

test('série mensal zerada não inventa meses de maior contagem', async ({ page }) => {
  await page.route('**/src/focos-base.js', async route => {
    const { focusData, focusMetadata } = await import('../src/focos-base.js');
    const copy = structuredClone(focusData);
    copy.ES.monthly = Array(12).fill(0);
    copy.ES.annual = Array(23).fill(0);
    await route.fulfill({ contentType: 'text/javascript', body: `export const focusData = ${JSON.stringify(copy)}; export const focusMetadata = ${JSON.stringify(focusMetadata)};` });
  });
  await page.goto('/dados.html');
  await chooseState(page, 'AC');
  await chooseState(page, 'ES');
  await expect(page.locator('#state-focus-monthly [data-peak-index]:visible')).toHaveCount(0);
  await expect(page.locator('#state-focus-monthly [data-focus-empty]')).toBeVisible();
  await expect(page.locator('#state-focus-annual .focus-chart__row').last()).toContainText('0');
  const widths = await page.locator('#state-focus-monthly .focus-chart__row').evaluateAll(elements => elements.map(element => element.style.getPropertyValue('--share')));
  expect(widths).toEqual(Array(12).fill('0'));
  await chooseState(page, 'AC');
  await expect(page.locator('#state-focus-monthly [data-focus-empty]')).toBeHidden();
  await expect(page.locator('#state-focus-monthly [data-peak-index]:visible')).toHaveCount(1);
});

for (const [source, survivingValue] of [['focos-base.js', '5.151'], ['dados-base.js', '385']]) {
  for (const failure of ['404', 'avaliação']) {
    test(`falha de ${failure} em ${source} preserva a consulta da outra fonte`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route(`**/src/${source}`, route => route.fulfill(failure === '404'
        ? { status: 404, body: 'Arquivo não disponível.' }
        : { contentType: 'text/javascript', body: 'throw new Error("Fonte indisponível");' }));
      await page.goto('/dados.html');
      await expect(page.locator('#state-select')).toBeEnabled();
      await chooseState(page, 'ES');
      await expect(page.locator('#state-name')).toHaveText('Espírito Santo');
      await expect(page.locator(source === 'focos-base.js' ? '#comparison-area' : '#state-focus-annual .focus-chart__row [data-value-index="22"]')).toHaveText(survivingValue);
      await expect(page.locator(source === 'focos-base.js' ? '#state-focus-unavailable' : '#state-unavailable')).toHaveText('Dados não disponíveis para esta consulta.');
      await expect(page.locator('.brazil-map [role="button"]')).toHaveCount(27);
      expect(errors).toEqual([]);
    });
  }
}

test('créditos curtos preservam fontes e o expansível completo deixa Dados', async ({ page }) => {
  await page.goto('/dados.html');
  await expect(page.locator('#fontes, .data-provenance')).toHaveCount(0);
  await expect(page.locator('main').getByText('Fontes e créditos', { exact: true })).toHaveCount(0);
  await expect(page.locator('.biome-chart .data-source')).toContainText('CC BY 4.0');
  await expect(page.locator('.biome-chart .data-source a').first()).toHaveAttribute('href', /publication-20/);
  await expect(page.locator('.national-focus > .data-source')).toContainText('INPE');
  await expect(page.locator('.national-focus > .data-source')).not.toContainText('CC BY');
  await expect(page.locator('.state-map figcaption')).toContainText('IBGE');
  await expect(page.locator('.state-map figcaption')).toContainText('simplificados e reprojetados');
  const institutional = page.locator('.site-footer__institutional');
  await expect(institutional.getByText('Fontes e créditos', { exact: true })).toBeVisible();
  await expect(institutional.locator('a')).toHaveCount(0);
  await expect(institutional).toContainText('Conteúdos ainda não disponíveis.');
});

test('sem JavaScript, dados de focos nacionais e estaduais ficam disponíveis', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 568 } });
  const page = await context.newPage();
  await page.goto('/dados.html');
  await expect(page.locator('#national-focus-annual .focus-chart__row [data-value-index="22"]')).toHaveText('136.393');
  const es = page.locator('#focus-states-fallback tbody tr').filter({ has: page.getByRole('rowheader', { name: 'Espírito Santo', exact: true }) });
  await expect(es).toContainText('472');
  await expect(page.locator('#focus-states-fallback tbody tr')).toHaveCount(27);
  await expect(page.locator('#panorama table, #panorama details')).toHaveCount(0);
  await expect(page.locator('.biome-chart').getByRole('listitem')).toHaveCount(6);
  await expect(page.locator('#national-focus-cumulative').getByRole('listitem')).toHaveCount(9);
  await page.getByText('Espírito Santo — distribuição e evolução dos focos', { exact: true }).click();
  await expect(page.locator('#fallback-ES-monthly tbody tr')).toHaveCount(12);
  await expect(page.locator('#fallback-ES-annual tbody tr')).toHaveCount(23);
  await expect(page.locator('#fallback-ES-monthly tbody tr').nth(10)).toContainText('89 focos');
  await expect(page.locator('#fallback-ES-annual tbody tr').last()).toContainText('385 focos');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
