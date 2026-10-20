import { test, expect } from '@playwright/test';
import { chooseState } from './helpers/dados.js';

test('valores ficam próximos dos pontos e não atravessam segmentos', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dados.html');
  await chooseState(page, 'AM');
  for (const id of ['national-focus-annual', 'national-focus-cumulative', 'state-focus-annual']) {
    const chart = page.locator(`#${id}`);
    await expect(chart.locator('.chart-line')).toBeVisible();
    const problems = await chart.evaluate(element => {
      const segments = [...element.querySelectorAll('polyline')].flatMap(line => {
        const points = [...line.points].map(p => new DOMPoint(p.x, p.y).matrixTransform(line.getScreenCTM()));
        return points.slice(1).map((p, i) => [points[i], p]);
      });
      return [...element.querySelectorAll('strong')].flatMap(value => {
        const bounds = value.getBoundingClientRect();
        const parent = value.closest('.cumulative-value') || value.closest('li');
        const dot = parent.querySelector('.chart-dot').getBoundingClientRect();
        const x = dot.left + dot.width / 2, y = dot.top + dot.height / 2;
        const dx = Math.max(bounds.left - x, 0, x - bounds.right), dy = Math.max(bounds.top - y, 0, y - bounds.bottom);
        const errors = Math.hypot(dx, dy) > 30 ? [value.textContent + ': distante'] : [];
        for (const [a, b] of segments) {
          const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y));
          for (let i = 0; i <= steps; i++) {
            const px = a.x + (b.x - a.x) * i / steps, py = a.y + (b.y - a.y) * i / steps;
            if (px >= bounds.left - 1 && px <= bounds.right + 1 && py >= bounds.top - 1 && py <= bounds.bottom + 1) { errors.push(value.textContent + ': segmento'); break; }
          }
        }
        return errors;
      });
    });
    expect(problems).toEqual([]);
  }
});

test('nomes claros, meses compartilhados e escala alinhada às duas curvas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dados.html');
  const chart = page.locator('#national-focus-cumulative');
  await expect(chart.locator('.cumulative-month')).toHaveText(['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set']);
  await expect(chart.locator('.chart-legend')).toHaveCount(0);
  await expect(chart.locator('.series-end')).toHaveText(['2026', 'Média histórica']);
  await expect(chart.locator('figcaption')).toContainText('2003 a 2025');
  await expect(page.locator('#national-focus-annual-title')).toContainText('Total anual');
  const bounds = await chart.evaluate(element => {
    const axis = element.querySelector('.chart-axis').getBoundingClientRect();
    const line = element.querySelector('.chart-line').getBoundingClientRect();
    return { top: axis.top - line.top, height: axis.height - line.height, width: axis.width - line.width };
  });
  expect(bounds).toEqual({ top: 0, height: 0, width: 0 });
  await chooseState(page, 'AM');
  await expect(page.locator('#state-focus-monthly li').first()).toContainText('Out/2025');
  await expect(page.locator('#state-focus-monthly li').last()).toContainText('Set/2026');
});

test('uma entrada de teclado por gráfico percorre os resultados e permite sair', async ({ page }) => {
  await page.goto('/dados.html');
  await chooseState(page, 'MG');
  const chart = page.locator('#national-focus-annual');
  await expect(chart).toHaveAttribute('tabindex', '0');
  await chart.focus();
  await chart.press('End');
  await expect(chart.locator('[data-chart-active]')).toContainText('2025');
  await expect(page.locator('#chart-status')).toContainText('136.393');
  await chart.press('Home');
  await chart.press('ArrowRight');
  await expect(chart.locator('[data-chart-active]')).toContainText('2004');
  await chart.press('Escape');
  await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
  await chart.press('Tab');
  await expect(page.locator('#national-focus-cumulative')).toBeFocused();
  for (const selector of ['.biome-chart', '.state-comparison', '#national-focus-annual', '#national-focus-cumulative', '#state-focus-monthly', '#state-focus-annual']) {
    const figure = page.locator(selector);
    const rows = figure.locator('li');
    await figure.focus();
    await figure.press('End');
    await expect(rows.last()).toHaveAttribute('data-chart-active', '');
    await figure.press('Home');
    await figure.press('ArrowRight');
    await expect(rows.nth(1)).toHaveAttribute('data-chart-active', '');
    await figure.press(' ');
    await figure.press(' ');
    await expect(figure.locator('[data-chart-active]')).toHaveCount(0);
    await figure.press('Home');
    await figure.press('Escape');
    await expect(figure.locator('[data-chart-active]')).toHaveCount(0);
    await figure.press('Tab');
    await expect(figure).not.toBeFocused();
  }
});

test('atalhos do gráfico não interceptam os links das fontes', async ({ page }) => {
  await page.route('https://raf.ia.mapbiomas.org/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Fonte oficial</title><p>Referência</p>' }));
  await page.goto('/dados.html');
  const source = page.locator('.biome-chart a').first();
  await source.focus();
  await source.press('Enter');
  await expect(page).toHaveURL(/publication-20\.html$/);
});

test('mouse destaca os dois resultados do mês, guia usa a posição real e não anuncia movimento', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dados.html');
  const chart = page.locator('#national-focus-cumulative');
  await chart.locator('li').nth(4).hover();
  await expect(chart.locator('[data-chart-active]')).toHaveCount(1);
  await expect(chart.locator('[data-chart-active] strong')).toHaveCount(2);
  await expect(chart.locator('.chart-guide')).toBeVisible();
  await expect(page.locator('#chart-status')).toBeEmpty();
  const difference = await chart.evaluate(element => {
    const dot = element.querySelector('[data-chart-active] .chart-dot').getBoundingClientRect();
    return element.querySelector('.chart-guide').getBoundingClientRect().left - (dot.left + dot.width / 2);
  });
  expect(Math.abs(difference)).toBeLessThan(1);
});

test('toque seleciona e limpa, todos os valores continuam disponíveis', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto('/dados.html');
  await chooseState(page, 'MG');
  for (const selector of ['.biome-chart', '.state-comparison', '#national-focus-annual', '#national-focus-cumulative', '#state-focus-monthly', '#state-focus-annual']) {
    const chart = page.locator(selector);
    const rows = chart.locator('li');
    const row = rows.first();
    expect((await row.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await row.tap();
    await expect(row).toHaveAttribute('data-chart-active', '');
    await rows.nth(1).tap();
    await expect(rows.nth(1)).toHaveAttribute('data-chart-active', '');
    await rows.nth(1).tap();
    await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
  }
  await expect(page.locator('.biome-chart strong:visible')).toHaveCount(6);
  await context.close();
});

test('falha na melhoria interativa preserva gráficos e seleção estadual', async ({ page }) => {
  await page.route('**/src/graficos-interacao.js', route => route.fulfill({ status: 404, body: '' }));
  await page.goto('/dados.html');
  await chooseState(page, 'ES');
  await expect(page.locator('#comparison-area')).toHaveText('5.151');
  await expect(page.locator('#state-focus-annual strong:visible')).toHaveCount(23);
  await expect(page.locator('#national-focus-cumulative strong:visible')).toHaveCount(18);
  await expect(page.locator('#chart-status')).toHaveCount(0);
});

test('polilinhas, marcadores e escala usam as mesmas coordenadas reais', async ({ page }) => {
  await page.goto('/dados.html');
  for (const width of [960, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await chooseState(page, 'AM');
    for (const id of ['national-focus-annual', 'national-focus-cumulative', 'state-focus-annual']) {
      const mismatches = await page.locator('#' + id).evaluate(chart => {
        if (chart.dataset.chartMode !== 'line') return [];
        const axis = chart.querySelector('.chart-axis').getBoundingClientRect();
        const svg = chart.querySelector('.chart-line').getBoundingClientRect();
        const errors = Math.abs(axis.top - svg.top) + Math.abs(axis.height - svg.height) + Math.abs(axis.width - svg.width) > .1 ? ['escala'] : [];
        const rows = [...chart.querySelectorAll('li')];
        [...chart.querySelectorAll('polyline')].forEach((line, series) => {
          [...line.points].forEach((point, index) => {
            const observed = new DOMPoint(point.x, point.y).matrixTransform(line.getScreenCTM());
            const dot = rows[index].querySelectorAll('.chart-dot')[series].getBoundingClientRect();
            if (Math.hypot(observed.x - dot.left - dot.width / 2, observed.y - dot.top - dot.height / 2) > .1) errors.push(`${series}:${index}`);
          });
        });
        return errors;
      });
      expect(mismatches).toEqual([]);
    }
  }
});

test('curvas zeradas e nomes coincidentes mantêm todos os resultados legíveis', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dados.html');
  await page.locator('#national-focus-cumulative').evaluate(async chart => {
    for (const row of chart.querySelectorAll('li')) { row.style.setProperty('--current', '0'); row.style.setProperty('--reference', '0'); }
    for (const value of chart.querySelectorAll('strong')) value.textContent = '0';
    for (const label of chart.querySelectorAll('.series-end')) label.style.setProperty('--end-share', '0');
    for (const line of chart.querySelectorAll('polyline')) line.setAttribute('points', Array.from({ length: 9 }, (_, i) => `${(i + .5) / 9 * 1000},1000`).join(' '));
    (await import('/src/graficos.js')).layoutChartLabels(chart);
  });
  await expect(page.locator('#national-focus-cumulative')).toHaveAttribute('data-chart-mode', 'bars');
  await expect(page.locator('#national-focus-cumulative strong:visible')).toHaveCount(18);
  await page.locator('#national-focus-cumulative').focus();
  await page.keyboard.press('Home');
  const zeroBars = await page.locator('#national-focus-cumulative [data-chart-active] .bar__fill').evaluateAll(bars => bars.map(bar => ({ width: bar.getBoundingClientRect().width, shadow: getComputedStyle(bar).boxShadow })));
  expect(zeroBars.every(bar => bar.width === 0 && bar.shadow === 'none')).toBe(true);
});

test('troca de UF e mudança de formato limpam o resultado consultado', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dados.html');
  await chooseState(page, 'AM');
  const chart = page.locator('#state-focus-annual');
  await chart.focus(); await chart.press('End');
  await chart.locator('li').last().locator('strong').click();
  await chooseState(page, 'ES');
  await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
  await chart.focus(); await chart.press('End');
  await chart.locator('li').last().locator('strong').click();
  await chart.evaluate(element => { element.style.width = '390px'; });
  await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
  await chart.evaluate(element => { element.style.removeProperty('width'); });
  await chart.focus(); await chart.press('End');
  await chart.locator('li').last().locator('strong').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
  await expect(chart.locator('strong:visible')).toHaveCount(23);
});

test('destaque discreto preserva cores, tipografia e posições dos quatro exemplos', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dados.html');
  await chooseState(page, 'MG');
  for (const [selector, index] of [['#state-focus-monthly', 1], ['#state-focus-annual', 4], ['#national-focus-cumulative', 8], ['.biome-chart', 0]]) {
    const chart = page.locator(selector);
    const row = chart.locator('li').nth(index);
    await chart.scrollIntoViewIfNeeded();
    const snapshot = () => chart.locator('strong, .bar__fill, .chart-dot').evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, color: style.color, background: style.backgroundColor, size: style.fontSize, weight: style.fontWeight };
    }));
    const before = await snapshot();
    await row.locator('strong').first().hover();
    await expect(row).toHaveAttribute('data-chart-active', '');
    expect(await snapshot()).toEqual(before);
    const decoration = await row.evaluate(element => ({
      numbers: [...element.querySelectorAll('strong')].map(value => getComputedStyle(value).outlineStyle),
      bars: [...element.querySelectorAll('.bar__fill')].map(bar => getComputedStyle(bar).boxShadow),
      dots: [...element.querySelectorAll('.chart-dot')].filter(dot => dot.getClientRects().length).map(dot => getComputedStyle(dot).boxShadow),
    }));
    expect(decoration.numbers.every(outline => outline === 'none')).toBe(true);
    expect(decoration.bars.every(shadow => shadow === 'none')).toBe(true);
    for (const shadow of decoration.dots) {
      expect(shadow).not.toContain('),');
      expect(shadow).toMatch(/0px 0px 0px [12]px$/);
    }
    if (await chart.getAttribute('data-chart-mode') === 'line') await expect(chart.locator('.chart-guide')).toBeVisible();
    else await expect(chart.locator('.chart-guide')).toBeHidden();
  }
});

test('hover limpa nas áreas vazias e não seleciona títulos, margens ou nomes das curvas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dados.html');
  const chart = page.locator('#national-focus-cumulative');
  const targets = [chart.locator('figcaption'), chart.locator('.series-end').first()];
  for (const target of targets) {
    await chart.locator('li').nth(8).locator('strong').first().hover();
    await expect(chart.locator('[data-chart-active]')).toHaveCount(1);
    await target.hover();
    await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
  }
  await chart.locator('figcaption').click();
  await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
  await chart.locator('li').nth(4).locator('strong').first().hover();
  const empty = await chart.evaluate(element => {
    const plot = element.querySelector('.chart-results').getBoundingClientRect();
    return { x: plot.left + plot.width / 2, y: plot.bottom + 20 };
  });
  await page.mouse.move(empty.x, empty.y);
  await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
  await expect(chart.locator('.chart-guide')).toBeHidden();
});

test('rótulo deslocado seleciona seu próprio resultado e seleção fixada resiste à margem', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dados.html');
  await chooseState(page, 'MG');
  const chart = page.locator('#state-focus-annual');
  const row = chart.locator('li').nth(4);
  const value = row.locator('strong');
  await value.evaluate(element => element.style.setProperty('--label-shift', '32px'));
  await value.hover();
  await expect(row).toHaveAttribute('data-chart-active', '');
  await value.click();
  await chart.locator('figcaption').hover();
  await expect(row).toHaveAttribute('data-chart-active', '');
  await value.click();
  await expect(row).toHaveAttribute('data-chart-active', '');
  await chart.locator('figcaption').hover();
  await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
});

test('hover prevalece sobre clique e restaura a seleção nos seis gráficos', async ({ page }) => {
  test.setTimeout(30000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dados.html');
  await chooseState(page, 'MG');
  for (const selector of ['.biome-chart', '.state-comparison', '#national-focus-annual', '#national-focus-cumulative', '#state-focus-monthly', '#state-focus-annual']) {
    const chart = page.locator(selector);
    const rows = chart.locator('li');
    const a = rows.first().locator('strong').first();
    const b = rows.nth(1).locator('strong').first();
    const c = rows.last().locator('strong').first();
    await a.click();
    for (const value of [b, c]) {
      await value.hover();
      await expect(value.locator('xpath=ancestor::li')).toHaveAttribute('data-chart-active', '');
    }
    await chart.locator('figcaption').hover();
    await expect(rows.first()).toHaveAttribute('data-chart-active', '');
    await c.click();
    await a.hover();
    await expect(rows.first()).toHaveAttribute('data-chart-active', '');
    await chart.locator('figcaption').hover();
    await expect(rows.last()).toHaveAttribute('data-chart-active', '');
    await c.click();
    await expect(rows.last()).toHaveAttribute('data-chart-active', '');
    await chart.locator('figcaption').hover();
    await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
    await a.click();
    await page.mouse.move(1, 1);
    await expect(rows.first()).toHaveAttribute('data-chart-active', '');
    await page.locator('h1').click();
    await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
  }
  await expect(page.locator('#chart-status')).toBeEmpty();
});

test('biomas e comparação estadual compartilham realce sem sublinhado ou mudança geométrica', async ({ page }) => {
  await page.goto('/dados.html');
  await chooseState(page, 'MT');
  for (const [width, text] of [[1440, 100], [390, 100], [1440, 200]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(text => document.documentElement.style.fontSize = `${text}%`, text);
    for (const selector of ['.biome-chart', '.state-comparison']) {
      const chart = page.locator(selector);
      const bars = chart.locator('.bar__fill');
      const snapshot = () => bars.evaluateAll(elements => elements.map(element => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height, color: getComputedStyle(element).backgroundColor })));
      const before = await snapshot();
      for (let index = 0; index < await bars.count(); index++) {
        const row = chart.locator('li').nth(index);
        await row.locator('strong').hover();
        expect(await bars.evaluateAll(elements => elements.map(element => getComputedStyle(element).filter))).toEqual(Array.from({ length: await bars.count() }, (_, i) => i === index ? 'brightness(0.9)' : 'none'));
        expect(await row.locator('.biome-chart__label > span, p > span').evaluate(element => getComputedStyle(element).textDecorationLine)).toBe('none');
        expect(await snapshot()).toEqual(before);
      }
    }
  }
});

test('escala horizontal não sobrepõe marcações com texto ampliado', async ({ page }) => {
  await page.goto('/dados.html');
  await chooseState(page, 'MG');
  for (const [width, text] of [[960, 100], [1440, 100], [1440, 200]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(text => document.documentElement.style.fontSize = `${text}%`, text);
    for (const selector of ['.biome-chart', '.state-comparison']) {
      const errors = await page.locator(selector).evaluate(chart => {
        const ticks = [...chart.querySelectorAll('.bar-axis .chart-tick > span')].map(tick => tick.getBoundingClientRect()).filter(rect => rect.width && rect.height);
        return ticks.slice(1).filter((rect, index) => rect.left < ticks[index].right + 4).length;
      });
      expect(errors).toBe(0);
    }
  }
});

test('teclado controla o destaque até novo movimento e Escape limpa os estados', async ({ page }) => {
  await page.goto('/dados.html');
  const chart = page.locator('#national-focus-cumulative');
  const rows = chart.locator('li');
  await rows.first().locator('strong').first().click();
  await rows.nth(1).locator('strong').first().hover();
  await chart.press('ArrowRight');
  await expect(rows.nth(2)).toHaveAttribute('data-chart-active', '');
  await expect(page.locator('#chart-status')).toContainText('Até Mar');
  const announcement = await page.locator('#chart-status').textContent();
  await rows.nth(3).locator('strong').first().hover();
  await expect(rows.nth(3)).toHaveAttribute('data-chart-active', '');
  await expect(chart.locator('[data-chart-active] .chart-dot')).toHaveCount(2);
  await expect(page.locator('#chart-status')).toHaveText(announcement);
  await chart.locator('figcaption').hover();
  await expect(rows.first()).toHaveAttribute('data-chart-active', '');
  await chart.press('End');
  await chart.press('Enter');
  await rows.nth(3).locator('strong').first().hover();
  await chart.locator('figcaption').hover();
  await expect(rows.last()).toHaveAttribute('data-chart-active', '');
  await chart.press('Escape');
  await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
  await rows.nth(2).locator('strong').first().hover();
  await expect(rows.nth(2)).toHaveAttribute('data-chart-active', '');
  await chart.locator('figcaption').hover();
  await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
});

test('cada valor visível ativa sua categoria sem a guia atravessar o texto', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dados.html');
  await chooseState(page, 'MG');
  for (const selector of ['.biome-chart', '.state-comparison', '#national-focus-annual', '#national-focus-cumulative', '#state-focus-monthly', '#state-focus-annual']) {
    const chart = page.locator(selector);
    const values = chart.locator('.chart-results strong');
    for (let i = 0; i < await values.count(); i++) {
      const value = values.nth(i);
      await value.hover();
      await expect(value.locator('xpath=ancestor::li')).toHaveAttribute('data-chart-active', '');
      expect(await value.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return element.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2));
      })).toBe(true);
    }
  }
});

test('hover responsivo mantém valores imóveis em linhas, colunas e barras', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('/dados.html');
  await chooseState(page, 'MG');
  for (const [width, height, text] of [[320, 568, 100], [390, 844, 100], [768, 1024, 100], [960, 720, 100], [1440, 900, 100], [1920, 1080, 100], [1280, 420, 100], [390, 844, 200], [1440, 900, 200]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(text => document.documentElement.style.fontSize = `${text}%`, text);
    for (const selector of ['.biome-chart', '#state-focus-monthly', '#state-focus-annual', '#national-focus-cumulative']) {
      const chart = page.locator(selector);
      const value = chart.locator('.chart-results strong').first();
      await value.scrollIntoViewIfNeeded();
      const before = await value.boundingBox();
      await value.hover();
      await expect(value.locator('xpath=ancestor::li')).toHaveAttribute('data-chart-active', '');
      expect(await value.boundingBox()).toEqual(before);
      expect(await value.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('none');
      if (await chart.getAttribute('data-chart-mode') !== 'line') await expect(chart.locator('.chart-guide')).toBeHidden();
      await value.click();
      const second = chart.locator('li').nth(1);
      await second.locator('strong').first().hover();
      await expect(second).toHaveAttribute('data-chart-active', '');
      await chart.locator('figcaption').hover();
      await expect(value.locator('xpath=ancestor::li')).toHaveAttribute('data-chart-active', '');
      await value.click();
      await chart.locator('figcaption').hover();
      await expect(chart.locator('[data-chart-active]')).toHaveCount(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
