import { test, expect } from '@playwright/test';
import { withPublicationServer } from './helpers/publicacao.js';
import { readFileSync } from 'node:fs';

// Referência editorial independente, revisada com autorização para remover repetições.
const approved = readFileSync(new URL('./fixtures/queimadas-aprovado.md', import.meta.url), 'utf8');
const blocks = approved.split(/\r?\n\s*\r?\n/).map(block => block.trim()).filter(block => block && block !== '---');
const plainText = text => text.replace(/^## (?:SEÇÃO \d+|ENCERRAMENTO) — /, '').replace(/\*\*/g, '').replace(/\*/g, '');

test('publica o conteúdo revisado, visível e na sequência aprovada', async ({ page }) => {
  const response = await page.goto('/queimadas.html');
  expect(response.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Queimadas: entenda como o fogo começa e se espalha.');
  const main = page.getByRole('main');
  const text = await main.innerText();
  let position = 0;
  for (const block of blocks) {
    for (const line of block.split(/\r?\n/)) {
      const expected = plainText(line.replace(/^- /, ''));
      const found = text.indexOf(expected, position);
      expect(found, expected).toBeGreaterThanOrEqual(position);
      position = found + expected.length;
    }
  }
  await expect(main.locator('details')).toHaveCount(0);
  await expect(main.locator('li').filter({ hasText: 'Atividades rurais:' })).toHaveCount(1);
  await expect(main.getByRole('link', { name: /Saiba como prevenir/ })).toHaveCount(0);
  await expect(main.locator('.reading-next p')).toHaveCount(2);
  await expect(main).not.toContainText('O exemplo mostra por que um incêndio');
  await expect(main).not.toContainText('Por isso, compreender as queimadas significa');
  await expect(main.getByRole('link', { name: 'Explorar os dados das queimadas', exact: true })).toHaveAttribute('href', './dados');
  await expect(main.getByRole('heading', { name: 'Fontes consultadas' })).toHaveCount(0);
  await expect(main.getByRole('link', { name: /Ibama/ })).toHaveCount(0);
  await expect(page.getByRole('contentinfo').getByText('Fontes e créditos', { exact: true })).toBeVisible();
});

test('conecta documentos com caminhos relativos e preserva o rodapé', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const homeFooter = await page.getByRole('contentinfo').innerHTML();
  const nav = page.getByRole('navigation', { name: 'Principal' });
  await expect(nav.getByRole('link', { name: 'Início', exact: true })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: 'Queimadas', exact: true }).click();
  await expect(page).toHaveURL(/\/queimadas$/);
  await expect(nav.getByRole('link', { name: 'Queimadas', exact: true })).toHaveAttribute('aria-current', 'page');
  expect(await page.getByRole('contentinfo').innerHTML()).toBe(homeFooter);
  for (const name of ['Prevenção']) {
    await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', './prevencao');
    await expect(nav.getByText(name, { exact: true })).toBeVisible();
  }
  // Todos os destinos internos publicados devem responder, incluindo assets.
  const targets = await page.locator('a[href]').evaluateAll(links => links.map(link => link.href));
  for (const target of targets.filter(target => target.startsWith('http://127.0.0.1:4173/'))) {
    expect((await page.request.get(target)).ok(), target).toBe(true);
  }
  const paths = await nav.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(paths.every(path => path.startsWith('./'))).toBe(true);
  await nav.getByRole('link', { name: 'Início', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900], [844, 390], [1280, 500]]) {
  test(`leitura sem overflow e menu por teclado em ${width}×${height}, com texto ampliado`, async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.setViewportSize({ width, height });
    await page.goto('/queimadas.html');
    if (width < 960) {
      const toggle = page.locator('.menu-toggle');
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Tab');
      await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Início', exact: true })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(toggle).toBeFocused();
    }
    for (const size of ['100%', '200%']) {
      await page.evaluate(value => document.documentElement.style.fontSize = value, size);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('main p, main h1, main h2, main h3, main li').evaluateAll(elements => elements.every(element => element.scrollWidth <= element.clientWidth))).toBe(true);
      const shortcut = page.getByRole('navigation', { name: 'Nesta página' }).getByRole('link').first();
      await shortcut.focus();
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus-visible');
      expect(await focused.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid');
    }
    await page.evaluate(() => document.documentElement.style.fontSize = '100%');
    await page.screenshot({ path: testInfo.outputPath('queimadas.png'), fullPage: true, animations: 'disabled' });
    for (const selector of ['.reading-intro', '.reading-contents', '#conceitos', '#causas', '#consequencias', '.reading-next']) {
      await page.locator(selector).screenshot({ path: testInfo.outputPath(`${selector.replace(/[.#]/g, '')}.png`), animations: 'disabled' });
    }
    await page.locator('.fire-triangle').screenshot({ path: testInfo.outputPath('triangulo.png'), animations: 'disabled' });
    expect(errors).toEqual([]);
  });
}

test('atalhos e Voltar ao topo funcionam sem JavaScript e com movimento reduzido', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:4173/queimadas.html');
    await page.getByRole('button').click();
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
    await page.keyboard.press('Escape');
    const links = page.getByRole('navigation', { name: 'Nesta página' }).getByRole('link');
    for (const [index, target] of ['conceitos', 'causas', 'consequencias'].entries()) {
      await links.nth(index).focus();
      await page.keyboard.press('Enter');
      await expect(page.locator(`#${target}`)).toBeFocused();
    }
    const top = page.getByRole('contentinfo').getByRole('link', { name: 'Voltar ao topo' });
    await top.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/queimadas\.html#inicio$/);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('#inicio')).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  } finally {
    await context.close();
  }
});

test('títulos precedem o texto na coluna ampla centralizada e atalhos têm alinhamento consistente', async ({ page }) => {
  for (const [width, height] of [[320, 568], [768, 1024], [1440, 900], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/queimadas.html');
    const reading = await page.locator('.reading-section__body > p').first().boundingBox();
    const paragraphs = page.locator('.reading-section__body > p:first-child');
    for (const paragraph of await paragraphs.all()) {
      const body = await paragraph.boundingBox();
      const heading = await paragraph.evaluate(element => element.closest('section').querySelector('h2').getBoundingClientRect().toJSON());
      expect(heading.bottom).toBeLessThan(body.y);
      expect(Math.abs(heading.left - body.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(body.x - (width - body.width) / 2)).toBeLessThanOrEqual(1);
      expect(Math.abs(body.x - reading.x)).toBeLessThanOrEqual(1);
      expect(await paragraph.evaluate(element => getComputedStyle(element).textAlign)).toBe('start');
    }
    await expect(page.locator('.reading-section__number')).toHaveCount(0);
    const links = page.getByRole('navigation', { name: 'Nesta página' }).getByRole('link');
    const contents = await page.locator('.reading-contents .container').evaluate(element => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { left: box.left + parseFloat(style.paddingLeft), right: box.right - parseFloat(style.paddingRight) };
    });
    await expect(links).toHaveText(['O que são queimadas?', 'Como começam e por que se espalham?', 'O que acontece quando o fogo avança?']);
    await expect(page.getByRole('navigation', { name: 'Nesta página' }).getByText('Nesta página', { exact: true })).toBeVisible();
    let previousBottom = 0;
    for (const link of await links.all()) {
      const bounds = await link.boundingBox();
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.x).toBeGreaterThanOrEqual(contents.left - 1);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(contents.right + 1);
      expect(bounds.y).toBeGreaterThanOrEqual(previousBottom);
      previousBottom = bounds.y + bounds.height;
    }
    const closing = await page.locator('.reading-next__body').boundingBox();
    expect(Math.abs(closing.x - contents.left)).toBeLessThanOrEqual(1);
  }
});

test('introdução compacta e intervalos internos preservam leitura e hierarquia', async ({ page }) => {
  for (const [width, height] of [[320, 568], [768, 1024], [1440, 900], [1920, 1080], [1280, 500]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/queimadas.html');
    const metrics = await page.evaluate(() => {
      const intro = document.querySelector('.reading-intro');
      const title = intro.querySelector('h1');
      const description = intro.querySelector('p');
      const font = parseFloat(getComputedStyle(title).fontSize);
      return {
        font,
        leading: parseFloat(getComputedStyle(title).lineHeight) / font,
        lines: title.getBoundingClientRect().height / parseFloat(getComputedStyle(title).lineHeight),
        padding: parseFloat(getComputedStyle(intro).paddingTop),
        gap: parseFloat(getComputedStyle(description).marginTop),
        introHeight: intro.getBoundingClientRect().height,
        bodyFont: parseFloat(getComputedStyle(document.querySelector('.reading-section__body')).fontSize),
        descriptionFont: parseFloat(getComputedStyle(description).fontSize),
        subsectionGap: parseFloat(getComputedStyle(document.querySelector('#causas h3')).marginTop),
        sectionGap: parseFloat(getComputedStyle(document.querySelector('#causas')).paddingTop),
      };
    });
    expect(metrics.font).toBeGreaterThanOrEqual(28);
    expect(metrics.font).toBeLessThanOrEqual(44);
    expect(metrics.leading).toBeCloseTo(1.2, 2);
    expect(metrics.padding).toBeGreaterThanOrEqual(24);
    expect(metrics.padding).toBeLessThanOrEqual(48);
    expect(metrics.gap).toBeGreaterThanOrEqual(16);
    expect(metrics.gap).toBeLessThanOrEqual(24);
    expect(metrics.descriptionFont).toBe(metrics.bodyFont);
    expect(metrics.subsectionGap / metrics.sectionGap).toBeCloseTo(.6, 2);
    if (width >= 1440) {
      expect(metrics.lines).toBeCloseTo(2, 1);
      expect(metrics.introHeight).toBeLessThan(350);
    }
  }
});

test('conexões do triângulo ficam livres dos rótulos transparentes, inclusive a 200%', async ({ page }, testInfo) => {
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/queimadas.html');
    for (const size of ['100%', '200%']) {
      await page.evaluate(value => document.documentElement.style.fontSize = value, size);
      const diagram = await page.locator('.fire-triangle').evaluate(figure => {
        const labels = [...figure.querySelectorAll('.fire-triangle__element span')];
        const rectangles = labels.flatMap(label => {
          const range = document.createRange();
          range.selectNodeContents(label);
          return [...range.getClientRects()];
        });
        const connection = figure.querySelector('.fire-triangle__connections path');
        const matrix = connection.getScreenCTM();
        const length = connection.getTotalLength();
        let crossesText = false;
        for (let step = 0; step <= 300; step++) {
          const point = connection.getPointAtLength(length * step / 300).matrixTransform(matrix);
          if (rectangles.some(rect => point.x >= rect.left - 2 && point.x <= rect.right + 2 && point.y >= rect.top - 2 && point.y <= rect.bottom + 2)) crossesText = true;
        }
        return {
          backgrounds: labels.map(label => getComputedStyle(label).backgroundColor),
          clipped: labels.some(label => label.scrollWidth > label.clientWidth || label.scrollHeight > label.clientHeight),
          crossesText,
        };
      });
      expect(diagram.backgrounds).toEqual(['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)']);
      expect(diagram.clipped).toBe(false);
      expect(diagram.crossesText).toBe(false);
      if ([320, 1440].includes(width)) await page.locator('.fire-triangle').screenshot({ path: testInfo.outputPath(`triangulo-${width}-${size}.png`), animations: 'disabled' });
    }
  }
});

test('encerramento apresenta o panorama e oferece acesso aos dados', async ({ page }) => {
  await page.goto('/queimadas.html');
  const invitation = page.getByText('Veja o panorama histórico, os focos de fogo e os dados recentes de cada estado.', { exact: true });
  await expect(invitation).toBeVisible();
  const presentation = await invitation.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      border: parseFloat(style.borderTopWidth),
      padding: parseFloat(style.paddingTop) + parseFloat(style.paddingLeft),
      interactive: Boolean(element.closest('a, button, [tabindex]')?.matches('a, button, [tabindex="0"]')),
    };
  });
  expect(presentation).toEqual({ border: 0, padding: 0, interactive: false });
  await expect(page.getByRole('link', { name: 'Explorar os dados das queimadas', exact: true })).toBeVisible();
});

test('escala de leitura responde à largura e altura sem reduzir o corpo abaixo de 16px', async ({ page }) => {
  const samples = [];
  for (const [width, height] of [[1280, 500], [1440, 900], [1920, 1080], [1920, 420]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/queimadas.html');
    samples.push(await page.evaluate(() => ({
      body: parseFloat(getComputedStyle(document.querySelector('.reading-section__body')).fontSize),
      subtitle: parseFloat(getComputedStyle(document.querySelector('.reading-section h3')).fontSize),
      spacing: parseFloat(getComputedStyle(document.querySelector('.reading-section')).paddingTop),
      diagram: document.querySelector('.fire-triangle__drawing').getBoundingClientRect().width,
    })));
  }
  for (const sample of samples) {
    expect(sample.body).toBeGreaterThanOrEqual(16);
    expect(sample.body).toBeLessThanOrEqual(20);
  }
  expect(samples[2].body).toBeGreaterThan(samples[1].body);
  expect(samples[2].subtitle).toBeGreaterThan(samples[1].subtitle);
  expect(samples[2].spacing).toBeGreaterThan(samples[3].spacing);
  expect(samples[2].diagram).toBeGreaterThan(samples[3].diagram);
});

test('navega entre Home e Queimadas quando publicado em subdiretório', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await withPublicationServer('/projeto/', async base => {
  await page.goto(`${base}index.html`);
  const navigation = page.getByRole('navigation', { name: 'Principal' });
  await navigation.getByRole('link', { name: 'Queimadas', exact: true }).click();
  await expect(page).toHaveURL(/\/projeto\/queimadas$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.locator('.reading-intro').evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(16, 26, 23)');
  await navigation.getByRole('link', { name: 'Início', exact: true }).click();
  await expect(page).toHaveURL(/\/projeto\/$/);
  });
});

test('texto e links da página educativa atingem contraste AA', async ({ page }) => {
  await page.goto('/queimadas.html');
  const contrasts = await page.locator('main').evaluate(main => {
    const parse = color => color.match(/[\d.]+/g).map(Number);
    const luminance = rgb => rgb.slice(0, 3).map(value => {
      const channel = value / 255;
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
    return [...main.querySelectorAll('h1, h2, h3, p, li, a, span, figcaption')].map(element => {
      let background = element;
      while (parse(getComputedStyle(background).backgroundColor)[3] === 0) background = background.parentElement;
      const foreground = luminance(parse(getComputedStyle(element).color));
      const backdrop = luminance(parse(getComputedStyle(background).backgroundColor));
      return { text: element.textContent.trim().slice(0, 70), ratio: (Math.max(foreground, backdrop) + .05) / (Math.min(foreground, backdrop) + .05) };
    });
  });
  for (const { text, ratio } of contrasts) expect(ratio, text).toBeGreaterThanOrEqual(4.5);
});
