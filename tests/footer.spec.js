import { test, expect } from '@playwright/test';

const feedbackURL = 'https://forms.gle/wLPDbMi2CeicbYYH9';
const footerPages = ['index.html', 'queimadas.html', 'dados.html', 'prevencao.html', 'sobre.html', 'fontes.html'];

for (const path of footerPages) {
  test(`Feedback tem destino e descrição acessíveis em ${path}`, async ({ page }) => {
    await page.goto(`/${path}`);
    const footer = page.getByRole('contentinfo');
    const feedback = footer.getByRole('link', { name: 'Feedback', exact: true });
    await expect(footer.getByRole('link')).toHaveCount(4);
    await expect(feedback).toHaveAttribute('href', feedbackURL);
    await expect(feedback).toHaveAttribute('target', '_blank');
    await expect(feedback).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(feedback).toHaveAttribute('aria-describedby', 'feedback-description');
    await expect(feedback).toHaveAccessibleDescription('Formulário externo no Google Forms. Abre em nova aba.');
    await expect(footer.locator('#feedback-description')).toBeVisible();
  });

  for (const javaScriptEnabled of [true, false]) {
    test(`Feedback abre em nova aba por teclado em ${path}, JavaScript ${javaScriptEnabled}`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled, reducedMotion: 'reduce' });
      try {
        await context.route(feedbackURL, route => route.fulfill({ contentType: 'text/html', body: '<html lang="pt-BR"><title>Destino de feedback</title></html>' }));
        const page = await context.newPage();
        for (const width of [390, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(`http://127.0.0.1:4173/${path}`);
          const footer = page.getByRole('contentinfo');
          const credits = footer.getByRole('link', { name: 'Fontes e créditos', exact: true });
          const feedback = footer.getByRole('link', { name: 'Feedback', exact: true });
          await credits.focus();
          await page.keyboard.press('Tab');
          await expect(feedback).toBeFocused();
          await expect(feedback).toBeInViewport();
          expect(await feedback.evaluate(element => element.matches(':focus-visible') && getComputedStyle(element).outlineStyle === 'solid' && parseFloat(getComputedStyle(element).outlineWidth) >= 2)).toBe(true);
          const bounds = await feedback.boundingBox();
          expect(bounds.width).toBeGreaterThanOrEqual(44);
          expect(bounds.height).toBeGreaterThanOrEqual(44);
          await page.keyboard.press('Shift+Tab');
          await expect(credits).toBeFocused();
          await page.keyboard.press('Tab');
          const newTab = context.waitForEvent('page');
          await page.keyboard.press('Enter');
          const form = await newTab;
          await expect(form).toHaveURL(feedbackURL);
          await expect(form).toHaveTitle('Destino de feedback');
          await expect(page).toHaveURL(`http://127.0.0.1:4173/${path}`);
          expect(context.pages()).toHaveLength(2);
          expect(await form.evaluate(() => window.opener === null)).toBe(true);
          await form.close();
        }
      } finally {
        await context.close();
      }
    });
  }

  test(`Feedback mantém o rodapé responsivo em ${path}`, async ({ page }) => {
    await page.goto(`/${path}`);
    const footer = page.getByRole('contentinfo');
    for (const width of [320, 390, 599, 600, 768, 1024, 1199, 1200, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const fontSize of ['100%', '200%']) {
        await page.evaluate(size => document.documentElement.style.fontSize = size, fontSize);
        const layout = await footer.evaluate(element => {
          const links = [...element.querySelectorAll('a')].map(link => link.getBoundingClientRect().toJSON());
          return {
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            clipped: [...element.querySelectorAll('h2, h3, p, li, a')].some(text => text.scrollWidth > text.clientWidth || text.scrollHeight > text.clientHeight),
            links,
            description: element.querySelector('#feedback-description').getBoundingClientRect().toJSON(),
          };
        });
        expect(layout.overflow, `${width}px / ${fontSize}`).toBe(false);
        expect(layout.clipped, `${width}px / ${fontSize}`).toBe(false);
        for (const link of layout.links) {
          expect(link.left).toBeGreaterThanOrEqual(0);
          expect(link.right).toBeLessThanOrEqual(width);
          expect(link.height).toBeGreaterThanOrEqual(44);
        }
        const feedback = layout.links.at(-1);
        expect(layout.description.top).toBeGreaterThanOrEqual(feedback.bottom);
        for (const other of layout.links.slice(0, -1)) {
          expect(feedback.left >= other.right || feedback.right <= other.left || feedback.top >= other.bottom || feedback.bottom <= other.top).toBe(true);
        }
      }
    }
  });
}

test('rodapé encerra a Home com identidade, trajetória acadêmica e acesso à página Sobre', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  await expect(footer).toBeVisible();
  expect(await footer.evaluate(element => element.parentElement === document.body && element.previousElementSibling.matches('.home-opening'))).toBe(true);
  await expect(footer.getByRole('heading', { level: 2 })).toHaveText('Conscientiza Queimadas');
  await expect(footer.getByRole('heading', { level: 3 })).toHaveText(['Navegação', 'Institucional', 'Atividade acadêmica']);
  await expect(footer.getByText('Informação e prevenção para uma relação mais consciente com o fogo.', { exact: true })).toBeVisible();
  await expect(footer.getByText('Projeto desenvolvido ao longo das Atividades Extensionistas I, II e III do curso de Engenharia de Software da UNINTER.', { exact: true })).toBeVisible();
  await expect(footer.getByText('Itaguaçu — Espírito Santo', { exact: true })).toBeVisible();
  await expect(footer.getByText('© 2026 Conscientiza Queimadas', { exact: true })).toBeVisible();
  await expect(footer.getByRole('link')).toHaveCount(4);
  await expect(footer.getByRole('link', { name: 'Fontes e créditos', exact: true })).toHaveAttribute('href', './fontes');
  await expect(footer.getByRole('link', { name: 'Sobre o projeto', exact: true })).toHaveAttribute('href', './sobre');
  await expect(footer.getByRole('navigation', { name: 'Navegação', exact: true }).getByRole('link', { name: 'Voltar ao topo', exact: true })).toHaveAttribute('href', '#inicio');
  await expect(footer.getByRole('link', { name: 'Feedback', exact: true })).toHaveAttribute('href', feedbackURL);
  await expect(footer.getByText('Formulário externo no Google Forms. Abre em nova aba.', { exact: true })).toBeVisible();
  const mark = footer.locator('.site-footer__mark');
  await expect(footer.locator('svg')).toHaveCount(2);
  await expect(mark).toHaveAttribute('aria-hidden', 'true');
  await expect(mark).toHaveAttribute('focusable', 'false');
  const headerMark = page.locator('.brand__mark');
  expect(await mark.getAttribute('viewBox')).toBe(await headerMark.getAttribute('viewBox'));
  expect(await mark.locator('path').evaluateAll(paths => paths.map(path => path.getAttribute('d')))).toEqual(await headerMark.locator('path').evaluateAll(paths => paths.map(path => path.getAttribute('d'))));
  const background = footer.locator('.site-footer__landscape');
  await expect(background).toHaveAttribute('aria-hidden', 'true');
  await expect(background.locator('img')).toHaveAttribute('alt', '');
  expect(await background.locator('img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  const response = await page.request.get(await background.locator('img').evaluate(image => image.src));
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('image/webp');
  expect((await response.body()).length).toBeLessThan(200000);
});

for (const [width, height, columns] of [[320, 568, 1], [390, 844, 1], [599, 900, 1], [600, 900, 2], [768, 1024, 2], [1024, 768, 2], [1199, 900, 2], [1200, 900, 4], [1440, 900, 4], [1920, 1080, 4]]) {
  test(`rodapé mantém leitura e ordem em ${width}×${height}, inclusive com texto a 200%`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    for (const fontSize of ['100%', '200%']) {
      const readingColumns = columns === 4 && fontSize === '200%' ? 2 : columns;
      await page.evaluate(size => document.documentElement.style.fontSize = size, fontSize);
      const layout = await footer.evaluate(element => {
        const bounds = selector => element.querySelector(selector).getBoundingClientRect().toJSON();
        return {
          width: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth,
          groups: [...element.querySelector('.site-footer__groups').children].map(group => group.getBoundingClientRect().toJSON()),
          dividers: [...element.querySelector('.site-footer__groups').children].slice(1).map(group => parseFloat(getComputedStyle(group).borderLeftWidth)),
          landscape: bounds('.site-footer__landscape'),
          readingArea: bounds('.site-footer__groups'),
          copyright: bounds('.site-footer__bottom'),
          footer: element.getBoundingClientRect().toJSON(),
          previousBottom: element.previousElementSibling.getBoundingClientRect().bottom,
          clipped: [...element.querySelectorAll('h2, h3, p, li, a')].some(text => text.scrollWidth > text.clientWidth || text.scrollHeight > text.clientHeight),
        };
      });
      expect(layout.scroll).toBeLessThanOrEqual(layout.width);
      expect(layout.clipped).toBe(false);
      expect(layout.footer.top).toBe(layout.previousBottom);
      for (const group of layout.groups) {
        expect(group.left).toBeGreaterThanOrEqual(20);
        expect(group.right).toBeLessThanOrEqual(width - 20);
        expect(group.bottom).toBeLessThanOrEqual(layout.copyright.top);
      }
      if (columns === 4) {
        expect(layout.landscape.left).toBe(0);
        expect(layout.landscape.right).toBe(width);
        expect(layout.landscape.top).toBe(layout.footer.top);
        expect(layout.landscape.bottom).toBe(layout.footer.bottom);
        expect(layout.landscape.height).toBeGreaterThanOrEqual(160);
        expect(layout.dividers).toEqual(fontSize === '100%' ? [1, 1, 1] : [0, 0, 0]);
      } else {
        expect(layout.landscape.top).toBeGreaterThanOrEqual(layout.readingArea.bottom);
        expect(layout.dividers).toEqual([0, 0, 0]);
      }
      if (columns !== 4) expect(layout.landscape.bottom).toBeLessThanOrEqual(layout.copyright.top);
      expect(layout.copyright.bottom).toBeLessThanOrEqual(layout.footer.bottom);
      for (let index = 1; index < layout.groups.length; index++) {
        const previous = layout.groups[index - 1];
        const group = layout.groups[index];
        if (index % readingColumns === 0) expect(group.top).toBeGreaterThanOrEqual(previous.bottom);
        else {
          expect(group.top).toBe(previous.top);
          expect(group.left).toBeGreaterThan(previous.right);
        }
      }
      expect(await footer.locator('h2, h3, p, li').evaluateAll(elements => elements.every(element => getComputedStyle(element).textAlign === 'left'))).toBe(true);
      if (fontSize === '100%' && [390, 768, 1200, 1440].includes(width)) {
        await footer.scrollIntoViewIfNeeded();
        await page.screenshot({ path: testInfo.outputPath('footer.png'), fullPage: true, animations: 'disabled' });
        await footer.screenshot({ path: testInfo.outputPath('footer-detail.png'), animations: 'disabled' });
      }
      if (fontSize === '200%' && [390, 1440].includes(width)) {
        await footer.screenshot({ path: testInfo.outputPath('footer-text-200.png'), animations: 'disabled' });
      }
    }
  });
}

for (const width of [390, 1440]) {
  test(`Voltar ao topo no rodapé é acessível por Tab, Shift+Tab e Enter em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const shortcut = page.getByRole('link', { name: 'Ver impactos das queimadas', exact: true });
    const home = page.getByRole('contentinfo').getByRole('link', { name: 'Voltar ao topo', exact: true });
    await shortcut.focus();
    await page.keyboard.press('Tab');
    await expect(home).toBeFocused();
    await expect(home).toBeInViewport();
    expect(await home.evaluate(element => element.matches(':focus-visible') && getComputedStyle(element).outlineStyle === 'solid' && parseFloat(getComputedStyle(element).outlineWidth) >= 2)).toBe(true);
    const bounds = await home.boundingBox();
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press('Shift+Tab');
    await expect(shortcut).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(home).toBeFocused();
    await page.evaluate(() => { window.footerDocumentMarker = 'mesmo documento'; });
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('http://127.0.0.1:4173/#inicio');
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    expect(await page.evaluate(() => window.footerDocumentMarker)).toBe('mesmo documento');
    await expect(page.locator('#inicio')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.brand')).toBeFocused();
  });
}

for (const width of [390, 1440]) {
  test(`Voltar ao topo retorna suavemente sem recarregar, inclusive sem JavaScript, em ${width}px`, async ({ browser }) => {
    for (const javaScriptEnabled of [true, false]) {
      for (const reducedMotion of ['no-preference', 'reduce']) {
        const context = await browser.newContext({ javaScriptEnabled, reducedMotion, viewport: { width, height: 900 } });
        try {
          const page = await context.newPage();
          await page.goto('http://127.0.0.1:4173/');
          const home = page.getByRole('contentinfo').getByRole('link', { name: 'Voltar ao topo', exact: true });
          await home.scrollIntoViewIfNeeded();
          const start = await page.evaluate(() => scrollY);
          const positions = [];
          await home.click();
          // Amostra pela automação: callbacks da página não executam sem JavaScript.
          await expect.poll(async () => {
            const position = await page.evaluate(() => scrollY);
            positions.push(position);
            return position;
          }, { intervals: [16] }).toBeLessThanOrEqual(1);
          expect(start).toBeGreaterThan(0);
          expect(positions.some(position => position > 1 && position < start - 1)).toBe(reducedMotion === 'no-preference');
          await expect(page).toHaveURL(/#inicio$/);
        } finally {
          await context.close();
        }
      }
    }
  });
}

test('todos os textos e estados do link atingem contraste AA no fundo do rodapé', async ({ page }) => {
  test.setTimeout(45000);
  for (const width of [320, 390, 600, 768, 1024, 1199, 1200, 1280, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    const home = footer.getByRole('link', { name: 'Voltar ao topo', exact: true });
    for (const fontSize of ['100%', '200%']) {
      await page.evaluate(size => document.documentElement.style.fontSize = size, fontSize);
      await page.mouse.move(0, 0);
      await home.evaluate(element => element.blur());
      // Captura o fundo realmente renderizado, mantendo as caixas de texto no lugar.
      const hideText = await page.addStyleTag({ content: '.site-footer :is(h2, h3, p, li, a) { color: transparent !important; text-decoration-color: transparent !important; outline: none !important; } .site-footer svg { visibility: hidden; }' });
      const backgroundPng = (await footer.screenshot({ animations: 'disabled' })).toString('base64');
      await hideText.evaluate(element => element.remove());
      for (const state of ['normal', 'hover', 'focus']) {
        if (state === 'hover') await home.hover();
        if (state === 'focus') {
          await page.mouse.move(0, 0);
          await page.getByRole('link', { name: 'Ver impactos das queimadas', exact: true }).focus();
          await page.keyboard.press('Tab');
        }
        // Espera a transição de cor curta antes de medir o estado final.
        await expect.poll(() => home.evaluate(element => getComputedStyle(element).color)).toBe(state === 'normal' ? 'rgb(242, 241, 233)' : 'rgb(227, 179, 110)');
        const contrasts = await footer.evaluate(async (element, backgroundPng) => {
          const luminance = color => {
            const [red, green, blue] = color.map(value => {
              const channel = value / 255;
              return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
            });
            return red * .2126 + green * .7152 + blue * .0722;
          };
          const parseColor = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);
          const ratio = (foreground, background) => (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05);
          const image = new Image();
          image.src = `data:image/png;base64,${backgroundPng}`;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          const footerBounds = element.getBoundingClientRect();
          const texts = [...element.querySelectorAll('h2, h3, p, li, a')].map(text => {
            const bounds = text.getBoundingClientRect();
            const x = Math.max(0, Math.floor(bounds.left - footerBounds.left));
            const y = Math.max(0, Math.floor(bounds.top - footerBounds.top));
            const pixels = context.getImageData(x, y, Math.min(Math.ceil(bounds.width), image.width - x), Math.min(Math.ceil(bounds.height), image.height - y)).data;
            const foreground = luminance(parseColor(getComputedStyle(text).color));
            let minimum = Infinity;
            for (let index = 0; index < pixels.length; index += 4) {
              const background = luminance([pixels[index], pixels[index + 1], pixels[index + 2]]);
              minimum = Math.min(minimum, ratio(foreground, background));
            }
            return { text: text.textContent.trim(), ratio: minimum };
          });
          const link = element.querySelector('a');
          return { texts, outline: ratio(luminance(parseColor(getComputedStyle(link).outlineColor)), luminance(parseColor(getComputedStyle(element).backgroundColor))), underline: getComputedStyle(link).textDecorationLine };
        }, backgroundPng);
        for (const { text, ratio } of contrasts.texts) expect(ratio, `${width}px / ${fontSize} / ${state}: ${text}`).toBeGreaterThanOrEqual(4.5);
        expect(contrasts.underline).toContain('underline');
        if (state === 'focus') expect(contrasts.outline).toBeGreaterThanOrEqual(3);
      }
    }
  }
});

test('rodapé funciona sem JavaScript e respeita movimento reduzido', async ({ browser }) => {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/');
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByText('Itaguaçu — Espírito Santo', { exact: true })).toBeVisible();
    const home = footer.getByRole('link', { name: 'Voltar ao topo', exact: true });
    expect(await home.evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
    expect(await footer.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
    await home.click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await context.close();
  }
});
