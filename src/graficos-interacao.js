// Melhoria progressiva: os dados continuam legíveis sem este módulo.
const charts = [...document.querySelectorAll('.biome-chart, .state-comparison, .focus-chart')];
const help = document.createElement('p');
help.id = 'chart-instructions';
help.className = 'visually-hidden';
help.textContent = 'Use as setas para percorrer os resultados, Home e End para ir ao primeiro e ao último. Enter ou Espaço fixa ou remove a seleção; Escape limpa. Tab segue para o próximo conteúdo. O mouse destaca temporariamente outro resultado; ao sair dos dados, a seleção fixada reaparece.';
const status = document.createElement('p');
status.id = 'chart-status';
status.className = 'visually-hidden';
status.setAttribute('role', 'status');
status.setAttribute('aria-label', 'Exploração dos gráficos');
status.setAttribute('aria-live', 'polite');
document.querySelector('main').append(help, status);
const resets = new Map();

function description(chart, row) {
  const values = [...row.querySelectorAll('strong')].map(value => value.textContent);
  if (chart.dataset.series === 'cumulative') return `Até ${row.querySelector('.cumulative-month').textContent}: ${values[0]} focos em 2026. Média histórica dos mesmos meses: ${values[1]} focos.`;
  const label = row.querySelector('.focus-chart__label > span, .biome-chart__label > span, p > span').innerText;
  return `${label}. ${values[0]} ${chart.classList.contains('focus-chart') ? 'focos detectados' : 'hectares'}.`;
}

for (const chart of charts) {
  const rows = [...chart.querySelector('.chart-results').children];
  const plane = chart.querySelector('.chart-plane');
  const guide = document.createElement('span');
  guide.className = 'chart-guide'; guide.hidden = true;
  guide.setAttribute('aria-hidden', 'true');
  if (plane) plane.append(guide);
  chart.tabIndex = 0;
  chart.classList.add('chart-interactive');
  chart.setAttribute('aria-roledescription', 'gráfico interativo');
  chart.setAttribute('aria-describedby', help.id);
  let active = null, pinned = null;
  let input = null, pointerType = 'mouse';

  function clear() {
    pinned = null; input = null;
    select(null);
  }
  resets.set(chart, clear);

  function select(index, announce = false) {
    active = index;
    rows.forEach((row, i) => row.toggleAttribute('data-chart-active', i === index));
    const grid = chart.querySelector('.chart-results');
    const line = index !== null && chart.dataset.chartMode === 'line';
    guide.hidden = !line;
    if (line) {
      const bounds = grid.getBoundingClientRect(), parent = plane.getBoundingClientRect();
      guide.style.left = `${bounds.left - parent.left + (index + .5) / rows.length * bounds.width}px`;
      guide.style.top = `${bounds.top - parent.top}px`;
      guide.style.height = `${bounds.height}px`;
    }
    if (announce && index !== null) status.textContent = description(chart, rows[index]);
  }

  function indexAt(event) {
    if (event.target.closest('a, figcaption, .data-source, .series-end, .chart-axis')) return null;
    const grid = chart.querySelector('.chart-results');
    const columns = getComputedStyle(grid).display === 'grid';
    const row = event.target.closest('.chart-results > li');
    // Rótulos podem sair da faixa de sua categoria: o alvo real tem prioridade.
    const result = event.target.closest('strong, .chart-dot, .focus-chart__label > span, .cumulative-month, .bar');
    if (row && rows.includes(row) && (!columns || result)) return rows.indexOf(row);
    if (!plane || !columns || !plane.contains(event.target)) return null;
    const bounds = grid.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) return null;
    return Math.max(0, Math.min(rows.length - 1, Math.floor((event.clientX - bounds.left) / bounds.width * rows.length)));
  }

  chart.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    input = 'mouse';
    const index = indexAt(event) ?? pinned;
    if (index !== active) select(index);
  });
  chart.addEventListener('pointerleave', () => {
    if (input === 'mouse') select(pinned);
  });
  chart.addEventListener('pointerdown', event => {
    pointerType = event.pointerType;
  });
  chart.addEventListener('click', event => {
    const index = indexAt(event);
    if (index === null) return;
    input = event.pointerType || pointerType;
    pinned = pinned === index ? null : index;
    select(input === 'mouse' ? index : pinned);
  });
  chart.addEventListener('focus', () => {
    if (active === null && chart.matches(':focus-visible')) { input = 'keyboard'; select(0); }
  });
  chart.addEventListener('blur', () => { clear(); status.textContent = ''; });
  chart.addEventListener('keydown', event => {
    if (event.target !== chart || event.altKey || event.ctrlKey || event.metaKey) return;
    const current = active ?? 0;
    const positions = { Home: 0, End: rows.length - 1, ArrowRight: Math.min(rows.length - 1, current + 1), ArrowDown: Math.min(rows.length - 1, current + 1), ArrowLeft: Math.max(0, current - 1), ArrowUp: Math.max(0, current - 1) };
    if (event.key === 'Escape') { event.preventDefault(); clear(); status.textContent = 'Destaque removido.'; }
    else if (event.key in positions) {
      event.preventDefault(); input = 'keyboard'; select(positions[event.key], true);
      rows[positions[event.key]].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (pinned === active && pinned !== null) { clear(); status.textContent = 'Seleção removida.'; }
      else { input = 'keyboard'; pinned = current; select(current, true); }
    }
  });
  chart.addEventListener('chartdatachange', clear);
  chart.addEventListener('chartlayoutchange', clear);
}

document.addEventListener('pointerdown', event => {
  for (const [chart, clear] of resets) if (!chart.contains(event.target)) clear();
});
function resetCharts() { for (const clear of resets.values()) clear(); status.textContent = ''; }
document.addEventListener('chartselectionchange', resetCharts);
window.addEventListener('resize', resetCharts);
document.fonts.ready.then(resetCharts);
