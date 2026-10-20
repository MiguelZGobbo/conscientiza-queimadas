import { readFileSync, writeFileSync } from 'node:fs';
import { states, metadata as areaMetadata } from '../src/dados-base.js';
import { historicalBiomes as biomes, historicalNationalArea as nationalArea, historicalAreaMetadata } from '../src/area-historica.js';
import { focusData, focusMetadata } from '../src/focos-base.js';
import { formatMonth, formatPeriod, monthRange, hasCompleteFocusData, formatFocusCount, formatFocusPeak, focusPeakIndexes } from '../src/focos.js';
import { chartGeometry, chartAxis, formatChartValue } from '../src/graficos.js';

// Atualiza os blocos de dados; mapa e metodologia permanecem preservados.
const months = focusMetadata.months.map(key => formatMonth(key));
const focusYears = focusMetadata.years.map(String);
const currentPeriod = formatPeriod(focusMetadata.recentPeriod);
const periodText = currentPeriod.toLowerCase();
const periodLabel = periodText.replace('–', ' a ');
// Cada indicador tem metadados próprios; o panorama histórico não usa o recorte estadual.
if (Object.keys(states).length !== 27 || Object.keys(biomes).length !== 6
  || areaMetadata.period?.start !== '2025-10' || areaMetadata.period?.end !== '2026-09'
  || areaMetadata.referencePeriods?.length !== 6
  || !areaMetadata.referencePeriods.every((period, index) => period.start === `${2019 + index}-01` && period.end === `${2019 + index}-12`)
  || Object.values(states).some(state => !state || !Number.isFinite(state.areaLast12Months) || state.areaLast12Months < 0 || !Number.isFinite(state.referenceAverage) || state.referenceAverage < 0)
  || Object.values(biomes).some(value => !Number.isFinite(value) || value < 0)) throw new Error('Dados de área incompletos.');
if (Object.values(biomes).reduce((sum, value) => sum + value, 0) !== nationalArea
  || historicalAreaMetadata.period?.start !== 1985 || historicalAreaMetadata.period?.end !== 2025
  || historicalAreaMetadata.collection !== 5 || historicalAreaMetadata.table !== 3) throw new Error('Panorama histórico incompatível.');
const areaNumber = value => formatChartValue(Math.round(value));
const percent = value => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
const historicalAreaSource = `<p class="data-source">Fonte: <a href="${historicalAreaMetadata.url}">MapBiomas Fogo — RAF2025, Coleção 5, Tabela 3</a> · 1985–2025 · Visualização adaptada · <a href="https://creativecommons.org/licenses/by/4.0/deed.pt-br">CC BY 4.0</a>.</p>`;
const areaSource = `<p class="data-source">Fonte: <a href="${areaMetadata.urls[0]}">MapBiomas — Monitor do Fogo</a> · ${periodText} · Soma das áreas mensais · Visualização adaptada · <a href="https://creativecommons.org/licenses/by/4.0/deed.pt-br">CC BY 4.0</a>.</p>`;
for (const uf of ['BR', ...Object.keys(states)]) {
  if (!hasCompleteFocusData(focusData[uf], focusMetadata)) throw new Error(`Série INPE incompleta: ${uf}`);
}

function fallbackTable(id, title, labels, values) {
  return `<table id="${id}"><caption>${title} — número de focos detectados pelo satélite de referência</caption><thead><tr><th scope="col">${labels.length === 12 ? 'Mês' : 'Ano'}</th><th scope="col">Focos detectados</th></tr></thead><tbody>${labels.map((label, i) => `<tr><th scope="row">${label}</th><td>${formatFocusCount(values[i])}</td></tr>`).join('\n')}</tbody></table>`;
}

function chart(id, title, labels, values, series) {
  const monthly = series === 'monthly';
  const geometry = chartGeometry(values || labels.map(() => 0));
  const peaks = values ? focusPeakIndexes(values) : [];
  return `<figure id="${id}" class="focus-chart" data-series="${series}" data-count="${labels.length}" data-scale-max="${geometry.limit}" aria-labelledby="${id}-title">
  <figcaption id="${id}-title">${title}<span>${monthly ? `Quantidade mensal de focos · ${periodLabel}` : 'Total anual de focos · 2003 a 2025'} · escala iniciada em zero</span></figcaption>
  ${monthly ? `<p data-focus-empty${values && values.every(value => value === 0) ? '' : ' hidden'}>Nenhum foco detectado no período.</p>` : ''}
  <div class="chart-plane">
  <div class="chart-axis" data-chart-axis aria-hidden="true">${chartAxis(geometry)}</div>
  ${!monthly ? `<svg class="chart-line" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false"><polyline points="${geometry.points}"/></svg>` : ''}
  <ul class="chart-results" role="list">
  ${labels.map((label, i) => `<li class="focus-chart__row" style="--share:${geometry.shares[i]}"${!monthly && i === labels.length - 1 ? ' data-current-year' : ''}${monthly && peaks.includes(i) ? ' data-peak' : ''}><div class="focus-chart__label"><span>${label}${monthly ? `<span class="focus-chart__peak" data-peak-index="${i}"${peaks.includes(i) ? '' : ' hidden'}> · maior contagem</span>` : ''}</span><strong data-value-index="${i}">${values ? formatChartValue(values[i]) : ''}</strong></div><div class="bar" aria-hidden="true"><span class="bar__fill bar__fill--focus"></span></div>${!monthly ? '<span class="chart-dot" aria-hidden="true"></span>' : ''}</li>`).join('\n')}
  </ul>
  </div>
  </figure>`;
}

const source = '<p class="data-source">Fonte: <a href="https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/">INPE — Programa Queimadas</a> · Satélite de referência AQUA_M-T · Série anual: 2003–2025; meses recentes até set/2026 · Agregação própria · Acesso em: 19 out. 2026 · <a href="https://data.inpe.br/queimadas/faq/">Referência e condições de uso</a>.</p>';
const explanation = `<p>O histórico reúne anos completos. Para acompanhar 2026, compare o acumulado até cada mês com a média histórica dos mesmos meses, de 2003 a 2025.</p>`;
const brazil = focusData.BR;
function cumulativeChart(record) {
  const current = record.cumulative, reference = record.historicalCumulative;
  if (JSON.stringify(focusMetadata.currentMonths) !== JSON.stringify(monthRange('2026-01', '2026-09'))
    || focusMetadata.historicalReference?.start !== '2003-01' || focusMetadata.historicalReference?.end !== '2025-12'
    || current?.length !== 9 || reference?.length !== 9
    || [...current, ...reference].some(value => !Number.isFinite(value) || value < 0)
    || current.some((value, index) => !Number.isSafeInteger(value) || value !== record.monthly.slice(3, index + 4).reduce((sum, month) => sum + month, 0))
    || reference.some((value, index) => index && value < reference[index - 1])) throw new Error('Acumulados nacionais incompletos.');
  const geometry = chartGeometry([...current, ...reference]);
  const points = values => values.map((value, index) => `${(index + .5) / values.length * 1000},${1000 - value / geometry.limit * 1000}`).join(' ');
  const mean = value => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  return `<figure id="national-focus-cumulative" class="focus-chart cumulative-chart" data-series="cumulative" data-scale-max="${geometry.limit}" aria-labelledby="national-focus-cumulative-title">
  <figcaption id="national-focus-cumulative-title">Como os focos se acumulam em 2026?<span>Focos acumulados de janeiro até cada mês · escala iniciada em zero</span><span>Média histórica: mesmos meses de 2003 a 2025</span></figcaption>
  <div class="chart-plane"><div class="chart-axis" aria-hidden="true">${chartAxis(geometry)}</div>
  <svg class="chart-line" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false"><polyline class="cumulative-current" points="${points(current)}"/><polyline class="cumulative-reference" points="${points(reference)}"/></svg>
  <ul class="chart-results" role="list">${focusMetadata.currentMonths.map((month, index) => `<li class="cumulative-row" style="--current:${current[index] / geometry.limit * 100};--reference:${reference[index] / geometry.limit * 100}">
  <span class="cumulative-month">${formatMonth(month, false, false)}</span>
  <div class="cumulative-value cumulative-value--current"><span class="cumulative-value__name">2026: </span><strong>${formatChartValue(current[index])}</strong><div class="bar" aria-hidden="true"><span class="bar__fill"></span></div><span class="chart-dot" aria-hidden="true"></span></div>
  <div class="cumulative-value cumulative-value--reference"><span class="cumulative-value__name">Média histórica: </span><strong>${mean(reference[index])}</strong><div class="bar" aria-hidden="true"><span class="bar__fill"></span></div><span class="chart-dot" aria-hidden="true"></span></div></li>`).join('\n')}</ul>
  <span class="series-end series-end--current" style="--end-share:${current.at(-1) / geometry.limit * 100}">2026</span>
  <span class="series-end series-end--reference" style="--end-share:${reference.at(-1) / geometry.limit * 100}">Média histórica</span></div>
  <p class="data-source">Os valores de 2026 representam detecções disponíveis e não são uma previsão. Não há registros AQUA_M-T em 3 de maio, 10 e 22 de julho nos arquivos oficiais de 2026.</p>
  </figure>`;
}
const national = `<div class="national-focus">
  <div class="chart-intro"><h3>Além da área: os focos de fogo ativo</h3>
  ${explanation}</div>
  ${chart('national-focus-annual', 'Histórico anual de focos no Brasil', focusYears, brazil.annual, 'annual')}
  ${cumulativeChart(brazil)}
  ${source}
</div>`;

const state = `<div id="state-focus" class="state-focus" hidden>
  <h3>Focos de fogo ativo</h3>
  <p id="state-focus-unavailable" hidden>Dados não disponíveis para esta consulta.</p>
  <div id="state-focus-data">
    ${chart('state-focus-monthly', 'Focos detectados por mês: <span class="focus-place" data-focus-place></span>', months, null, 'monthly')}
    ${chart('state-focus-annual', 'Histórico anual de focos: <span class="focus-place" data-focus-place></span>', focusYears, null, 'annual')}
    ${source}
  </div>
</div>`;

const orderedStates = Object.entries(states).sort(([, a], [, b]) => a.name.localeCompare(b.name, 'pt-BR'));
const fallback = `<div class="states-fallback focus-fallback">
<table id="focus-states-fallback"><caption>Focos de fogo ativo por unidade federativa ${periodText} — INPE, satélite de referência</caption><thead><tr><th scope="col">Unidade federativa</th><th scope="col">Total de focos</th><th scope="col">Mês ou meses com mais focos</th></tr></thead><tbody>${orderedStates.map(([uf, state]) => `<tr><th scope="row">${state.name}</th><td><span class="fallback-label">Focos em ${periodText}</span>${formatFocusCount(focusData[uf].monthly.reduce((sum, value) => sum + value, 0))}</td><td><span class="fallback-label">Maior contagem mensal</span>${formatFocusPeak(focusData[uf], focusMetadata.months)}</td></tr>`).join('\n')}</tbody></table>
${orderedStates.map(([uf, state]) => `<details class="data-table-disclosure"><summary>${state.name} — distribuição e evolução dos focos</summary>${fallbackTable(`fallback-${uf}-monthly`, `${state.name}: distribuição mensal ${periodText}`, months, focusData[uf].monthly)}${fallbackTable(`fallback-${uf}-annual`, `${state.name}: histórico anual de 2003–2025`, focusYears, focusData[uf].annual)}</details>`).join('\n')}
${source}
</div>`;

const file = new URL('../dados.html', import.meta.url);
let html = readFileSync(file, 'utf8');
html = html.replace(/(<meta name="description" content=")[^"]*/, '$1Panorama histórico das queimadas no Brasil, acompanhamento dos focos em 2026 e consulta estadual dos últimos 12 meses.');
for (const [marker, content] of [['NACIONAL', national], ['ESTADO', state], ['ALTERNATIVA', fallback]]) {
  const pattern = new RegExp(`<!-- FOCOS-${marker}:INICIO -->[\\s\\S]*?<!-- FOCOS-${marker}:FIM -->`);
  if (!pattern.test(html)) throw new Error(`Marcador ausente: ${marker}`);
  html = html.replace(pattern, `<!-- FOCOS-${marker}:INICIO -->\n${content}\n<!-- FOCOS-${marker}:FIM -->`);
}
const biomeValues = Object.values(biomes);
const biomeGeometry = chartGeometry(biomeValues);
const biome = `<figure class="biome-chart" data-scale-max="${biomeGeometry.limit}" aria-labelledby="biome-chart-title">
  <figcaption id="biome-chart-title">Território atingido pelo fogo por bioma<span>Hectares (ha) · 1985 a 2025 · cada local contado uma única vez · escala iniciada em zero</span></figcaption>
  <div class="biome-chart__scale bar-axis" aria-hidden="true">${chartAxis(biomeGeometry)}</div>
  <ul class="chart-results" role="list">${Object.entries(biomes).map(([name, value], index) => `<li class="biome-chart__row" style="--share:${biomeGeometry.shares[index]}"><div class="biome-chart__label"><span>${name}</span><strong>${areaNumber(value)}</strong></div><div class="bar" aria-hidden="true"><span class="bar__fill"></span></div></li>`).join('\n')}</ul>
  ${historicalAreaSource}
</figure>`;
html = html.replace(/<figure class="biome-chart"[\s\S]*?<\/figure>/, biome);
const panorama = `<h3>O alcance das queimadas no Brasil</h3>
<p>Entre 1985 e 2025, <strong>${areaNumber(nationalArea)} hectares do território brasileiro foram atingidos pelo fogo ao menos uma vez</strong>, segundo o MapBiomas Fogo. Isso corresponde a aproximadamente 24% do país. Cada local é contado uma única vez, mesmo quando queimou em vários anos.</p>
<h3>Onde o fogo se concentrou nesse período?</h3>
<p>O <strong>Cerrado concentrou ${percent(biomes.Cerrado / nationalArea * 100)}%</strong> desse território e a <strong>Amazônia, ${percent(biomes['Amazônia'] / nationalArea * 100)}%</strong>. Juntos, responderam por ${percent((biomes.Cerrado + biomes['Amazônia']) / nationalArea * 100)}% da área atingida no período.</p>`;
html = html.replace(/<!-- AREA-PANORAMA:INICIO -->[\s\S]*?<!-- AREA-PANORAMA:FIM -->/, `<!-- AREA-PANORAMA:INICIO -->\n${panorama}\n<!-- AREA-PANORAMA:FIM -->`);
html = html.replace(/<figure id="state-comparison"[\s\S]*?<\/figure>/, `<figure id="state-comparison" class="state-comparison" data-period-start="${areaMetadata.period.start}" data-period-end="${areaMetadata.period.end}" aria-labelledby="state-comparison-title" hidden>
  <figcaption id="state-comparison-title">Área queimada: últimos 12 meses e média anual<span>Hectares (ha) · soma das áreas mensais · referência: anos completos de 2019 a 2024 · escala iniciada em zero</span></figcaption>
  <div class="bar-axis" data-chart-axis aria-hidden="true"></div>
  <ul class="chart-results" role="list"><li class="comparison-row"><p><span>Últimos 12 meses — ${periodText}</span><strong id="comparison-area"></strong></p><div class="bar" aria-hidden="true"><span class="bar__fill"></span></div></li>
  <li class="comparison-row"><p><span>Média anual — 2019–2024</span><strong id="comparison-average"></strong></p><div class="bar" aria-hidden="true"><span class="bar__fill bar__fill--historical"></span></div></li></ul>
</figure>`);
html = html.replace(/(<div class="[^"]*\bstate-explanation\b[^"]*">)[\s\S]*?(<\/div>)/, `$1\n${areaSource}\n$2`);
const areaFallback = `<table id="states-fallback"><caption>Área queimada acumulada em ${periodText} e média anual de 2019–2024 (anos completos de janeiro a dezembro)</caption><thead><tr><th scope="col">Unidade federativa</th><th scope="col">Últimos 12 meses (ha)</th><th scope="col">Média anual (ha)</th></tr></thead><tbody>${orderedStates.map(([, state]) => `<tr><th scope="row">${state.name}</th><td><span class="fallback-label">Últimos 12 meses</span>${areaNumber(state.areaLast12Months)} ha</td><td><span class="fallback-label">Média anual — 2019–2024</span>${areaNumber(state.referenceAverage)} ha</td></tr>`).join('\n')}</tbody></table>`;
html = html.replace(/<table id="states-fallback">[\s\S]*?<\/table>/, areaFallback);
writeFileSync(file, html.replace(/^[ \t]+$/gm, ''));
console.log('Painéis gerados: panorama 1985–2025, focos 2003–2025, acompanhamento de 2026 e consulta estadual recente.');
