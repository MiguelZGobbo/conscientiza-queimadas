import { formatChartValue, updateChartGeometry } from './graficos.js';

const number = new Intl.NumberFormat('pt-BR');
const validCount = value => Number.isSafeInteger(value) && value >= 0;

export function monthRange(start, end) {
  const [year, month] = start.split('-').map(Number);
  const [lastYear, lastMonth] = end.split('-').map(Number);
  const count = (lastYear - year) * 12 + lastMonth - month + 1;
  return Array.from({ length: Math.max(0, count) }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 + index));
    return date.toISOString().slice(0, 7);
  });
}

export function formatMonth(key, full = false, includeYear = true) {
  const [year, month] = key.split('-').map(Number);
  const name = new Intl.DateTimeFormat('pt-BR', { month: full ? 'long' : 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1))).replace('.', '');
  return `${name[0].toUpperCase()}${name.slice(1)}${includeYear ? `/${year}` : ''}`;
}

export const formatPeriod = period => `${formatMonth(period.start)}–${formatMonth(period.end).toLowerCase()}`;

export function hasCompleteFocusData(record, metadata) {
  const months = metadata?.months;
  const years = metadata?.years;
  if (!Array.isArray(months) || months.length !== 12 || !months.every(key => /^\d{4}-(0[1-9]|1[0-2])$/.test(key))
    || JSON.stringify(monthRange(months[0], months.at(-1))) !== JSON.stringify(months)
    || !Array.isArray(years) || years.length !== 23
    || !years.every((year, index) => year === 2003 + index)
    || metadata.annualPeriod?.start !== '2003-01' || metadata.annualPeriod?.end !== '2025-12'
    || months[0] !== '2025-10' || months.at(-1) !== '2026-09'
    || metadata.recentPeriod?.start !== months[0] || metadata.recentPeriod?.end !== months.at(-1)) return false;
  return Boolean(record && Array.isArray(record.annual) && record.annual.length === years.length
    && Array.isArray(record.monthly) && record.monthly.length === months.length
    && record.annual.every(validCount) && record.monthly.every(validCount));
}

export function formatFocusCount(value) {
  return `${number.format(value)} ${value === 1 ? 'foco' : 'focos'}`;
}

export function focusPeakIndexes(values) {
  const maximum = Math.max(...values);
  return maximum > 0 ? values.flatMap((value, index) => value === maximum ? [index] : []) : [];
}

export function formatFocusPeak(record, months) {
  const maximum = Math.max(...record.monthly);
  if (maximum === 0) return 'Nenhum foco detectado no período.';
  const labels = focusPeakIndexes(record.monthly).map(index => formatMonth(months[index], true).toLowerCase());
  const joined = new Intl.ListFormat('pt-BR', { type: 'conjunction' }).format(labels);
  return `${joined[0].toUpperCase()}${joined.slice(1)} · ${formatFocusCount(maximum)}${labels.length > 1 ? ' em cada mês' : ''}`;
}

function updateFocusChart(chart, values) {
  const maximum = Math.max(...values);
  for (const value of chart.querySelectorAll('[data-value-index]')) {
    value.textContent = formatChartValue(values[Number(value.dataset.valueIndex)]);
  }
  updateChartGeometry(chart, values);
  const peaks = focusPeakIndexes(values);
  for (const marker of chart.querySelectorAll('[data-peak-index]')) {
    marker.hidden = !peaks.includes(Number(marker.dataset.peakIndex));
    marker.closest('li').toggleAttribute('data-peak', !marker.hidden);
  }
  const empty = chart.querySelector('[data-focus-empty]');
  if (empty) empty.hidden = maximum > 0;
}

export function updateFocusView(container, record, name) {
  updateFocusChart(container.querySelector('[data-series="monthly"]'), record.monthly);
  updateFocusChart(container.querySelector('[data-series="annual"]'), record.annual);
  for (const place of container.querySelectorAll('[data-focus-place]')) place.textContent = name;
}
