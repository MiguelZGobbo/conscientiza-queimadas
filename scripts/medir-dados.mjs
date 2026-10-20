import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

// Medição de laboratório: iniciar npm run dev antes. Não equivale a dados de campo.
const browser = await chromium.launch();
const samples = [];
try {
  for (let run = 1; run <= 5; run++) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.labMetrics = { lcp: null, cls: 0, eventDurations: [] };
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) window.labMetrics.lcp = entry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.labMetrics.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (entry.interactionId) window.labMetrics.eventDurations.push(entry.duration);
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750,
    });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.goto('http://127.0.0.1:4173/dados.html');
    await page.waitForTimeout(800);
    const loading = await page.evaluate(() => ({
      lcp: window.labMetrics.lcp,
      cls: window.labMetrics.cls,
      bytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + entry.transferSize, 0)
        + performance.getEntriesByType('navigation')[0].transferSize,
    }));
    await page.getByRole('button', { name: 'Acre', exact: true }).tap();
    await page.waitForTimeout(250);
    const interaction = await page.evaluate(() => ({
      eventDurations: window.labMetrics.eventDurations,
      area: document.querySelector('#comparison-area').textContent,
    }));
    samples.push({ run, ...loading, ...interaction });
    await context.close();
  }
  const report = {
    date: new Date().toISOString(), browser: browser.version(), viewport: '390×844 CSS px',
    cpuSlowdown: 4, latencyMs: 150, downloadBytesPerSecond: 200000, uploadBytesPerSecond: 93750,
    cacheDisabled: true, server: 'localhost HTTP sem compressão', samples,
  };
  mkdirSync(new URL('../test-results/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../test-results/desempenho-dados.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
