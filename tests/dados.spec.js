import { chooseState } from './helpers/dados.js';
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
const handoff = readFileSync(new URL('./fixtures/dados-aprovado.json', import.meta.url), 'utf8');
const approved = JSON.parse(handoff);
const number = value => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);

test('publica o conteúdo revisado nas quatro seções e preserva o rodapé', async ({ page }) => {
  const response = await page.goto('/dados.html');
  expect(response.status()).toBe(200);
  const geometry = await page.locator('.brazil-map [data-uf]').evaluateAll(elements => elements.map(element => [element.dataset.uf, element.getAttribute('d')]).sort(([a], [b]) => a.localeCompare(b)).map(([uf, path]) => `${uf}:${path}\n`).join(''));
  expect(createHash('sha256').update(geometry).digest('hex')).toBe(approved.mapGeometrySha256);
  await expect(page.locator('main > section')).toHaveCount(4);
  await expect(page.locator('h1')).toHaveText('Queimadas em números');
  await expect(page.locator('#metodologia h3')).toHaveText(approved.methodologyHeadings);
  const text = await page.locator('main').innerText();
  let last = -1;
  for (const block of approved.paragraphs) {
    const position = text.indexOf(block);
    expect(position, block).toBeGreaterThan(last);
    last = position;
  }
  const footer = await page.locator('footer').innerHTML();
  await page.goto('/index.html');
  expect(await page.locator('footer').innerHTML()).toBe(footer);
});

test('biomas mostram valores publicados em lista textual com escala zero', async ({ page }) => {
  await page.goto('/dados.html');
  await expect(page.locator('.biome-chart').getByRole('listitem')).toHaveCount(6);
  for (const [name, value] of approved.biomes) {
    const row = page.locator('.biome-chart__row').filter({ hasText: name });
    await expect(row.locator("strong")).toHaveText(number(value));
    const width = await row.evaluate(element => parseFloat(element.style.getPropertyValue('--share')));
    expect(width).toBeCloseTo(value / Number(await page.locator('.biome-chart').getAttribute('data-scale-max')) * 100, 3);
  }
  await expect(page.locator('.biome-chart__scale')).toContainText('0');
});

test('seleciona as 27 UFs e sincroniza mapa, indicadores e comparação', async ({ page }) => {
  await page.goto('/dados.html');
  const select = page.locator('#state-select');
  await expect(select).toHaveValue('');
  await expect(select.locator('option')).toHaveCount(28);
  const names = await select.locator('option:not([value=""])').allTextContents();
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'pt-BR')));
  await expect(page.locator('[data-uf][aria-pressed="true"]')).toHaveCount(0);
  await expect(page.locator('#state-results')).toBeHidden();
  for (const [uf, name, area, average] of approved.states) {
    await chooseState(page, uf);
    await expect(page.locator('#state-name')).toHaveText(name);
    await expect(page.locator('#comparison-area')).toHaveText(number(area));
    await expect(page.locator('#comparison-average')).toHaveText(number(average));
    await expect(page.locator(`[data-uf="${uf}"]`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('status', { name: 'Consulta estadual' })).toContainText(name);
    const widths = await page.locator('#state-comparison .comparison-row').evaluateAll(elements => elements.map(element => parseFloat(element.style.getPropertyValue('--share'))));
    const limit = Number(await page.locator("#state-comparison").getAttribute("data-scale-max"));
    expect(limit).toBeGreaterThanOrEqual(Math.max(area, average));
    expect(widths[0]).toBeCloseTo(area / limit * 100, 3);
    expect(widths[1]).toBeCloseTo(average / limit * 100, 3);
  }
  for (const uf of ['ES', 'AC', 'CE', 'SP', 'DF', 'ES']) await chooseState(page, uf);
  await expect(page.locator('#comparison-area')).toHaveText('5.151');
  await chooseState(page, '');
  await expect(page.locator('#state-results')).toBeHidden();
  await expect(page.locator('[data-uf][aria-pressed="true"]')).toHaveCount(0);
});

test('mapa funciona por mouse e teclado sem transferir foco', async ({ page }) => {
  await page.goto('/dados.html');
  const acre = page.getByRole('button', { name: 'Acre', exact: true });
  await acre.click();
  await expect(page.locator('#state-select')).toHaveValue('AC');
  for (const [uf, name] of approved.states) {
    const state = page.getByRole('button', { name, exact: true });
    await state.focus();
    await state.press('Enter');
    await expect(page.locator('#state-select')).toHaveValue(uf);
    await expect(state).toBeFocused();
    await state.press('Space');
    await expect(state).toHaveAttribute('aria-pressed', 'true');
  }
});

test('todos os territórios respondem ao clique na própria geometria', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/dados.html');
  for (const [uf] of approved.states) {
    const territory = page.locator(`[data-uf="${uf}"]`);
    await territory.scrollIntoViewIfNeeded();
    // O centro da caixa pode cair fora de polígonos côncavos ou entre ilhas.
    const position = await territory.evaluate(path => {
      const box = path.getBBox();
      for (let y = .05; y < 1; y += .05) {
        for (let x = .05; x < 1; x += .05) {
          const point = new DOMPoint(box.x + box.width * x, box.y + box.height * y);
          if (path.isPointInFill(point)) {
            const screen = point.matrixTransform(path.getScreenCTM());
            // Uma borda de UF vizinha pode recobrir o primeiro ponto interior.
            if (document.elementFromPoint(screen.x, screen.y) === path) return { x: screen.x, y: screen.y };
          }
        }
      }
      throw new Error('Território sem ponto interno selecionável.');
    });
    await page.mouse.click(position.x, position.y);
    await expect(page.locator('#state-select')).toHaveValue(uf);
  }
});

test('consulta por toque tem seletor confortável, foco visível e movimento reduzido', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/dados.html');
  const select = page.locator('#state-combobox');
  await select.tap();
  await page.keyboard.press('Escape');
  await select.tap();
  await page.locator('#state-option-DF').tap();
  await expect(page.locator('#state-name')).toHaveText('Distrito Federal');
  const box = await select.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
  const acre = page.getByRole('button', { name: 'Acre', exact: true });
  await acre.tap();
  await expect(page.locator('#state-select')).toHaveValue('AC');
  await select.focus();
  await select.press('ArrowDown');
  await select.press('Escape');
  expect(await select.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid');
  expect(await page.locator('main').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await page.locator('html').evaluate(element => getComputedStyle(element).scrollBehavior)).toBe('auto');
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const violations = await page.evaluate(async () => (await axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
  })).violations.map(({ id }) => id));
  expect(violations).toEqual([]);
  await context.close();
});

for (const [width, height] of [[320, 568], [390, 844], [844, 390]]) {
  test(`primeira seleção mantém território focado visível em ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dados.html');
    await page.locator('#state-combobox').focus();
    await page.keyboard.press('Tab');
    const acre = page.getByRole('button', { name: 'Acre', exact: true });
    await expect(acre).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(acre).toBeFocused();
    await expect(page.locator('#comparison-area')).toHaveText('122.524');
    const box = await acre.boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(height);
  });
}

test('todos os links internos e arquivos publicados respondem sem erros', async ({ page }) => {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/dados.html');
  const targets = await page.locator('a[href], script[src], link[href], img[src]').evaluateAll(elements => elements.map(element => element.href || element.src));
  for (const target of targets.filter(target => target.startsWith('http://127.0.0.1:4173/'))) {
    expect((await page.request.get(target)).ok(), target).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('ausência de um valor não vira zero nem mantém os indicadores anteriores', async ({ page }) => {
  await page.route('**/src/dados-base.js', async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace('"areaLast12Months": 5151.24', '"areaLast12Months": null');
    expect(body).not.toBe(await response.text());
    await route.fulfill({ response, body });
  });
  await page.goto('/dados.html');
  await chooseState(page, 'AC');
  await chooseState(page, 'ES');
  await expect(page.locator('#state-name')).toHaveText('Espírito Santo');
  await expect(page.locator('#state-unavailable')).toHaveText('Dados não disponíveis para esta consulta.');
  await expect(page.locator('#state-comparison')).toBeHidden();
  await expect(page.getByRole('status', { name: 'Consulta estadual' })).toContainText('Dados não disponíveis');
});

for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [960, 720], [1440, 900], [1920, 1080], [844, 390], [1280, 420]]) {
  test(`reorganiza o conteúdo em ${width}×${height} com texto a 100% e 200%`, async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.goto('/dados.html');
    for (const size of ['100%', '200%']) {
      await page.evaluate(size => { document.documentElement.style.fontSize = size; }, size);
      await chooseState(page, 'MA');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const selector of ['#state-combobox', '#comparison-area', '#comparison-average', '.brazil-map', 'footer']) {
        const box = await page.locator(selector).boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      }
      const chartIssues = await page.locator('#national-focus-annual, #national-focus-cumulative, #state-focus-monthly, #state-focus-annual').evaluateAll(charts => charts.flatMap(chart => {
        const box = chart.getBoundingClientRect(), title = chart.querySelector('figcaption').getBoundingClientRect();
        const values = [...chart.querySelectorAll('strong')].map(value => value.getBoundingClientRect());
        const issues = values.some(value => value.left < box.left - 1 || value.right > box.right + 1 || value.top < title.bottom) ? [chart.id + ': fora da área de leitura'] : [];
        for (let i = 0; i < values.length; i++) for (let j = i + 1; j < values.length; j++) {
          const a = values[i], b = values[j];
          if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) issues.push(chart.id + ': valores sobrepostos');
        }
        return issues;
      }));
      expect(chartIssues).toEqual([]);
    }
    expect(errors).toEqual([]);
    if ([320, 1440].includes(width)) {
      await page.evaluate(() => { document.documentElement.style.fontSize = '100%'; });
      await page.screenshot({ path: testInfo.outputPath('dados.png'), fullPage: true });
    }
  });
}

test('escala responde também à altura da janela sem reduzir o corpo abaixo de 16 px', async ({ page }) => {
  const samples = [];
  for (const height of [1080, 420]) {
    await page.setViewportSize({ width: 1920, height });
    await page.goto('/dados.html');
    samples.push(await page.locator('.data-section').first().evaluate(element => ({
      font: parseFloat(getComputedStyle(element).fontSize),
      padding: parseFloat(getComputedStyle(element).paddingTop),
    })));
  }
  expect(samples[0].font).toBeGreaterThan(samples[1].font);
  expect(samples[1].font).toBeGreaterThanOrEqual(16);
  expect(samples[0].padding).toBeGreaterThan(samples[1].padding);
});

test('sem JavaScript conserva os 27 territórios e todos os valores em tabela', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 568 } });
  const page = await context.newPage();
  await page.goto('/dados.html');
  for (const [, name, area, average] of approved.states) {
    const row = page.locator('#states-fallback tr').filter({ has: page.getByRole('rowheader', { name, exact: true }) });
    await expect(row).toBeVisible();
    await expect(row).toContainText(number(area));
    await expect(row).toContainText(number(average));
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('integra navegação relativa, menu, rodapé e publicação em subdiretório', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/projeto/**', async route => {
    const response = await route.fetch({ url: route.request().url().replace('/projeto/', '/') });
    await route.fulfill({ response });
  });
  for (const path of ['index.html', 'queimadas.html']) {
    await page.goto(`/projeto/${path}`);
    await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Dados', exact: true }).click();
    await expect(page).toHaveURL(/\/projeto\/dados.html$/);
    await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Dados', exact: true })).toHaveAttribute('aria-current', 'page');
    await chooseState(page, 'ES');
    await expect(page.locator('#comparison-area')).toHaveText('5.151');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('link', { name: 'Voltar ao topo' }).click();
  await expect(page.locator('#inicio')).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused();
});

test('axe não encontra violações A/AA no estado inicial ou selecionado', async ({ page }) => {
  await page.goto('/dados.html');
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  for (const uf of ['', 'ES', 'CE']) {
    await chooseState(page, uf);
    const violations = await page.evaluate(async () => (await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    })).violations.map(({ id, nodes }) => ({ id, elements: nodes.map(node => node.target) })));
    expect(violations).toEqual([]);
  }
});
