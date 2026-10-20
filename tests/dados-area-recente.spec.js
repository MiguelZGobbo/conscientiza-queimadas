import { test, expect } from '@playwright/test';
import { chooseState } from './helpers/dados.js';
import { states, metadata, biomes, national } from '../src/dados-base.js';
import { readFileSync } from 'node:fs';

test('estados e metodologia identificam o recorte recente e a referência civil', async ({ page }) => {
  await page.goto('/dados.html');
  await chooseState(page, 'AM');
  await expect(page.locator('#state-comparison-title')).toContainText('últimos 12 meses');
  await expect(page.locator('#state-comparison')).toContainText('Média anual — 2019–2024');
  await expect(page.getByRole('status', { name: 'Consulta estadual' })).toContainText('out/2025–set/2026');
  await expect(page.locator('#metodologia')).toContainText('janeiro a dezembro de 2019 a 2024');
  await expect(page.locator('#metodologia')).toContainText('outubro de 2025 a setembro de 2026');
  await expect(page.locator('#metodologia')).not.toContainText('out/2019–set/2025');
});

test('agregados correspondem aos meses oficiais e os textos calculados ao mesmo recorte', async ({ page }) => {
  const audit = JSON.parse(readFileSync(new URL('../docs/auditoria-area.json', import.meta.url)));
  const decimalSum = values => values.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100;
  for (const [uf, data] of Object.entries(states)) {
    const monthly = audit.sources[uf].payload.monthly;
    const total = (start, end) => decimalSum(monthly.filter(row => {
      const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
      return key >= start && key <= end;
    }).map(row => row.areaHa));
    expect(data.areaLast12Months).toBe(total('2025-10', '2026-09'));
    expect(data.referenceAverage).toBeCloseTo(metadata.referencePeriods.reduce((sum, period) => sum + total(period.start, period.end), 0) / 6, 8);
  }
  expect(national.areaLast12Months).toBe(11371137.07);
  expect(national.referenceAverage).toBeCloseTo(national.referenceTotals.reduce((sum, value) => sum + value, 0) / 6, 6);
  expect(biomes.Cerrado).toBe(6203239.88);
  expect(audit.recentNationalGroupingDifferenceHa).toBe(778.79);
  await page.goto('/dados.html');
  const text = await page.locator('#panorama').innerText();
  expect(text.match(/208\.441\.608/g)).toHaveLength(1);
  expect(text).toContain('43,5%');
  expect(text).toContain('42,5%');
  expect(text).toContain('86%');
});

for (const failure of ['zero', 'média ausente', 'período incompatível']) {
  test(`comparação recente trata ${failure} e preserva os focos`, async ({ page }) => {
    await page.route('**/src/dados-base.js', async route => {
      const copy = structuredClone(states);
      const meta = structuredClone(metadata);
      if (failure === 'zero') { copy.ES.areaLast12Months = 0; copy.ES.referenceAverage = 0; }
      if (failure === 'média ausente') copy.ES.referenceAverage = null;
      if (failure === 'período incompatível') meta.period.end = '2026-08';
      await route.fulfill({ contentType: 'text/javascript', body: `export const states=${JSON.stringify(copy)}; export const metadata=${JSON.stringify(meta)};` });
    });
    await page.goto('/dados.html');
    await chooseState(page, 'AC');
    await chooseState(page, 'ES');
    if (failure === 'zero') {
      await expect(page.locator('#comparison-area')).toHaveText('0');
      await expect(page.locator('#comparison-average')).toHaveText('0');
      expect(await page.locator('.comparison-row').evaluateAll(rows => rows.map(row => row.style.getPropertyValue('--share')))).toEqual(['0', '0']);
    } else {
      await expect(page.locator('#state-unavailable')).toHaveText('Dados não disponíveis para esta consulta.');
      await expect(page.locator('#state-comparison')).toBeHidden();
    }
    await expect(page.locator('#state-focus-annual')).toContainText('385');
  });
}
