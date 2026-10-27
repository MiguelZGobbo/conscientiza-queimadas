import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const pages = ['index.html', 'queimadas.html', 'dados.html', 'prevencao.html', 'sobre.html', 'fontes.html'];
const profiles = [
  { name: 'mobile', width: 390, height: 844, mobile: true, cpu: 4, latency: 150, download: 200000, upload: 93750 },
  { name: 'desktop', width: 1440, height: 900, mobile: false, cpu: 1 },
];

export function measurementOptions(args) {
  const options = { baseURL: 'http://127.0.0.1:4173/', phase: 'antes', output: null, runs: 5 };
  for (let index = 0; index < args.length; index += 2) {
    const key = { '--base-url': 'baseURL', '--phase': 'phase', '--output': 'output', '--runs': 'runs' }[args[index]];
    if (!key || !args[index + 1]) throw new Error('Argumentos inválidos: --base-url URL --phase antes|depois --output pasta [--runs 5]');
    options[key] = args[index + 1];
  }
  const base = new URL(options.baseURL);
  if (!['http:', 'https:'].includes(base.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)) throw new Error('As medições desta preparação devem usar servidor local.');
  if (!['antes', 'depois'].includes(options.phase)) throw new Error('Fase inválida.');
  options.runs = Number(options.runs);
  if (!Number.isInteger(options.runs) || options.runs < 1) throw new Error('Número de amostras inválido.');
  options.baseURL = base.href.endsWith('/') ? base.href : `${base.href}/`;
  options.output = resolve(options.output || `.auditoria-local/${options.phase}`);
  return options;
}

function observeMetrics() {
  window.siteLab = { lcp: null, cls: 0, longTasks: [], events: [] };
  let firstShift = 0, lastShift = 0, sessionScore = 0;
  new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      const element = entry.element;
      window.siteLab.lcp = { milliseconds: entry.startTime, element: element ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}` : null, url: entry.url || null };
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      if (entry.hadRecentInput) continue;
      if (entry.startTime - lastShift > 1000 || entry.startTime - firstShift > 5000) { firstShift = entry.startTime; sessionScore = 0; }
      lastShift = entry.startTime; sessionScore += entry.value;
      window.siteLab.cls = Math.max(window.siteLab.cls, sessionScore);
    }
  }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver(list => {
    window.siteLab.longTasks.push(...list.getEntries().map(entry => ({ start: entry.startTime, duration: entry.duration })));
  }).observe({ type: 'longtask', buffered: true });
  new PerformanceObserver(list => {
    window.siteLab.events.push(...list.getEntries().filter(entry => entry.interactionId).map(entry => ({ name: entry.name, duration: entry.duration })));
  }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
}

async function snapshot(page, requests) {
  const timing = await page.evaluate(() => ({
    ...structuredClone(window.siteLab),
    resourceTimingBytes: [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')].reduce((sum, entry) => sum + entry.transferSize, 0),
    resources: performance.getEntriesByType('resource').map(entry => ({ path: new URL(entry.name).pathname, transferSize: entry.transferSize, encodedBodySize: entry.encodedBodySize, decodedBodySize: entry.decodedBodySize })),
    overflow: document.documentElement.scrollWidth > innerWidth,
    cookiesPresent: Boolean(document.cookie), localStorageKeys: Object.keys(localStorage), sessionStorageKeys: Object.keys(sessionStorage),
  }));
  return { ...timing, requests: requests.size, cdpEncodedBytes: [...requests.values()].reduce((sum, request) => sum + (request.bytes || 0), 0) };
}

export async function measureSite(options) {
  await mkdir(resolve(options.output, 'capturas'), { recursive: true });
  const browser = await chromium.launch();
  const report = { date: new Date().toISOString(), tool: 'Playwright/CDP/PerformanceObserver', node: process.version, browser: browser.version(), ...options, profiles, cache: 'novo contexto; cache desativado por CDP', server: 'HTTP local, sem compressão, Cache-Control: no-store', fieldINP: 'não medido', samples: [] };
  try {
    for (const profile of profiles) for (const route of pages) for (let run = 1; run <= options.runs; run++) {
      const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, deviceScaleFactor: 1, isMobile: profile.mobile, hasTouch: profile.mobile, reducedMotion: 'no-preference' });
      try {
        const page = await context.newPage();
        const errors = [], requests = new Map();
        page.on('pageerror', error => errors.push({ type: 'pageerror', message: error.message }));
        page.on('console', message => { if (message.type() === 'error') errors.push({ type: 'console', message: message.text() }); });
        page.on('requestfailed', request => errors.push({ type: 'network', path: new URL(request.url()).pathname, message: request.failure()?.errorText }));
        await page.addInitScript(observeMetrics);
        const cdp = await context.newCDPSession(page);
        await cdp.send('Network.enable');
        await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
        if (profile.mobile) await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: profile.latency, downloadThroughput: profile.download, uploadThroughput: profile.upload });
        cdp.on('Network.requestWillBeSent', event => requests.set(event.requestId, { path: new URL(event.request.url).pathname }));
        cdp.on('Network.responseReceived', event => { const request = requests.get(event.requestId); if (request) Object.assign(request, { status: event.response.status, mime: event.response.mimeType, cache: event.response.fromDiskCache || false }); });
        cdp.on('Network.loadingFinished', event => { const request = requests.get(event.requestId); if (request) request.bytes = event.encodedDataLength; });
        await page.goto(new URL(route, options.baseURL).href, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);
        const initial = await snapshot(page, requests);
        const capture = `${profile.name}-${route.replace('.html', '')}`;
        if (run === 1) await page.screenshot({ path: resolve(options.output, 'capturas', `${capture}-inicial.png`) });
        let interaction = null;
        if (route === 'dados.html') {
          const acre = page.getByRole('button', { name: 'Acre', exact: true });
          await acre.scrollIntoViewIfNeeded();
          if (profile.mobile) await acre.tap(); else await acre.click();
          await page.waitForTimeout(400);
          interaction = await page.evaluate(() => ({ selected: document.querySelector('[data-uf="AC"]').getAttribute('aria-pressed'), events: structuredClone(window.siteLab.events) }));
          if (run === 1) await page.screenshot({ path: resolve(options.output, 'capturas', `${capture}-mapa.png`) });
        }
        if (route === 'index.html' && !profile.mobile) {
          await page.mouse.move(profile.width * .85, profile.height * .65);
          await page.waitForTimeout(100);
        }
        // A etapa seguinte mede também os recursos carregados ao alcançar o rodapé.
        await page.locator('footer').scrollIntoViewIfNeeded();
        await page.waitForTimeout(1200);
        await page.locator('footer img').evaluate(image => image.decode());
        const afterScroll = await snapshot(page, requests);
        if (run === 1) await page.screenshot({ path: resolve(options.output, 'capturas', `${capture}-rodape.png`) });
        const sample = { profile: profile.name, route, run, initial, afterScroll, interaction, resources: [...requests.values()], errors };
        report.samples.push(sample);
        await writeFile(resolve(options.output, 'medicoes.json'), `${JSON.stringify(report, null, 2)}\n`);
        console.log(`${options.phase} ${profile.name} ${route} ${run}/${options.runs}: LCP=${initial.lcp?.milliseconds ?? 'não observado'} ms, CLS=${initial.cls}, ${initial.requests} req / ${initial.cdpEncodedBytes} B`);
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
  return report;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try { await measureSite(measurementOptions(process.argv.slice(2))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
