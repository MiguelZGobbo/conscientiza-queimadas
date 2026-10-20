import { test, expect } from '@playwright/test';
import { chooseState } from './helpers/dados.js';
import { focusData, focusMetadata } from '../src/focos-base.js';
import { readFileSync } from 'node:fs';
import { states, metadata } from '../src/dados-base.js';
import { hasCompleteFocusData } from '../src/focos.js';

test('mensal de outra edição não recebe os rótulos da edição publicada', () => {
  const copy = structuredClone(focusMetadata);
  copy.months = copy.months.map(key => `${Number(key.slice(0, 4)) - 1}${key.slice(4)}`);
  copy.recentPeriod = { start: '2024-10', end: '2025-09' };
  expect(hasCompleteFocusData(focusData.ES, copy)).toBe(false);
});

for (const source of ['area', 'focus']) {
  test(`metadados incompatíveis da referência ${source} não exibem comparação enganosa`, async ({ page }) => {
    const area = structuredClone(metadata), focus = structuredClone(focusMetadata);
    area.referencePeriods[0].start = '2018-01';
    focus.annualPeriod.start = '2002-01';
    await page.route(`**/src/${source === 'area' ? 'dados' : 'focos'}-base.js`, route => route.fulfill({ contentType: 'text/javascript', body: source === 'area'
      ? `export const states=${JSON.stringify(states)};export const metadata=${JSON.stringify(area)};`
      : `export const focusData=${JSON.stringify(focusData)};export const focusMetadata=${JSON.stringify(focus)};` }));
    await page.goto('/dados.html');
    await chooseState(page, 'ES');
    await expect(page.locator(source === 'area' ? '#state-comparison' : '#state-focus-data')).toBeHidden();
    await expect(page.locator(source === 'area' ? '#state-unavailable' : '#state-focus-unavailable')).toHaveText('Dados não disponíveis para esta consulta.');
  });
}

test('panorama histórico usa a mesma medida e fonte nos biomas', async ({ page }) => {
  await page.goto('/dados.html');
  await expect(page.locator('#panorama h3').first()).toHaveText('O alcance das queimadas no Brasil');
  await expect(page.locator('#panorama')).toContainText('208.441.608');
  await expect(page.locator('#biome-chart-title')).toContainText('1985 a 2025');
  await expect(page.locator('.biome-chart__row strong')).toHaveText(['90.710.292', '88.608.526', '11.305.981', '8.005.006', '9.270.523', '541.280']);
  await expect(page.locator('.biome-chart a').first()).toHaveAttribute('href', /publication-20/);
});

test('nacional mantém anos completos e dois acumulados associados ao mesmo mês', async ({ page }) => {
  await page.goto('/dados.html');
  const annual = page.locator('#national-focus-annual');
  await expect(annual.getByRole('listitem')).toHaveCount(23);
  await expect(annual.locator('li').first()).toContainText('2003');
  await expect(annual.locator('li').last()).toContainText('2025');
  const current = page.locator('#national-focus-cumulative');
  await expect(current.getByRole('listitem')).toHaveCount(9);
  await expect(current.locator('polyline')).toHaveCount(2);
  await expect(current.locator('li').first()).toContainText('Jan');
  await expect(current.locator('li').last()).toContainText('Set');
  await expect(current.locator('li').last()).toContainText(new Intl.NumberFormat('pt-BR').format(focusData.BR.cumulative.at(-1)));
  await expect(current.locator('li').first()).toContainText('Média histórica');
  expect(focusMetadata.years).toEqual(Array.from({ length: 23 }, (_, i) => 2003 + i));
});

test('estados mantêm 12 competências recentes, referência civil e 23 anos', async ({ page }) => {
  await page.goto('/dados.html');
  for (const uf of ['ES', 'AC', 'DF', 'SP', 'ES']) {
    await chooseState(page, uf);
    await expect(page.locator('#state-comparison')).toContainText('Média anual — 2019–2024');
    await expect(page.getByRole('status', { name: 'Consulta estadual' })).toContainText('2019–2024');
    await expect(page.locator('#state-focus-monthly li')).toHaveCount(12);
    await expect(page.locator('#state-focus-annual li')).toHaveCount(23);
    await expect(page.locator('#state-focus-annual strong')).toHaveText(focusData[uf].annual.map(value => new Intl.NumberFormat('pt-BR').format(value)));
  }
});

test('totais e curvas reproduzem as competências originais, sem arredondar médias', () => {
  const audit = JSON.parse(readFileSync(new URL('../docs/auditoria-focos.json', import.meta.url)));
  for (const [uf, record] of Object.entries(focusData)) {
    const monthly = audit.monthlyByRegion[uf];
    for (const [index, year] of focusMetadata.years.entries()) {
      expect(record.annual[index]).toBe(Array.from({ length: 12 }, (_, i) => monthly[`${year}-${String(i + 1).padStart(2, '0')}`]).reduce((sum, value) => sum + value, 0));
    }
    for (let end = 1; end <= 9; end++) {
      const sum = year => Array.from({ length: end }, (_, i) => monthly[`${year}-${String(i + 1).padStart(2, '0')}`]).reduce((total, value) => total + value, 0);
      expect(record.cumulative[end - 1]).toBe(sum(2026));
      expect(record.historicalCumulative[end - 1]).toBe(focusMetadata.years.reduce((total, year) => total + sum(year), 0) / 23);
    }
  }
  expect(focusData.BR.cumulative.at(-1)).toBe(70350);
  expect(focusData.BR.historicalCumulative.at(-1)).toBeCloseTo(154373.04347826086, 8);
});
