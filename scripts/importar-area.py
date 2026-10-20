#!/usr/bin/env python3
"""Prepara agregados locais do Monitor do Fogo, sem misturar produtos do RAF."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timezone
from decimal import Decimal
import hashlib
import json
import os
from pathlib import Path
import sys
import tempfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://plataforma.monitorfogo.mapbiomas.org/api'
PERIOD = {'start': '2025-10', 'end': '2026-09'}
REFERENCES = [{'start': f'{year}-01', 'end': f'{year}-12'} for year in range(2019, 2025)]
STATES = {
    'AC': (12, 'Acre'), 'AL': (27, 'Alagoas'), 'AP': (16, 'Amapá'), 'AM': (13, 'Amazonas'),
    'BA': (29, 'Bahia'), 'CE': (23, 'Ceará'), 'DF': (53, 'Distrito Federal'), 'ES': (32, 'Espírito Santo'),
    'GO': (52, 'Goiás'), 'MA': (21, 'Maranhão'), 'MT': (51, 'Mato Grosso'), 'MS': (50, 'Mato Grosso do Sul'),
    'MG': (31, 'Minas Gerais'), 'PA': (15, 'Pará'), 'PB': (25, 'Paraíba'), 'PR': (41, 'Paraná'),
    'PE': (26, 'Pernambuco'), 'PI': (22, 'Piauí'), 'RJ': (33, 'Rio de Janeiro'), 'RN': (24, 'Rio Grande do Norte'),
    'RS': (43, 'Rio Grande do Sul'), 'RO': (11, 'Rondônia'), 'RR': (14, 'Roraima'), 'SC': (42, 'Santa Catarina'),
    'SP': (35, 'São Paulo'), 'SE': (28, 'Sergipe'), 'TO': (17, 'Tocantins'),
}
BIOMES = {'Cerrado': 3, 'Amazônia': 1, 'Caatinga': 2, 'Mata Atlântica': 4, 'Pantanal': 6, 'Pampa': 5}
TOLERANCE = Decimal('.07')  # Até 12 parcelas publicadas com duas casas decimais.


def month_range(start, end):
    y, m = map(int, start.split('-')); last_y, last_m = map(int, end.split('-'))
    return [f'{i // 12:04d}-{i % 12 + 1:02d}' for i in range(y * 12 + m - 1, last_y * 12 + last_m)]


def area_value(value):
    if isinstance(value, bool) or not isinstance(value, (int, float, Decimal)):
        raise ValueError('Área ausente ou inválida')
    result = Decimal(str(value))
    if not result.is_finite() or result < 0:
        raise ValueError('Área negativa ou não finita')
    return result


def aggregate_series(payload):
    monthly, annual = payload.get('monthly'), payload.get('annual')
    if not isinstance(monthly, list) or not isinstance(annual, list):
        raise ValueError('Série mensal ou anual ausente')
    counts = {}
    for row in monthly:
        if not isinstance(row, dict):
            raise ValueError('Registro mensal inválido')
        year, month = row.get('year'), row.get('month')
        if type(year) is not int or type(month) is not int or not 1 <= month <= 12:
            raise ValueError('Competência inválida')
        key = f'{year:04d}-{month:02d}'
        if key in counts:
            raise ValueError(f'Competência duplicada: {key}')
        counts[key] = area_value(row.get('areaHa'))
    if any(key not in counts for key in month_range('2019-01', PERIOD['end'])):
        raise ValueError('Série mensal incompleta')
    annual_values = {}
    for row in annual:
        if not isinstance(row, dict):
            raise ValueError('Registro anual inválido')
        year = row.get('year')
        if type(year) is not int or year in annual_values:
            raise ValueError('Ano ausente ou duplicado')
        annual_values[year] = area_value(row.get('areaHa'))
    for year in range(2019, 2027):
        end = max(int(key[5:]) for key in counts if key.startswith('2026-')) if year == 2026 else 12
        if any(f'{year}-{month:02d}' not in counts for month in range(1, end + 1)):
            raise ValueError(f'Cobertura mensal incompleta em {year}')
        total = sum(counts[f'{year}-{month:02d}'] for month in range(1, end + 1))
        if year not in annual_values or abs(total - annual_values[year]) > TOLERANCE:
            raise ValueError(f'Soma mensal divergente da estatística anual de {year}')
    def total(period):
        return sum(counts[key] for key in month_range(period['start'], period['end']))
    references = [total(period) for period in REFERENCES]
    return {'areaLast12Months': total(PERIOD), 'referenceTotals': references, 'referenceAverage': sum(references) / 6}


def source_definitions():
    definitions = {'BR-biome': ('country', 0, 'biome'), 'BR-state': ('country', 0, 'state')}
    definitions.update({uf: ('state', code, 'state') for uf, (code, _) in STATES.items()})
    definitions.update({f'biome-{code}': ('biome', code, 'biome') for code in BIOMES.values()})
    return definitions


def fetch_sources(input_dir=None, cache_dir=None):
    definitions = source_definitions()
    urls = {key: f'{BASE}/statistics/time-series/{kind}/{code}/{group}?monthStart=1&monthEnd=12' for key, (kind, code, group) in definitions.items()}
    urls.update(years=f'{BASE}/statistics/years', months=f'{BASE}/statistics/2026/months')
    def read(item):
        key, url = item
        if input_dir:
            content = (input_dir / f'{key}.json').read_bytes()
        else:
            with urllib.request.urlopen(url, timeout=60) as response:
                content = response.read()
        payload = json.loads(content.decode('utf-8'), parse_float=Decimal)
        if cache_dir:
            cache_dir.mkdir(parents=True, exist_ok=True)
            (cache_dir / f'{key}.json').write_bytes(content)
        return key, {'url': url, 'sha256': hashlib.sha256(content).hexdigest(), 'bytes': len(content), 'payload': payload}
    with ThreadPoolExecutor(max_workers=4) as pool:
        return dict(pool.map(read, urls.items()))


def json_text(value, **options):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, default=lambda number: float(number), **options)


def build_outputs(sources):
    if not set(range(2019, 2027)).issubset(sources['years']['payload']) or not set(range(1, 10)).issubset(sources['months']['payload']):
        raise ValueError('Cobertura oficial de anos ou meses insuficiente')
    records = {key: aggregate_series(sources[key]['payload']) for key in source_definitions()}
    national = records['BR-biome']
    states = {uf: {'name': name, **records[uf]} for uf, (_, name) in STATES.items()}
    biomes = {name: records[f'biome-{code}']['areaLast12Months'] for name, code in BIOMES.items()}
    differences = []
    for key in month_range('2019-01', PERIOD['end']):
        def observed(region):
            return next(area_value(row['areaHa']) for row in sources[region]['payload']['monthly'] if f"{row['year']:04d}-{row['month']:02d}" == key)
        state_difference = sum(observed(uf) for uf in STATES) - observed('BR-state')
        biome_difference = sum(observed(f'biome-{code}') for code in BIOMES.values()) - observed('BR-biome')
        if abs(state_difference) > Decimal('.14') or abs(biome_difference) > Decimal('.04'):
            raise ValueError(f'Soma territorial incompatível com o agrupamento oficial em {key}')
        differences.append({'month': key, 'statesRoundingDifferenceHa': state_difference, 'biomesRoundingDifferenceHa': biome_difference, 'nationalBiomeMinusStateHa': observed('BR-biome') - observed('BR-state')})
    metadata = {'source': 'MapBiomas — Monitor do Fogo', 'collection': 1, 'period': PERIOD, 'referencePeriods': REFERENCES, 'unit': 'ha', 'aggregation': 'Soma das áreas mensais publicadas', 'license': 'CC BY 4.0', 'verifiedAt': date.today().isoformat(), 'nationalGrouping': 'biome', 'stateGrouping': 'state', 'urls': ['https://brasil.mapbiomas.org/iniciativas-e-produtos/fogo/monitor-do-fogo/', f'{BASE}/docs/']}
    module = '// Agregados do Monitor do Fogo; reprodução: scripts/importar-area.py.\n'
    for name, data in [('metadata', metadata), ('states', states), ('biomes', biomes), ('national', national)]:
        module += f'export const {name} = {json_text(data, indent=2)};\n\n'
    audit = {**metadata, 'consultedAt': datetime.now(timezone.utc).isoformat(), 'sources': sources, 'aggregates': records, 'monthlyReconciliation': differences, 'recentNationalGroupingDifferenceHa': records['BR-biome']['areaLast12Months'] - records['BR-state']['areaLast12Months'], 'calculation': 'Recente: soma de out/2025–set/2026. Referência: totais de janeiro a dezembro de 2019–2024, somados e divididos por seis, sem arredondamento intermediário. Diferenças entre agrupamentos documentadas, sem correção artificial.', 'tolerancesHa': {'annualSum': TOLERANCE, 'stateMonthlySum': Decimal('.14'), 'biomeMonthlySum': Decimal('.04')}}
    return module.rstrip() + '\n', audit


def write_outputs(root, module, audit):
    staged = []
    try:
        for relative, content in [('src/dados-base.js', module), ('docs/auditoria-area.json', json_text(audit, indent=2) + '\n')]:
            target = root / relative; target.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', newline='\n', dir=target.parent, delete=False) as stream:
                stream.write(content); staged.append((Path(stream.name), target))
        for temporary, target in staged: os.replace(temporary, target)
    finally:
        for temporary, _ in staged: temporary.unlink(missing_ok=True)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input-dir', type=Path, help='Respostas JSON oficiais locais, para reprodução sem rede')
    parser.add_argument('--cache-dir', type=Path, help='Guardar respostas originais fora do conteúdo publicado')
    parser.add_argument('--output-dir', type=Path, default=ROOT)
    args = parser.parse_args(argv)
    try:
        sources = fetch_sources(args.input_dir, args.cache_dir)
        module, audit = build_outputs(sources)
        write_outputs(args.output_dir, module, audit)
    except (OSError, ValueError) as error:
        print(f'Erro: {error}', file=sys.stderr); return 1
    print('Monitor do Fogo: Brasil, seis biomas e 27 UFs validados e gerados.')
    return 0


if __name__ == '__main__': raise SystemExit(main())
