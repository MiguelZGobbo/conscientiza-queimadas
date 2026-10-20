import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { chooseState } from './helpers/dados.js';

const approved = JSON.parse(readFileSync(new URL('./fixtures/dados-aprovado.json', import.meta.url), 'utf8'));

test('metodologia tem quatro respostas enxutas e distingue os produtos e as médias', async ({ page }) => {
  await page.goto('/dados.html');
  const section = page.locator('#metodologia');
  await expect(section.locator('h3')).toHaveText(approved.methodologyHeadings);
  const paragraphs = await section.evaluate(element => [...element.querySelectorAll('h3')].map(heading => {
    const text = [];
    for (let next = heading.nextElementSibling; next && next.matches('p:not(.data-note)'); next = next.nextElementSibling) text.push(next.textContent);
    return text;
  }));
  expect(paragraphs.every(group => group.length >= 1 && group.length <= 2)).toBe(true);
  expect(paragraphs[0].join(' ')).toContain('1985 e 2025');
  expect(paragraphs[0].join(' ')).toContain('outubro de 2025 a setembro de 2026');
  expect(paragraphs[0].join(' ')).toContain('10 mil metros quadrados');
  expect(paragraphs[1].join(' ')).toContain('AQUA_M-T');
  expect(paragraphs[2][0]).toContain('janeiro a dezembro de 2019 a 2024, dividida por seis');
  expect(paragraphs[2][1]).toContain('acumulados de janeiro até aquele mês nos 23 anos de 2003 a 2025');
  await expect(section.locator('.data-note')).toContainText('não são atualizados em tempo real');
  await expect(section).not.toContainText(/cinco períodos|seis períodos completos|Recorte principal|out\/2019|3 de maio|208\.441\.608/);
  await expect(section.locator('details, table, .data-source')).toHaveCount(0);
});

test('contorno selecionado cobre os territórios, reutiliza as 27 geometrias e limpa a seleção', async ({ page }) => {
  await page.goto('/dados.html');
  const map = page.locator('.brazil-map');
  const selected = map.locator('[data-map-outline="selection"]');
  await expect(selected).toHaveCount(1);
  await expect(selected).toBeHidden();
  const originalOrder = await map.locator('[data-uf]').evaluateAll(paths => paths.map(path => path.dataset.uf));
  for (const [uf] of approved.states) {
    await chooseState(page, uf);
    await expect(selected).toHaveAttribute('d', await map.locator(`[data-uf="${uf}"]`).getAttribute('d'));
    await expect(selected).toBeVisible();
    const shape = await selected.evaluate(path => {
      const style = getComputedStyle(path);
      const group = path.parentElement;
      return { lastLayer: group === group.parentElement.lastElementChild, fill: style.fill, stroke: style.strokeWidth, dashes: style.strokeDasharray, vector: style.vectorEffect, pointer: style.pointerEvents, hidden: group.getAttribute('aria-hidden'), interactive: path.hasAttribute('tabindex') || path.hasAttribute('data-uf') || path.hasAttribute('role') };
    });
    expect(shape).toEqual({ lastLayer: true, fill: 'none', stroke: '2px', dashes: 'none', vector: 'non-scaling-stroke', pointer: 'none', hidden: 'true', interactive: false });
  }
  expect(await map.locator('[data-uf]').evaluateAll(paths => paths.map(path => path.dataset.uf))).toEqual(originalOrder);
  await expect(map.getByRole('button')).toHaveCount(27);
  await chooseState(page, '');
  await expect(selected).toBeHidden();
  await expect(selected).toHaveAttribute('d', '');
});

test('foco percorre as 27 UFs em ordem e tem contorno independente da seleção', async ({ page }) => {
  await page.goto('/dados.html');
  await chooseState(page, 'MT');
  const map = page.locator('.brazil-map');
  const focus = map.locator('[data-map-outline="focus"]');
  const selected = map.locator('[data-map-outline="selection"]');
  const order = [...approved.states].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
  await page.locator('#state-combobox').focus();
  await page.keyboard.press('Tab');
  await expect(selected).toHaveAttribute('d', await map.locator('[data-uf="MT"]').getAttribute('d'));
  for (const [index, [uf]] of order.entries()) {
    const path = map.locator(`[data-uf="${uf}"]`);
    await expect(path).toBeFocused();
    await expect(focus).toHaveAttribute('d', await path.getAttribute('d'));
    await expect(focus).toBeVisible();
    const style = await focus.evaluate(element => { const s = getComputedStyle(element); return { width: s.strokeWidth, dash: s.strokeDasharray, fill: s.fill, pointer: s.pointerEvents, vector: s.vectorEffect }; });
    expect(style).toEqual({ width: '4px', dash: '5px, 3px', fill: 'none', pointer: 'none', vector: 'non-scaling-stroke' });
    await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
    await expect(path).toHaveAttribute('aria-pressed', 'true');
    await expect(selected).toHaveAttribute('d', await path.getAttribute('d'));
    await page.keyboard.press('Tab');
  }
  await expect(focus).toBeHidden();
  await expect(focus).toHaveAttribute('d', '');
  await expect(map.getByRole('button')).toHaveCount(27);
});

test('contornos mantêm espessura em celular, janela baixa e texto ampliado', async ({ page }) => {
  await page.goto('/dados.html');
  for (const [width, height, text] of [[320, 568, 100], [390, 844, 100], [768, 1024, 100], [960, 720, 100], [1440, 900, 100], [1920, 1080, 100], [1280, 420, 100], [390, 844, 200], [1440, 900, 200]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(text => document.documentElement.style.fontSize = `${text}%`, text);
    await chooseState(page, 'MT');
    const selected = page.locator('[data-map-outline="selection"]');
    await expect(selected).toBeVisible();
    expect(await selected.evaluate(path => getComputedStyle(path).strokeWidth)).toBe('2px');
    await page.locator('#state-combobox').focus();
    await page.keyboard.press('Tab');
    const focus = page.locator('[data-map-outline="focus"]');
    await expect(focus).toBeVisible();
    expect(await focus.evaluate(path => getComputedStyle(path).strokeWidth)).toBe('4px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('sem JavaScript os textos revisados e alternativas estaduais permanecem disponíveis', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/dados.html');
  await expect(page.locator('#metodologia h3')).toHaveText(approved.methodologyHeadings);
  await expect(page.locator('#states-fallback tbody tr')).toHaveCount(27);
  await expect(page.locator('.brazil-map [data-map-outline]')).toHaveCount(2);
  await expect(page.locator('[data-map-outline="selection"]')).toBeHidden();
  await expect(page.locator('[data-map-outline="focus"]')).toBeHidden();
  await context.close();
});
