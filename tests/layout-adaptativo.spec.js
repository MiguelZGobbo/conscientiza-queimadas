import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

for (const route of ['queimadas', 'prevencao', 'sobre', 'fontes']) {
  test(`${route}: mantém títulos acima da coluna ampla e centralizada sem recarregar`, async ({ page }) => {
    await page.goto(`/${route}`);
    const originalDocument = await page.evaluate(() => performance.timeOrigin);
    for (const [width, rootSize] of [[1199, 16], [1200, 16], [1440, 16], [1920, 16], [1920, 32], [375, 16], [1440, 16]]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(size => document.documentElement.style.fontSize = `${size}px`, rootSize);
      const sections = await page.locator('.reading-section__layout').evaluateAll(elements => elements.map(layout => {
        const heading = layout.querySelector('h2').getBoundingClientRect();
        const body = layout.querySelector('.reading-section__body').getBoundingClientRect();
        const measure = document.createElement('span');
        measure.style.cssText = 'display:block;width:80ch;position:absolute;visibility:hidden';
        layout.querySelector('.reading-section__body').append(measure);
        const maxReadingWidth = measure.getBoundingClientRect().width;
        measure.remove();
        return { heading: heading.toJSON(), body: body.toJSON(), maxReadingWidth, gutter: parseFloat(getComputedStyle(layout).paddingLeft) };
      }));
      for (const { heading, body, maxReadingWidth, gutter } of sections) {
        expect(Math.abs(body.width - Math.min(maxReadingWidth, width - 2 * gutter))).toBeLessThanOrEqual(1);
        expect(heading.bottom).toBeLessThan(body.top);
        expect(Math.abs(heading.left - body.left)).toBeLessThanOrEqual(1);
        expect(Math.abs(body.left - (width - body.width) / 2)).toBeLessThanOrEqual(1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.evaluate(() => performance.timeOrigin)).toBe(originalDocument);
    }
    await page.setViewportSize({ width: 1920, height: 900 });
    const section = page.locator('.reading-section').first();
    await section.evaluate(element => element.style.width = '1100px');
    const narrowContainer = await section.evaluate(element => ({
      heading: element.querySelector('h2').getBoundingClientRect().toJSON(),
      body: element.querySelector('.reading-section__body').getBoundingClientRect().toJSON(),
    }));
    expect(narrowContainer.heading.bottom).toBeLessThan(narrowContainer.body.top);
  });
}

test('Impactos equilibra os espaços verticais e cresce com conteúdo ampliado', async ({ page }) => {
  await page.goto('/');
  for (const [width, height, size] of [[1440, 900, 16], [1920, 1080, 16], [1920, 500, 16], [1440, 900, 32]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(size => document.documentElement.style.fontSize = `${size}px`, size);
    const metrics = await page.locator('.impacts').evaluate(section => {
      const box = section.getBoundingClientRect();
      const content = section.querySelector('.container').getBoundingClientRect();
      const style = getComputedStyle(section);
      return { height: box.height, before: content.top - box.top - parseFloat(style.paddingTop), after: box.bottom - content.bottom - parseFloat(style.paddingBottom) };
    });
    expect(metrics.height).toBeGreaterThanOrEqual(height);
    expect(Math.abs(metrics.before - metrics.after)).toBeLessThanOrEqual(1);
    expect(metrics.before).toBeGreaterThanOrEqual(-1);
  }
});

test('aberturas textuais, sumário e encerramento acompanham a coluna ampla', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let referenceWidth;
  for (const route of ['queimadas', 'prevencao', 'sobre', 'fontes', 'dados']) {
    await page.goto(`/${route}`);
    const column = page.locator('.reading-section__body, .data-section .data-reading--inner').first();
    const body = await column.boundingBox();
    referenceWidth ??= body.width;
    expect(Math.abs(body.width - referenceWidth)).toBeLessThanOrEqual(1);
    for (const selector of ['.reading-contents .container', '.reading-next .container', ...(['sobre', 'fontes'].includes(route) ? ['.page-intro .container'] : [])]) {
      for (const element of await page.locator(selector).all()) {
        const bounds = await element.evaluate(element => {
          const box = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return { left: box.left + parseFloat(style.paddingLeft), width: box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) };
        });
        expect(Math.abs(bounds.left - body.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(bounds.width - body.width)).toBeLessThanOrEqual(1);
      }
    }
    if (['sobre', 'fontes'].includes(route)) {
      const intro = await page.locator('.page-intro p').first().boundingBox();
      expect(Math.abs(intro.width - body.width)).toBeLessThanOrEqual(1);
    }
  }
});

test('subtítulos agrupam as listas com metade do intervalo entre parágrafos', async ({ page }) => {
  for (const route of ['prevencao', 'fontes']) {
    await page.goto(`/${route}`);
    for (const [width, size] of [[375, 16], [1440, 16], [1440, 32]]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(size => document.documentElement.style.fontSize = `${size}px`, size);
      const lists = await page.locator('.reading-section__body h3 + ul, .reading-section__body h3 + ol').evaluateAll(elements => elements.map(list => ({
        gap: list.firstElementChild.getBoundingClientRect().top - list.previousElementSibling.getBoundingClientRect().bottom,
        paragraphGap: parseFloat(getComputedStyle(list.closest('.reading-section__body').querySelector('p')).marginBottom),
      })));
      expect(lists.length).toBeGreaterThan(0);
      for (const { gap, paragraphGap } of lists) expect(Math.abs(gap - paragraphGap * .5)).toBeLessThanOrEqual(1);
    }
  }
});

test('ampliar a coluna de Dados preserva as dimensões do mapa, gráficos e seletor', async ({ page }) => {
  await page.goto('/dados');
  const dimensions = () => page.locator('.brazil-map, .state-combobox, .biome-chart, .focus-chart .chart-plane').evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height };
  }));
  for (const [width, height] of [[375, 812], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    const expanded = await dimensions();
    // A largura editorial anterior serve de referência para detectar acoplamento das visualizações.
    const reference = await page.addStyleTag({ content: '.data-reading{width:min(100%,calc(68ch + var(--page-gutter) * 2))}.data-reading--inner{width:min(100%,68ch)}.chart-intro{max-width:68ch}' });
    const previous = await dimensions();
    await reference.evaluate(element => element.remove());
    expect(expanded.length).toBe(previous.length);
    for (const [index, box] of expanded.entries()) {
      expect(Math.abs(box.width - previous[index].width)).toBeLessThanOrEqual(1);
      expect(Math.abs(box.height - previous[index].height)).toBeLessThanOrEqual(1);
    }
  }
});
