import { chooseState } from './helpers/dados.js';
import { test, expect } from '@playwright/test';
import { chartGeometry } from '../src/graficos.js';

test('escalas arredondadas preservam proporções, zeros e pontos sem interpolação', () => {
  const monthly = chartGeometry([3137, 28678]);
  expect(monthly.limit).toBe(30000);
  expect(monthly.ticks).toEqual([0, 10000, 20000, 30000]);
  expect(monthly.shares[0]).toBeCloseTo(3137 / 30000 * 100, 8);
  const annual = chartGeometry([184081, 200763, 189901, 278299, 136393]);
  expect(annual.limit).toBe(300000);
  expect(annual.points.split(' ')).toHaveLength(5);
  expect(annual.points.split(' ').at(-1)).toBe('900.0000,545.3567');
  expect(chartGeometry([0, 0]).shares).toEqual([0, 0]);
  expect(chartGeometry([0, 0]).points).not.toMatch(/NaN|Infinity/);
  expect(chartGeometry([1]).ticks).toEqual([0, 1]);
  expect(() => chartGeometry([null])).toThrow('Valores inválidos');
});

test('formatos variam conforme o espaço, preservando valores e uma única lista', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dados.html');
  await chooseState(page, 'ES');
  const monthly = page.locator('#state-focus-monthly');
  const annual = page.locator('#state-focus-annual');
  await expect(annual.locator('.chart-line')).toBeVisible();
  expect(await monthly.locator('.chart-results').evaluate(element => getComputedStyle(element).display)).toBe('grid');
  await expect(monthly).toHaveAttribute('data-scale-max', '100');
  expect(Number(await annual.getAttribute('data-scale-max'))).toBeGreaterThanOrEqual(385);
  await expect(annual.locator('[data-value-index="22"]')).toHaveText('385');
  await expect(page.locator('main table, main details')).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await monthly.locator('.chart-results').evaluate(element => getComputedStyle(element).display)).toBe('block');
  await expect(annual.locator('.chart-line')).toBeHidden();
  await page.setViewportSize({ width: 430, height: 844 });
  await expect(annual.locator('.chart-line')).toBeHidden();
  await expect(annual.getByRole('listitem')).toHaveCount(23);
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await expect(annual.locator('.chart-line')).toBeHidden();
  await expect(annual.locator('[data-value-index="22"]')).toHaveText('385');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('limites responsivos preservam rótulos e valores sem sobreposição', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dados.html');
  await chooseState(page, 'ES');
  for (const [selector, widths, columns] of [['#state-focus-monthly', [767, 768], 12], ['#national-focus-annual', [767, 768], 23], ['#national-focus-cumulative', [767, 768], 9]]) {
    const chart = page.locator(selector);
    for (const [index, width] of widths.entries()) {
      await chart.evaluate((element, width) => { element.style.width = `${width}px`; }, width);
      const template = await chart.locator('.chart-results').evaluate(element => getComputedStyle(element).gridTemplateColumns);
      const actualColumns = template === 'none' ? 0 : template.split(' ').length;
      if (index === 0) expect(actualColumns).toBe(0);
      else if (columns === 12) expect(actualColumns).toBe(columns);
      else expect(actualColumns).toBe((await chart.getAttribute('data-chart-mode')) === 'line' ? columns : 0);
      const values = await chart.locator('strong, .focus-chart__label > span, .cumulative-month').evaluateAll(elements => elements.map(element => {
        const bounds = element.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, clipped: element.scrollWidth > element.clientWidth + 1 };
      }));
      expect(values.every(value => !value.clipped)).toBe(true);
      const bounds = await chart.boundingBox();
      expect(values.every(value => value.left >= bounds.x - 1 && value.right <= bounds.x + bounds.width + 1)).toBe(true);
      for (let i = 0; i < values.length; i++) for (let j = i + 1; j < values.length; j++) {
        const a = values[i], b = values[j];
        expect(a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom).toBe(false);
      }
    }
  }
});

test('linha estadual atualiza os 23 pontos e não retém o estado anterior', async ({ page }) => {
  await page.goto('/dados.html');
  const { focusData } = await import('../src/focos-base.js');
  for (const uf of ['ES', 'AC', 'DF', 'SP', 'ES']) {
    await chooseState(page, uf);
    const chart = page.locator('#state-focus-annual');
    const limit = Number(await chart.getAttribute('data-scale-max'));
    const points = (await chart.locator('polyline').getAttribute('points')).split(' ').map(point => point.split(',').map(Number));
    expect(points).toHaveLength(23);
    points.forEach(([x, y], index) => {
      expect(x).toBeCloseTo((index + .5) / 23 * 1000, 3);
      expect(y).toBeCloseTo(1000 - focusData[uf].annual[index] / limit * 1000, 3);
    });
  }
});
