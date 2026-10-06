import { test, expect } from '@playwright/test';

const sectionTitle = 'O fogo deixa marcas além da paisagem.';
const axes = ['Meio ambiente', 'Saúde', 'Sociedade'];

test('impactos são uma região da Home com três eixos disponíveis sem interação', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: sectionTitle });
  await expect(section).toBeVisible();
  expect(await section.evaluate(element => element.tagName)).toBe('SECTION');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(sectionTitle);
  await expect(section.getByRole('heading', { level: 3 })).toHaveText(axes);
  await expect(section.locator('.impacts__axis p')).toHaveCount(3);
  await expect(section.locator('a, button, details, img, svg')).toHaveCount(0);
  expect(await page.locator('main').evaluate(element => [...element.querySelectorAll('h1, h2, h3')].map(heading => heading.tagName))).toEqual(['H1', 'H2', 'H3', 'H3', 'H3']);
});

for (const [width, height, columns] of [[320, 568, 1], [390, 844, 1], [768, 1024, 1], [960, 768, 3], [1440, 900, 3], [1920, 1080, 3], [844, 390, 1]]) {
  test(`impactos têm ${columns} coluna(s) e leitura sem recorte em ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const blocks = page.locator('.impacts__axis');
    await expect(blocks).toHaveCount(3);
    const layout = await page.evaluate(() => {
      const section = document.querySelector('.impacts').getBoundingClientRect();
      return {
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
        sectionBottom: section.bottom,
        heroBottom: document.querySelector('.hero').getBoundingClientRect().bottom,
        sectionTop: section.top,
        sceneBottom: document.querySelector('.hero__landscape').getBoundingClientRect().bottom,
        blocks: [...document.querySelectorAll('.impacts__axis')].map(element => element.getBoundingClientRect().toJSON()),
        paragraphs: [...document.querySelectorAll('.impacts p')].map(element => ({ clipped: element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight })),
      };
    });
    expect(layout.scroll).toBeLessThanOrEqual(layout.client);
    expect(layout.sectionTop).toBe(layout.heroBottom);
    expect(layout.sceneBottom).toBe(layout.heroBottom);
    expect(layout.paragraphs.every(paragraph => !paragraph.clipped)).toBe(true);
    for (const block of layout.blocks) {
      expect(block.left).toBeGreaterThanOrEqual(20);
      expect(block.right).toBeLessThanOrEqual(width - 20);
      expect(block.bottom).toBeLessThan(layout.sectionBottom);
    }
    if (columns === 3) {
      expect(layout.blocks.map(block => block.top)).toEqual([layout.blocks[0].top, layout.blocks[0].top, layout.blocks[0].top]);
      expect(layout.blocks[1].left).toBeGreaterThan(layout.blocks[0].right);
      expect(layout.blocks[2].left).toBeGreaterThan(layout.blocks[1].right);
    } else {
      expect(layout.blocks[1].top).toBeGreaterThan(layout.blocks[0].bottom);
      expect(layout.blocks[2].top).toBeGreaterThan(layout.blocks[1].bottom);
    }
    await blocks.last().scrollIntoViewIfNeeded();
    await expect(blocks.last().getByRole('heading', { name: 'Sociedade' })).toBeInViewport();
  });
}

test('impactos se ajustam a janelas desktop baixas sem reduzir a legibilidade', async ({ page }) => {
  await page.goto('/');
  const typography = [];
  for (const [width, height] of [[1280, 500], [1280, 600], [1350, 626], [1440, 720], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    const section = page.locator('.impacts');
    expect((await section.boundingBox()).height).toBeLessThanOrEqual(height);
    expect(await section.locator('.impacts__axis p').evaluateAll(elements => elements.every(element => {
      const style = getComputedStyle(element);
      return parseFloat(style.fontSize) >= 14 && parseFloat(style.lineHeight) / parseFloat(style.fontSize) >= 1.5;
    }))).toBe(true);
    const heading = await section.locator('h2').boundingBox();
    const introduction = await section.locator('.impacts__description').boundingBox();
    expect(introduction.y).toBeGreaterThanOrEqual(heading.y + heading.height);
    typography.push(await section.evaluate(element => ({
      heading: parseFloat(getComputedStyle(element.querySelector('h2')).fontSize),
      body: parseFloat(getComputedStyle(element.querySelector('.impacts__axis p')).fontSize),
    })));
    expect(typography.at(-1).heading).toBeGreaterThanOrEqual(28);
    await section.scrollIntoViewIfNeeded();
    const bounds = await section.boundingBox();
    expect(bounds.y).toBeGreaterThanOrEqual(-1);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(height + 1);
    await expect(section.locator('.impacts__eyebrow')).toBeInViewport();
    for (const paragraph of await section.locator('.impacts__axis p').all()) {
      const box = await paragraph.boundingBox();
      expect(box.y + box.height).toBeLessThanOrEqual(height);
    }
  }
  expect(typography[0].heading).toBeLessThan(typography.at(-1).heading);
  expect(typography[0].body).toBeLessThan(typography.at(-1).body);
});

test('impactos crescem proporcionalmente em monitores grandes e voltam à escala compacta', async ({ page }) => {
  await page.goto('/');
  const sizes = [];
  for (const [width, height] of [[1350, 626], [1440, 900], [1920, 1080], [2560, 1440], [1350, 626]]) {
    await page.setViewportSize({ width, height });
    const section = page.locator('.impacts');
    sizes.push(await section.evaluate(element => {
      const heading = getComputedStyle(element.querySelector('h2'));
      const body = getComputedStyle(element.querySelector('.impacts__axis p'));
      const axes = getComputedStyle(element.querySelector('.impacts__axes'));
      return { heading: parseFloat(heading.fontSize), body: parseFloat(body.fontSize), gap: parseFloat(axes.marginTop), height: element.getBoundingClientRect().height };
    }));
    expect(sizes.at(-1).height).toBeLessThanOrEqual(height);
    const heading = await section.locator('h2').boundingBox();
    const introduction = await section.locator('.impacts__description').boundingBox();
    expect(introduction.y).toBeGreaterThanOrEqual(heading.y + heading.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(sizes[1].heading).toBeGreaterThanOrEqual(56);
  expect(sizes[1].body).toBeGreaterThan(16);
  expect(sizes[2].heading).toBeGreaterThan(sizes[1].heading);
  expect(sizes[2].body).toBeGreaterThan(sizes[1].body);
  expect(sizes[2].body).toBeGreaterThanOrEqual(20);
  expect(sizes[2].gap).toBeGreaterThan(sizes[0].gap);
  expect(sizes[3].body).toBeGreaterThanOrEqual(sizes[2].body);
  expect(sizes.at(-1)).toEqual(sizes[0]);
});

test('a transição é decorativa e mantém a rolagem natural', async ({ page }) => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const section = page.locator('.impacts');
    const terrain = await section.evaluate(element => {
      const style = getComputedStyle(element, '::before');
      return { content: style.content, height: parseFloat(style.height), clip: style.clipPath, events: style.pointerEvents, animation: style.animationName, top: parseFloat(style.top) };
    });
    expect(terrain.content).toBe('""');
    expect(terrain.height).toBeGreaterThanOrEqual(16);
    expect(terrain.height).toBeLessThanOrEqual(41);
    expect(terrain.clip).toContain('polygon(');
    expect(terrain.events).toBe('none');
    expect(terrain.animation).toBe('none');
    const before = await section.boundingBox();
    const eyebrow = await section.locator('.impacts__eyebrow').boundingBox();
    expect(eyebrow.y).toBeGreaterThan(before.y + terrain.top + terrain.height);
    const scrollBefore = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 160);
    await expect.poll(async () => (await section.boundingBox()).y).toBeLessThan(before.y - 100);
    const after = await section.boundingBox();
    const scrollAfter = await page.evaluate(() => scrollY);
    expect(Math.abs(before.y - after.y - (scrollAfter - scrollBefore))).toBeLessThan(1);
  }
});

test('impactos e transição continuam disponíveis com movimento reduzido e sem JavaScript', async ({ browser }) => {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/');
    await expect(page.locator('.hero__cta, .hero__continuity')).toHaveCount(0);
    expect(await page.locator('.impacts').evaluate(element => getComputedStyle(element, '::before').clipPath)).toContain('polygon(');
    await expect(page.getByRole('region', { name: sectionTitle }).getByRole('heading', { level: 3 })).toHaveText(axes);
    expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
    await context.close();
  }
});

test('texto a 200% e reflow a 320 px preservam todo o conteúdo', async ({ page }) => {
  for (const [width, height] of [[320, 900], [1350, 626], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(() => document.documentElement.style.fontSize = '200%');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const content = page.locator('.impacts');
    expect(await content.locator('h2, h3, p').evaluateAll(elements => elements.every(element => {
      const style = getComputedStyle(element);
      return element.scrollWidth <= element.clientWidth && (element.scrollHeight <= element.clientHeight || style.overflowY === 'visible');
    }))).toBe(true);
    const lastParagraph = content.locator('.impacts__axis p').last();
    await lastParagraph.scrollIntoViewIfNeeded();
    await expect(lastParagraph).toBeInViewport();
  }
});

test('todas as cores de texto da seção atingem contraste AA no fundo renderizado', async ({ page }) => {
  await page.goto('/');
  const contrasts = await page.locator('.impacts').evaluate(section => {
    const luminance = color => {
      const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => {
        const channel = value / 255;
        return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
      });
      return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
    };
    const background = luminance(getComputedStyle(section).backgroundColor);
    return [...section.querySelectorAll('h2, h3, p, .impacts__number')].map(element => {
      const foreground = luminance(getComputedStyle(element).color);
      return { text: element.textContent.trim().slice(0, 35), ratio: (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05) };
    });
  });
  expect(contrasts.length).toBeGreaterThan(0);
  for (const { text, ratio } of contrasts) expect(ratio, text).toBeGreaterThanOrEqual(4.5);
});
