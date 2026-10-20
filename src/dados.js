import { hasCompleteFocusData, formatFocusCount, formatFocusPeak, formatPeriod, updateFocusView } from './focos.js';
import { formatChartValue, updateChartGeometry, observeChartLabels } from './graficos.js';

// Uma fonte indisponível não pode bloquear os indicadores da outra.
const [areaModule, focusModule, selectModule] = await Promise.all([
  import('./dados-base.js').catch(() => ({})),
  import('./focos-base.js').catch(() => ({})),
  import('./seletor-estados.js').catch(() => ({})),
]);
const { focusData = {}, focusMetadata } = focusModule;
const { states = {}, metadata: areaMetadata } = areaModule;

const select = document.querySelector('#state-select');
const map = document.querySelector('.brazil-map');
const territories = [...map.querySelectorAll('[data-uf]')];
const selectionOutline = map.querySelector('[data-map-outline="selection"]');
const focusOutline = map.querySelector('[data-map-outline="focus"]');
const results = document.querySelector('#state-results');
const comparison = document.querySelector('#state-comparison');
const unavailable = document.querySelector('#state-unavailable');
const status = document.querySelector('#state-status');
const focusSection = document.querySelector('#state-focus');
const focusContent = document.querySelector('#state-focus-data');
const focusUnavailable = document.querySelector('#state-focus-unavailable');
const format = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const validArea = value => Number.isFinite(value) && value >= 0;
observeChartLabels();
let syncControl = () => {};

function setMapOutline(outline, territory) {
  if (outline) outline.setAttribute('d', territory?.getAttribute('d') || '');
}

function updateMapFocus() {
  setMapOutline(focusOutline, map.querySelector('[data-uf]:focus-visible'));
}

function selectState(uf) {
  document.dispatchEvent(new Event('chartselectionchange'));
  const state = states[uf];
  select.value = uf;
  syncControl(uf);
  for (const territory of territories) {
    territory.setAttribute('aria-pressed', String(territory.dataset.uf === uf));
  }
  setMapOutline(selectionOutline, territories.find(territory => territory.dataset.uf === uf));
  results.hidden = !uf;
  focusSection.hidden = !uf;
  const matchingPeriod = areaMetadata?.period?.start === comparison.dataset.periodStart
    && areaMetadata?.period?.end === comparison.dataset.periodEnd
    && areaMetadata?.referencePeriods?.length === 6
    && areaMetadata.referencePeriods.every((period, index) => period.start === `${2019 + index}-01` && period.end === `${2019 + index}-12`);
  const available = matchingPeriod && state && validArea(state.areaLast12Months) && validArea(state.referenceAverage);
  comparison.hidden = !available;
  unavailable.hidden = !uf || available;
  if (!uf) {
    status.textContent = 'Selecione uma unidade federativa.';
    return;
  }
  const name = state?.name || select.selectedOptions[0].textContent;
  document.querySelector('#state-name').textContent = name;
  let areaAnnouncement = 'Área queimada: Dados não disponíveis para esta consulta.';
  if (available) {
    const area = `${format.format(state.areaLast12Months)} ha`;
    const average = `${format.format(state.referenceAverage)} ha`;
    document.querySelector('#comparison-area').textContent = formatChartValue(Math.round(state.areaLast12Months));
    document.querySelector('#comparison-average').textContent = formatChartValue(Math.round(state.referenceAverage));
    updateChartGeometry(comparison, [state.areaLast12Months, state.referenceAverage]);
    areaAnnouncement = `Área queimada acumulada em ${formatPeriod(areaMetadata.period).toLowerCase()}: ${area}. Média anual de 2019–2024: ${average}.`;
  }
  const focusRecord = focusData[uf];
  const focusAvailable = hasCompleteFocusData(focusRecord, focusMetadata);
  focusContent.hidden = !focusAvailable;
  focusUnavailable.hidden = focusAvailable;
  if (focusAvailable) updateFocusView(focusContent, focusRecord, name);
  status.textContent = `${name}. ${areaAnnouncement} ${focusAvailable
    ? `Focos de fogo ativo em ${formatPeriod(focusMetadata.recentPeriod).toLowerCase()}: ${formatFocusCount(focusRecord.monthly.reduce((sum, value) => sum + value, 0))}. Maior contagem mensal: ${formatFocusPeak(focusRecord, focusMetadata.months)}. Histórico anual de 2003 a 2025 disponível abaixo.`
    : 'Focos de fogo ativo: Dados não disponíveis para esta consulta.'}`;
}

select.addEventListener('change', () => selectState(select.value));
map.addEventListener('click', event => {
  const territory = event.target.closest('[data-uf]');
  if (territory) selectState(territory.dataset.uf);
});
map.addEventListener('keydown', event => {
  const territory = event.target.closest('[data-uf]');
  if (territory && ['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    selectState(territory.dataset.uf);
  }
  requestAnimationFrame(updateMapFocus);
});
map.addEventListener('focusin', updateMapFocus);
map.addEventListener('focusout', () => setMapOutline(focusOutline, null));
map.addEventListener('pointerdown', () => requestAnimationFrame(updateMapFocus));

for (const territory of territories) {
  territory.setAttribute('role', 'button');
  territory.setAttribute('tabindex', '0');
  territory.setAttribute('aria-pressed', 'false');
}
select.disabled = false;
// O navegador pode restaurar o select após voltar à página; o estado inicial é sempre neutro.
select.value = '';
if (selectModule.enhanceStateSelect) syncControl = selectModule.enhanceStateSelect(select, selectState);
window.addEventListener('pageshow', () => {
  selectState('');
  status.textContent = '';
});
