import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { focusData, focusMetadata } from '../src/focos-base.js';
import { hasCompleteFocusData } from '../src/focos.js';
const require = createRequire(import.meta.url);

test('combobox confirma, cancela e sincroniza sem transferir foco', async ({ page }) => {
  await page.goto('/dados.html');
  const control = page.getByRole('combobox', { name: 'Selecione uma unidade federativa' });
  await expect(control).toHaveAttribute('aria-expanded', 'false');
  await control.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option')).toHaveCount(27);
  await control.press('End');
  await control.press('Escape');
  await expect(page.locator('#state-results')).toBeHidden();
  await control.press('Space');
  await control.press('e');
  await control.press('Enter');
  await expect(page.locator('#state-name')).toHaveText('Espírito Santo');
  await expect(control).toBeFocused();
  await control.press('ArrowDown');
  await control.press('ArrowDown');
  await control.press('Tab');
  await expect(control).toHaveText(/Espírito Santo/);
  await expect(page.getByRole('listbox')).toBeHidden();
  await page.getByRole('button', { name: 'Acre', exact: true }).click();
  await expect(control).toHaveText(/Acre/);
});

test('créditos compartilham margem e lista aberta cabe em janelas baixas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 420 });
  await page.goto('/dados.html');
  const map = await page.locator('.state-map figcaption').boundingBox();
  const source = await page.locator('.state-explanation .data-source').boundingBox();
  expect(map.x).toBeCloseTo(source.x, 1);
  const control = page.getByRole('combobox', { name: 'Selecione uma unidade federativa' });
  await control.click();
  const list = await page.getByRole('listbox').boundingBox();
  expect(list.height).toBeLessThanOrEqual(210);
  expect(list.y).toBeGreaterThanOrEqual(0);
  expect(list.y + list.height).toBeLessThanOrEqual(420);
});

test('metadados, 27 UFs e médias têm cálculos reproduzíveis', () => {
  expect(focusMetadata.months).toHaveLength(12);
  expect(Object.keys(focusData)).toHaveLength(28);
  expect(focusData.BR.annual.slice(-5)).toEqual([184081, 200763, 189901, 278299, 136393]);
  expect(focusData.ES.monthly).toEqual([35, 10, 25, 22, 16, 8, 46, 35, 71, 80, 89, 35]);
  const audit = JSON.parse(readFileSync(new URL('../docs/auditoria-focos.json', import.meta.url)));
  const area = JSON.parse(readFileSync(new URL('../docs/auditoria-area.json', import.meta.url)));
  expect(Object.keys(area.aggregates)).toHaveLength(35);
  for (const values of Object.values(area.aggregates)) {
    expect(values.referenceTotals).toHaveLength(6);
    expect(values.referenceAverage).toBeCloseTo(values.referenceTotals.reduce((sum, value) => sum + value, 0) / 6, 6);
  }
  for (const data of Object.values(focusData)) {
    expect(hasCompleteFocusData(data, focusMetadata)).toBe(true);
    expect(data.annual).toHaveLength(23);
  }
  for (let index = 0; index < 12; index++) {
    expect(Object.entries(focusData).filter(([uf]) => uf !== 'BR').reduce((sum, [, row]) => sum + row.monthly[index], 0)).toBe(focusData.BR.monthly[index]);
  }
  expect(audit.monthlyFiles['2026-06'].total).toBe(5209);
  expect(audit.monthlyFiles['2026-05'].daysWithoutReferenceRecords).toEqual([3]);
  expect(audit.monthlyFiles['2026-07'].daysWithoutReferenceRecords).toEqual([10, 22]);
});

test('lista aberta tem nomes acessíveis, contraste e foco de teclado', async ({ page }) => {
  await page.goto('/dados.html');
  const control = page.getByRole('combobox', { name: 'Selecione uma unidade federativa' });
  await control.press('ArrowUp');
  await expect(control).toHaveAttribute('aria-activedescendant', 'state-option-TO');
  await control.press('Home');
  await control.press('a');
  await control.press('a');
  await expect(control).toHaveAttribute('aria-activedescendant', 'state-option-AL');
  const style = await control.evaluate(element => ({ width: getComputedStyle(element).outlineWidth, offset: getComputedStyle(element).outlineOffset }));
  expect(style).toEqual({ width: '2px', offset: '2px' });
  const snapshot = await control.ariaSnapshot();
  expect(snapshot).toContain('combobox "Selecione uma unidade federativa"');
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  expect(await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(({ id }) => id))).toEqual([]);
  await page.locator('#estados-title').click();
  await expect(control).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#state-results')).toBeHidden();
});

test('falha na melhoria mantém o seletor nativo operante', async ({ page }) => {
  await page.route('**/src/seletor-estados.js', route => route.fulfill({ status: 404, body: '' }));
  await page.goto('/dados.html');
  const native = page.locator('#state-select');
  await expect(native).toBeVisible();
  await native.selectOption('ES');
  await expect(page.locator('#state-name')).toHaveText('Espírito Santo');
  await expect(page.locator('#state-focus-annual')).toContainText('385');
});

test('as 27 opções podem ser confirmadas por teclado sem mover a página', async ({ page }) => {
  await page.goto('/dados.html');
  const control = page.locator('#state-combobox');
  await control.scrollIntoViewIfNeeded();
  await control.focus();
  const options = await page.locator('#state-options [role="option"]').evaluateAll(items => items.map(item => ({ uf: item.dataset.value, name: item.textContent })));
  for (const [index, option] of options.entries()) {
    await control.press('ArrowDown');
    await control.press(index ? 'ArrowDown' : 'Home');
    const top = await page.evaluate(() => scrollY);
    await control.press('Enter');
    await expect(page.locator('#state-name')).toHaveText(option.name);
    await expect(page.locator(`[data-uf="${option.uf}"]`)).toHaveAttribute('aria-pressed', 'true');
    await expect(control).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBe(top);
  }
});
