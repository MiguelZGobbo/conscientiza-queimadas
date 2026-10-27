import { chromium, webkit } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const pages = ['index.html', 'queimadas.html', 'dados.html', 'prevencao.html', 'sobre.html', 'fontes.html'];
const profiles = [
  { name: 'android-4g', engine: 'chromium', width: 390, height: 844, dpr: 3, mobile: true, cpu: 4, latency: 150, download: 200000, upload: 93750 },
  { name: 'android', engine: 'chromium', width: 390, height: 844, dpr: 3, mobile: true, cpu: 1 },
  { name: 'ios-webkit', engine: 'webkit', width: 390, height: 844, dpr: 3, mobile: true, cpu: null },
  { name: 'desktop', engine: 'chromium', width: 1440, height: 900, dpr: 1, mobile: false, cpu: 1 },
];

export function measurementOptions(args) {
  const options = { baseURL: 'http://127.0.0.1:4173/', phase: 'antes', output: null, runs: 5, profiles: profiles.map(p => p.name).join(','), scenarios: 'direct,navigation' };
  for (let index = 0; index < args.length; index += 2) {
    const key = { '--base-url': 'baseURL', '--phase': 'phase', '--output': 'output', '--runs': 'runs', '--profiles': 'profiles', '--scenarios': 'scenarios' }[args[index]];
    if (!key || !args[index + 1]) throw new Error('Argumentos inválidos: --base-url URL --phase antes|depois --output pasta [--runs 5]');
    options[key] = args[index + 1];
  }
  const base = new URL(options.baseURL);
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname) && ['http:', 'https:'].includes(base.protocol);
  if ((!local && base.origin !== 'https://conscientiza-queimadas.pages.dev') || base.username || base.password || base.search || base.hash) throw new Error('Use loopback ou a origem pública autorizada, sem credenciais/query/fragmento.');
  if (!['antes', 'depois'].includes(options.phase)) throw new Error('Fase inválida.');
  options.runs = Number(options.runs);
  if (!Number.isInteger(options.runs) || options.runs < 1) throw new Error('Número de amostras inválido.');
  if (options.profiles.split(',').some(name => !profiles.some(profile => profile.name === name))) throw new Error('Perfil inválido.');
  if (options.scenarios.split(',').some(name => !['direct', 'navigation'].includes(name))) throw new Error('Cenário inválido.');
  options.baseURL = base.href.endsWith('/') ? base.href : `${base.href}/`;
  options.output = resolve(options.output || `.auditoria-local/${options.phase}`);
  return options;
}

export function observeMetrics() {
  const supported = PerformanceObserver.supportedEntryTypes || [];
  window.siteLab = { supported, lcp: null, cls: supported.includes('layout-shift') ? 0 : null, longTasks: supported.includes('longtask') ? [] : null, events: supported.includes('event') ? [] : null, reveal: null };
  const observe = (type, callback, extra = {}) => {
    if (supported.includes(type)) new PerformanceObserver(callback).observe({ type, buffered: true, ...extra });
  };
  let firstShift = 0, lastShift = 0, sessionScore = 0;
  observe('largest-contentful-paint', list => {
    for (const entry of list.getEntries()) {
      const element = entry.element;
      window.siteLab.lcp = { milliseconds: entry.startTime, element: element ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}` : null, url: entry.url || null };
    }
  });
  observe('layout-shift', list => {
    for (const entry of list.getEntries()) {
      if (entry.hadRecentInput) continue;
      if (entry.startTime - lastShift > 1000 || entry.startTime - firstShift > 5000) { firstShift = entry.startTime; sessionScore = 0; }
      lastShift = entry.startTime; sessionScore += entry.value;
      window.siteLab.cls = Math.max(window.siteLab.cls, sessionScore);
    }
  });
  observe('longtask', list => {
    window.siteLab.longTasks.push(...list.getEntries().map(entry => ({ start: entry.startTime, duration: entry.duration })));
  });
  observe('event', list => {
    window.siteLab.events.push(...list.getEntries().filter(entry => entry.interactionId).map(entry => ({ name: entry.name, duration: entry.duration })));
  }, { durationThreshold: 16 });
  document.addEventListener('click', event => {
    if (event.target.closest('a')) sessionStorage.setItem('lab-click', String(performance.timeOrigin + performance.now()));
  }, { capture: true });
  window.addEventListener('pagereveal', async event => {
    window.siteLab.reveal = { start: performance.now(), active: Boolean(event.viewTransition) };
    if (event.viewTransition) {
      try { await event.viewTransition.finished; } catch { /* Navegador pode cancelar a transição. */ }
      window.siteLab.reveal.finished = performance.now();
    }
  });
}

async function snapshot(page, requests, hasCDP, browserRequests) {
  const timing = await page.evaluate(() => ({
    ...structuredClone(window.siteLab),
    navigation: performance.getEntriesByType('navigation')[0]?.toJSON(),
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
    userAgent: navigator.userAgent,
    resourceTimingBytes: [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')].reduce((sum, entry) => sum + entry.transferSize, 0),
    resources: performance.getEntriesByType('resource').map(entry => ({ ...entry.toJSON(), path: new URL(entry.name).pathname })),
    overflow: document.documentElement.scrollWidth > innerWidth,
    cookiesPresent: Boolean(document.cookie), localStorageKeys: Object.keys(localStorage), sessionStorageKeys: Object.keys(sessionStorage),
  }));
  return { ...timing, requests: hasCDP ? [...requests.values()].reduce((sum, request) => sum + 1 + (request.redirectCount || 0), 0) : browserRequests.size, cdpEncodedBytes: hasCDP ? [...requests.values()].reduce((sum, request) => sum + (request.bytes || 0) + (request.redirectBytes || 0), 0) : null };
}

async function usable(page) {
  await page.locator('h1').waitFor({ state: 'visible' });
  return page.evaluate(async () => {
    await document.activeViewTransition?.finished.catch(() => {});
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const click = Number(sessionStorage.getItem('lab-click'));
    return { at: performance.now(), clickToUsable: click ? performance.timeOrigin + performance.now() - click : null };
  });
}

async function follow(page, route, profile) {
  const names = { 'index.html': 'Início', 'queimadas.html': 'Queimadas', 'dados.html': 'Dados', 'prevencao.html': 'Prevenção', 'sobre.html': 'Sobre o projeto', 'fontes.html': 'Fontes e créditos' };
  const group = ['sobre.html', 'fontes.html'].includes(route) ? 'footer' : '.site-nav';
  const link = page.locator(group).getByRole('link', { name: names[route], exact: true });
  if (group === '.site-nav' && !await link.isVisible()) {
    await page.locator('#inicio').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Abrir menu', exact: true }).tap();
  }
  await link.scrollIntoViewIfNeeded();
  const previous = page.url();
  await Promise.all([page.waitForURL(url => url.href !== previous), profile.mobile ? link.tap() : link.click()]);
  return usable(page);
}

export async function measureSite(options) {
  await mkdir(resolve(options.output, 'capturas'), { recursive: true });
  const report = { date: new Date().toISOString(), tool: 'Playwright/Resource Timing/CDP quando disponível', node: process.version, ...options, profiles, fieldINP: 'não medido', limitations: ['Sem hardware físico; WebKit Windows não é Safari iOS.', 'CPU/rede limitadas apenas em android-4g/CDP.', 'Cache frio HTTP em contexto novo; DNS/TLS/SO/edge podem permanecer aquecidos.'], samples: [] };
  for (const profile of profiles.filter(profile => options.profiles.split(',').includes(profile.name))) {
    const browser = await ({ chromium, webkit })[profile.engine].launch();
    try {
      for (const scenario of options.scenarios.split(',')) for (const cache of ['cold', 'warm']) for (let run = 1; run <= options.runs; run++) {
        const groups = scenario === 'direct' ? pages.map(route => [route]) : [[...pages, 'index.html']];
        for (const visits of groups) {
          const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, deviceScaleFactor: profile.dpr, isMobile: profile.mobile, hasTouch: profile.mobile, reducedMotion: 'no-preference' });
          try {
            const page = await context.newPage();
            const errors = [], requests = new Map(), browserRequests = new Set(), http = [], cdpResponses = [];
            page.on('request', request => browserRequests.add(request));
            page.on('pageerror', error => errors.push({ type: 'pageerror', message: error.message }));
            page.on('console', message => { if (message.type() === 'error') errors.push({ type: 'console', message: message.text() }); });
            page.on('requestfailed', request => errors.push({ type: 'network', url: request.url(), message: request.failure()?.errorText }));
            page.on('response', response => http.push({ url: response.url(), status: response.status(), headers: response.headers(), resource: response.request().resourceType(), timing: response.request().timing(), redirectedFrom: response.request().redirectedFrom()?.url() || null }));
            await page.addInitScript(observeMetrics);
            if (profile.engine === 'chromium') {
              const cdp = await context.newCDPSession(page);
              await cdp.send('Network.enable');
              await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
              if (profile.latency) await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: profile.latency, downloadThroughput: profile.download, uploadThroughput: profile.upload });
              cdp.on('Network.requestWillBeSent', event => {
                const previous = requests.get(event.requestId);
                requests.set(event.requestId, { path: new URL(event.request.url).pathname, redirectCount: (previous?.redirectCount || 0) + (event.redirectResponse ? 1 : 0), redirectBytes: (previous?.redirectBytes || 0) + (event.redirectResponse?.encodedDataLength || 0) });
              });
              cdp.on('Network.responseReceived', event => { const request = requests.get(event.requestId); if (request) Object.assign(request, { status: event.response.status, cache: event.response.fromDiskCache || false }); });
              cdp.on('Network.responseReceivedExtraInfo', event => cdpResponses.push({ status: event.statusCode, headers: event.headers }));
              cdp.on('Network.loadingFinished', event => { const request = requests.get(event.requestId); if (request) request.bytes = event.encodedDataLength; });
            }
            const canonical = route => route === 'index.html' ? '' : route.slice(0, -5);
            if (cache === 'warm') for (const route of visits) {
              await page.goto(new URL(canonical(route), options.baseURL).href, { waitUntil: 'load' });
              await page.locator('footer img').evaluate(async image => { image.loading = 'eager'; await image.decode(); });
            }
            for (const [index, route] of visits.entries()) {
              requests.clear(); browserRequests.clear(); http.length = 0; errors.length = 0; cdpResponses.length = 0;
              let control;
              if (scenario === 'navigation' && index > 0) control = await follow(page, route, profile);
              else {
                await page.goto(new URL(canonical(route), options.baseURL).href, { waitUntil: 'load' });
                await page.evaluate(() => sessionStorage.removeItem('lab-click'));
                control = await usable(page);
              }
              await page.waitForTimeout(250);
              const initial = await snapshot(page, requests, profile.engine === 'chromium', browserRequests);
              const capture = `${profile.name}-${cache}-${route.replace('.html', '')}`;
              if (run === 1 && scenario === 'direct') await page.screenshot({ path: resolve(options.output, 'capturas', `${capture}-inicial.png`), scale: 'css' });
              let interaction = null;
              if (route === 'dados.html') {
                const acre = page.getByRole('button', { name: 'Acre', exact: true });
                await acre.scrollIntoViewIfNeeded();
                if (profile.mobile) await acre.tap(); else await acre.click();
                interaction = await page.locator('[data-uf="AC"]').getAttribute('aria-pressed');
              }
              await page.locator('footer').scrollIntoViewIfNeeded();
              await page.locator('footer img').evaluate(image => image.decode());
              const afterScroll = await snapshot(page, requests, profile.engine === 'chromium', browserRequests);
              if (run === 1 && scenario === 'direct') await page.locator('footer').screenshot({ path: resolve(options.output, 'capturas', `${capture}-rodape.png`), scale: 'css' });
              report.samples.push({ profile: profile.name, browser: browser.version(), scenario, cache, route, run, initial, afterScroll, control, interaction, http: [...http], cdpResponses: [...cdpResponses], errors: [...errors] });
            }
            if (scenario === 'navigation') { await page.goBack(); await usable(page); await page.goForward(); await usable(page); }
          } finally { await context.close(); }
        }
        await writeFile(resolve(options.output, 'medicoes.json'), `${JSON.stringify(report, null, 2)}\n`);
        console.log(`${options.phase} ${profile.name} ${scenario} ${cache} ${run}/${options.runs}`);
      }
    } finally { await browser.close(); }
  }
  return report;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try { await measureSite(measurementOptions(process.argv.slice(2))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
