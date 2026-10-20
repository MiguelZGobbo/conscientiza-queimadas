import { test, expect } from '@playwright/test';

async function waitForPageTransition(page) {
  await page.evaluate(() => document.activeViewTransition?.finished);
}

for (const javaScriptEnabled of [true, false]) {
  test.describe(`JavaScript ${javaScriptEnabled}`, () => {
    test.use({ javaScriptEnabled, viewport: { width: 1440, height: 900 } });
    test('percurso Queimadas → Dados → Prevenção e histórico', async ({ page }) => {
      await page.route('**/projeto/**', async route => {
        const response = await route.fetch({ url: route.request().url().replace('/projeto/', '/') });
        await route.fulfill({ response });
      });
      for (const prefix of ['', '/projeto']) {
        await page.goto(`http://127.0.0.1:4173${prefix}/queimadas.html`);
        const dataLink = page.getByRole('link', { name: 'Explorar os dados das queimadas', exact: true });
        await expect(dataLink).toBeVisible();
        await dataLink.click();
        await expect(page).toHaveURL(new RegExp(`${prefix}/dados\\.html$`));
        await waitForPageTransition(page);
        const next = page.getByRole('region', { name: 'Dos dados à prevenção.' });
        expect(await next.evaluate(element => element.previousElementSibling.id)).toBe('metodologia');
        await next.getByRole('link', { name: 'Conhecer as orientações de prevenção', exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`${prefix}/prevencao\\.html$`));
        await waitForPageTransition(page);
        await page.goBack();
        await expect(page).toHaveURL(new RegExp(`${prefix}/dados\\.html$`));
        await waitForPageTransition(page);
        await expect(page.locator('.site-nav [aria-current="page"]')).toHaveText('Dados');
        await page.goBack();
        await expect(page).toHaveURL(new RegExp(`${prefix}/queimadas\\.html$`));
        await waitForPageTransition(page);
      }
    });
  });
}

test('atalho de emergência sublinha somente o texto e mantém o destino acessível', async ({ page }) => {
  await page.goto('/prevencao.html');
  const shortcut = page.locator('.prevention-shortcut');
  expect(await shortcut.evaluate(element => getComputedStyle(element).textDecorationLine)).toBe('none');
  expect(await shortcut.locator('span').first().evaluate(element => getComputedStyle(element).textDecorationLine)).toBe('underline');
  const arrow = shortcut.locator('[aria-hidden="true"]');
  await expect(arrow).toHaveText('↓');
  expect(await arrow.evaluate(element => getComputedStyle(element).textDecorationLine)).toBe('none');
  await shortcut.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#encontrar-incendio')).toBeFocused();
});

test('navbar oferece hover estável, página atual e alvos acessíveis', async ({ page }) => {
  for (const width of [390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/queimadas.html');
    if (width < 960) await page.getByRole('button', { name: 'Abrir menu' }).click();
    const links = page.locator('.site-nav a');
    for (const link of await links.all()) {
      const before = await link.boundingBox();
      expect(before.height).toBeGreaterThanOrEqual(44);
      expect(before.width).toBeGreaterThanOrEqual(44);
      const background = await link.evaluate(element => getComputedStyle(element).backgroundColor);
      await link.hover();
      await expect.poll(() => link.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(background);
      expect(await link.boundingBox()).toEqual(before);
      await page.mouse.move(0, 0);
    }
    await links.first().focus();
    await page.keyboard.press('Tab');
    await expect(links.nth(1)).toBeFocused();
    expect(await links.nth(1).evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid');
    await expect(page.locator('.site-nav [aria-current="page"]')).toHaveText('Queimadas');
  }
});

for (const name of ['queimadas', 'dados', 'prevencao']) {
  test(`introdução ilustrada de ${name} preserva leitura e espaço em telas pequenas e a 200%`, async ({ page }, testInfo) => {
    for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900], [844, 390], [1280, 500]]) {
      await page.setViewportSize({ width, height });
      await page.goto(`/${name}.html`);
      const intro = page.locator('.page-intro');
      const illustration = intro.locator('svg');
      await expect(illustration).toHaveAttribute('aria-hidden', 'true');
      await expect(illustration).toHaveAttribute('focusable', 'false');
      for (const fontSize of ['100%', '200%']) {
        await page.evaluate(size => { document.documentElement.style.fontSize = size; }, fontSize);
        const layout = await intro.evaluate(element => {
          const text = element.querySelector('.page-intro__text').getBoundingClientRect();
          const drawing = element.querySelector('svg').getBoundingClientRect();
          const intro = element.getBoundingClientRect();
          return {
            width: document.documentElement.scrollWidth,
            text: text.toJSON(), drawing: drawing.toJSON(), intro: intro.toJSON(),
            overflowing: [...element.querySelectorAll('p, h1, a')].some(item => item.scrollWidth > item.clientWidth),
          };
        });
        expect(layout.width).toBeLessThanOrEqual(width);
        expect(layout.overflowing).toBe(false);
        expect(layout.drawing.bottom).toBeLessThanOrEqual(layout.intro.bottom);
        expect(layout.drawing.height).toBeLessThanOrEqual(width < 960 ? 128 : 240);
        if (width < 960) expect(layout.drawing.top).toBeGreaterThanOrEqual(layout.text.bottom);
        else expect(layout.drawing.left).toBeGreaterThanOrEqual(layout.text.right);
      }
      if ([320, 1440].includes(width)) {
        await page.evaluate(() => { document.documentElement.style.fontSize = '100%'; });
        await intro.screenshot({ path: testInfo.outputPath(`${name}-${width}-introducao.png`), animations: 'disabled' });
      }
    }
  });
}

test('transição nativa dissolve entre documentos e respeita movimento reduzido', async ({ page }) => {
  await page.addInitScript(() => {
    window.addEventListener('pagereveal', async event => {
      window.pageTransition = { active: Boolean(event.viewTransition) };
      if (!event.viewTransition) return;
      await event.viewTransition.ready;
      window.pageTransition.duration = getComputedStyle(document.documentElement, '::view-transition-new(root)').animationDuration;
      await event.viewTransition.finished;
      window.pageTransition.finished = true;
    });
  });
  for (const reducedMotion of ['no-preference', 'reduce']) {
    await page.emulateMedia({ reducedMotion });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/index.html');
    for (const [label, path] of [['Queimadas', 'queimadas'], ['Dados', 'dados'], ['Prevenção', 'prevencao'], ['Início', 'index']]) {
      await page.getByRole('navigation', { name: 'Principal', exact: true }).getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/${path}\\.html$`));
      await expect.poll(() => page.evaluate(() => window.pageTransition)).toEqual(
        reducedMotion === 'reduce' ? { active: false } : { active: true, duration: '0.18s', finished: true },
      );
    }
  }
});
