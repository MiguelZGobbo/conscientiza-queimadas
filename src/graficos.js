const number = new Intl.NumberFormat('pt-BR');
export const formatChartValue = value => number.format(value);

// Escala linear iniciada em zero, com limites inteiros e intervalos legíveis.
export function chartGeometry(values) {
  if (values.some(value => !Number.isFinite(value) || value < 0)) throw new TypeError('Valores inválidos para o gráfico.');
  const maximum = Math.max(0, ...values);
  const magnitude = maximum ? 10 ** Math.floor(Math.log10(maximum / 4)) : 1;
  const step = maximum ? Math.max(1, [1, 2, 2.5, 5, 10].find(value => value * magnitude >= maximum / 4) * magnitude) : 1;
  const limit = maximum ? Math.ceil(maximum / step) * step : 1;
  const shares = values.map(value => value / limit * 100);
  const ticks = Array.from({ length: Math.round(limit / step) + 1 }, (_, index) => index * step);
  const points = shares.map((share, index) => `${((index + .5) / values.length * 1000).toFixed(4)},${((100 - share) * 10).toFixed(4)}`).join(' ');
  return { limit, shares, ticks, points };
}

export function chartAxis(geometry) {
  return geometry.ticks.map(value => `<span class="chart-tick" style="--tick:${value / geometry.limit * 100}"><span>${formatChartValue(value)}</span></span>`).join('');
}

export function updateChartGeometry(chart, values) {
  const geometry = chartGeometry(values);
  chart.dataset.scaleMax = geometry.limit;
  chart.querySelector('[data-chart-axis]').innerHTML = chartAxis(geometry);
  for (const [index, row] of [...chart.querySelector('.chart-results').children].entries()) {
    row.style.setProperty('--share', geometry.shares[index]);
  }
  const line = chart.querySelector('.chart-line polyline');
  if (line) line.setAttribute('points', geometry.points);
  layoutChartLabels(chart);
  chart.dispatchEvent(new Event('chartdatachange'));
}

const overlaps = (a, b, gap = 3) => a.left < b.right + gap && b.left < a.right + gap && a.top < b.bottom + gap && b.top < a.bottom + gap;

function crossesSegment(rect, a, b, gap = 3) {
  let start = 0, end = 1;
  for (const [coordinate, low, high] of [['x', rect.left - gap, rect.right + gap], ['y', rect.top - gap, rect.bottom + gap]]) {
    const delta = b[coordinate] - a[coordinate];
    if (!delta) { if (a[coordinate] < low || a[coordinate] > high) return false; }
    else {
      const limits = [(low - a[coordinate]) / delta, (high - a[coordinate]) / delta].sort((x, y) => x - y);
      start = Math.max(start, limits[0]); end = Math.min(end, limits[1]);
      if (start > end) return false;
    }
  }
  return true;
}

function findPlacements(items) {
  const ordered = [...items].sort((a, b) => a.options.length - b.options.length);
  const placed = [];
  let attempts = 0;
  function choose(index) {
    if (index === ordered.length) return true;
    if (++attempts > 5000) return false;
    const item = ordered[index];
    for (const option of item.options) {
      if (placed.some(other => overlaps(option, other.option))) continue;
      placed.push({ item, option });
      if (choose(index + 1)) return true;
      placed.pop();
    }
    return false;
  }
  return choose(0) ? placed : null;
}

function finishLayout(chart, mode) {
  chart.dataset.chartMode = mode;
  chart.dispatchEvent(new Event('chartlayoutchange'));
}

// Busca apenas posições próximas e considera também a geometria efetiva das linhas.
export function layoutChartLabels(chart) {
  if (!chart.querySelector('.chart-line') || !chart.getClientRects().length) return;
  const wide = chart.clientWidth >= 48 * parseFloat(getComputedStyle(document.documentElement).fontSize);
  chart.classList.toggle('line-ready', wide);
  const values = [...chart.querySelectorAll('.focus-chart__label > strong, .cumulative-value > strong')];
  for (const value of values) { value.style.removeProperty('--label-offset'); value.style.removeProperty('--label-shift'); }
  if (!wide) { finishLayout(chart, 'bars'); return; }
  const endNames = [...chart.querySelectorAll('.series-end')].map(name => name.getBoundingClientRect());
  if (endNames.some((rect, index) => endNames.slice(index + 1).some(other => overlaps(rect, other)))) {
    chart.classList.remove('line-ready'); finishLayout(chart, 'bars'); return;
  }
  const lines = [...chart.querySelectorAll('polyline')].map(line => [...line.points].map(point => new DOMPoint(point.x, point.y).matrixTransform(line.getScreenCTM())));
  const segments = lines.flatMap(points => points.slice(1).map((point, index) => [points[index], point]));
  // Reserve também os 2 px máximos do realce, sem reposicionar ao interagir.
  const dots = [...chart.querySelectorAll('.chart-dot')].map(dot => {
    const rect = dot.getBoundingClientRect();
    return { left: rect.left - 2, right: rect.right + 2, top: rect.top - 2, bottom: rect.bottom + 2 };
  });
  const obstacles = [...chart.querySelectorAll('.chart-tick > span, .focus-chart__label > span, .cumulative-month, .series-end')].map(element => element.getBoundingClientRect()).filter(rect => rect.width && rect.height);
  const bounds = chart.getBoundingClientRect(), title = chart.querySelector('figcaption').getBoundingClientRect();
  const rows = [...chart.querySelector('.chart-results').children];
  const items = values.map(value => {
    const index = rows.indexOf(value.closest('li'));
    const series = value.closest('.cumulative-value--reference') ? 1 : 0;
    const anchor = lines[series][index];
    const dot = (value.closest('.cumulative-value') || value.closest('li')).querySelector('.chart-dot').getBoundingClientRect();
    const size = value.getBoundingClientRect(), radius = dot.width / 2;
    const options = [];
    for (const gap of [8, 12, 16]) for (const shift of [0, -8, 8, -16, 16]) for (const above of [true, false]) {
      const offset = above ? radius + gap : -radius - gap - size.height;
      const left = anchor.x + shift - size.width / 2, top = anchor.y - offset - size.height;
      const rect = { left, top, right: left + size.width, bottom: top + size.height, shift, offset };
      if (left < bounds.left || rect.right > bounds.right || top < title.bottom + 6 || rect.bottom > bounds.bottom) continue;
      if (obstacles.some(other => overlaps(rect, other)) || dots.some(other => overlaps(rect, other))) continue;
      if (segments.some(([a, b]) => crossesSegment(rect, a, b))) continue;
      options.push(rect);
    }
    return { value, options };
  });
  const placements = findPlacements(items);
  if (!placements) { chart.classList.remove('line-ready'); finishLayout(chart, 'bars'); return; }
  for (const { item, option } of placements) {
    item.value.style.setProperty('--label-shift', `${option.shift}px`);
    item.value.style.setProperty('--label-offset', `${option.offset}px`);
  }
  finishLayout(chart, 'line');
}

export function observeChartLabels(root = document) {
  const charts = [...root.querySelectorAll('[data-series="annual"], [data-series="cumulative"]')];
  if (!('ResizeObserver' in globalThis)) return;
  const widths = new WeakMap();
  const observer = new ResizeObserver(entries => entries.forEach(({ target, contentRect }) => {
    if (widths.get(target) === contentRect.width) return;
    widths.set(target, contentRect.width); layoutChartLabels(target);
  }));
  for (const chart of charts) observer.observe(chart);
  document.fonts.ready.then(() => charts.forEach(layoutChartLabels));
  window.addEventListener('resize', () => charts.forEach(layoutChartLabels));
}
