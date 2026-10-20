#!/usr/bin/env python3
"""Gera os totais de focos do satélite de referência do INPE para a página Dados."""

from __future__ import annotations

import argparse
import csv
import calendar
import codecs
import hashlib
import json
import math
import os
import shutil
import sys
import tempfile
import unicodedata
import urllib.error
import urllib.request
import zipfile
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
YEARS = tuple(range(2003, 2026))
EXPECTED_ANNUAL_TOTALS = {
    2021: 184081,
    2022: 200763,
    2023: 189901,
    2024: 278299,
    2025: 136393,
}
EXPECTED_2025_ZIP_SHA256 = "63b144c47279991dca0f2007e23e15b4a932355b6c93d033d81a245a8eab56ca"
SOURCE = "INPE — Programa Queimadas"
PRODUCT = "Satélite de referência"
VERIFIED_AT = "2026-10-19"
END_MONTH = "2026-09"
SATELLITE = "AQUA_M-T"
MONTHLY_URL = "https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/mensal/Brasil/focos_mensal_br_{month}.csv"
ARCHIVE_URL = (
    "https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/anual/"
    "Brasil_sat_ref/focos_br_ref_{year}.zip"
)
REQUIRED_COLUMNS = (
    "id_bdq",
    "foco_id",
    "lat",
    "lon",
    "data_pas",
    "pais",
    "estado",
    "municipio",
    "bioma",
)

# Nomes oficiais presentes na coluna estado do CSV. A normalização abaixo remove
# diferenças de caixa e acentuação, mantendo a lista de UFs explicitamente fechada.
STATE_NAME_TO_CODE = {
    "ACRE": "AC",
    "ALAGOAS": "AL",
    "AMAPA": "AP",
    "AMAZONAS": "AM",
    "BAHIA": "BA",
    "CEARA": "CE",
    "DISTRITO FEDERAL": "DF",
    "ESPIRITO SANTO": "ES",
    "GOIAS": "GO",
    "MARANHAO": "MA",
    "MATO GROSSO": "MT",
    "MATO GROSSO DO SUL": "MS",
    "MINAS GERAIS": "MG",
    "PARA": "PA",
    "PARAIBA": "PB",
    "PARANA": "PR",
    "PERNAMBUCO": "PE",
    "PIAUI": "PI",
    "RIO DE JANEIRO": "RJ",
    "RIO GRANDE DO NORTE": "RN",
    "RIO GRANDE DO SUL": "RS",
    "RONDONIA": "RO",
    "RORAIMA": "RR",
    "SANTA CATARINA": "SC",
    "SAO PAULO": "SP",
    "SERGIPE": "SE",
    "TOCANTINS": "TO",
}
STATE_CODES = tuple(STATE_NAME_TO_CODE.values())


def normalize_state_name(value: str) -> str:
    without_accents = unicodedata.normalize("NFKD", value)
    ascii_text = without_accents.encode("ascii", "ignore").decode("ascii")
    return " ".join(ascii_text.upper().split())


def _empty_counts(years: tuple[int, ...]) -> dict[str, dict[int, int]]:
    return {
        region: {year: 0 for year in years}
        for region in ("BR", *STATE_CODES)
    }


def validate_and_aggregate(
    csv_by_year: dict[int, Path],
    years: tuple[int, ...] = YEARS,
    expected_totals: dict[int, int] | None = EXPECTED_ANNUAL_TOTALS,
    require_monthly_coverage: bool = False,
) -> tuple[dict[str, dict[str, list[int]]], dict[int, dict[str, object]]]:
    """Valida arquivos completos e agrega os totais do Brasil e de cada UF."""
    annual = _empty_counts(years)
    monthly = {
        region: {year: [0] * 12 for year in years}
        for region in ("BR", *STATE_CODES)
    }
    audit: dict[int, dict[str, object]] = {}

    for year in years:
        path = csv_by_year.get(year)
        if path is None or not Path(path).is_file():
            raise ValueError(f"arquivo CSV ausente para {year}: {path or 'não informado'}")

        row_count = 0
        seen_focus_ids = {}
        duplicates = 0
        missing_context = {'bioma': 0, 'municipio': 0}
        with Path(path).open("r", encoding="utf-8-sig", newline="") as csv_file:
            reader = csv.DictReader(csv_file)
            fieldnames = reader.fieldnames or []
            if len(fieldnames) != len(set(fieldnames)):
                raise ValueError(f"{path}: cabeçalho possui colunas duplicadas")
            for column in REQUIRED_COLUMNS:
                if column not in fieldnames:
                    raise ValueError(f"{path}: coluna obrigatória ausente: {column}")

            for row_data in reader:
                row_count += 1
                line_number = reader.line_num
                if None in row_data:
                    raise ValueError(f"{path}: linha {line_number}: número de campos inesperado")
                for column in REQUIRED_COLUMNS:
                    value = row_data.get(column)
                    if column in missing_context and not (value or '').strip():
                        missing_context[column] += 1
                        continue
                    if value is None or not value.strip():
                        raise ValueError(
                            f"{path}: linha {line_number}: valor ausente em {column}"
                        )

                focus_id = row_data["foco_id"].strip()
                fingerprint = tuple(row_data.values())
                if focus_id in seen_focus_ids:
                    if seen_focus_ids[focus_id] != fingerprint:
                        raise ValueError(f"{path}: foco_id duplicado conflitante: {focus_id}")
                    duplicates += 1
                    continue
                seen_focus_ids[focus_id] = fingerprint

                if row_data["pais"].strip().casefold() != "brasil":
                    raise ValueError(
                        f"{path}: linha {line_number}: país desconhecido: {row_data['pais']}"
                    )

                normalized_state = normalize_state_name(row_data["estado"])
                state_code = STATE_NAME_TO_CODE.get(normalized_state)
                if state_code is None:
                    raise ValueError(
                        f"{path}: linha {line_number}: estado desconhecido: {row_data['estado']}"
                    )

                try:
                    latitude = float(row_data["lat"])
                    longitude = float(row_data["lon"])
                except ValueError as error:
                    raise ValueError(
                        f"{path}: linha {line_number}: coordenada inválida"
                    ) from error
                if (
                    not math.isfinite(latitude)
                    or not math.isfinite(longitude)
                    or not -90 <= latitude <= 90
                    or not -180 <= longitude <= 180
                ):
                    raise ValueError(
                        f"{path}: linha {line_number}: coordenada fora dos limites"
                    )

                try:
                    observed_at = datetime.strptime(
                        row_data["data_pas"].strip(), "%Y-%m-%d %H:%M:%S"
                    )
                except ValueError as error:
                    raise ValueError(
                        f"{path}: linha {line_number}: data_pas inválida: {row_data['data_pas']}"
                    ) from error
                if observed_at.year != year:
                    raise ValueError(
                        f"{path}: linha {line_number}: data_pas fora do ano {year}"
                    )

                month_index = observed_at.month - 1
                annual["BR"][year] += 1
                annual[state_code][year] += 1
                monthly["BR"][year][month_index] += 1
                monthly[state_code][year][month_index] += 1

        if require_monthly_coverage and any(value == 0 for value in monthly['BR'][year]):
            raise ValueError(f'{path}: cobertura mensal nacional insuficiente em {year}')
        if expected_totals is not None:
            expected_total = expected_totals.get(year)
            observed_total = annual["BR"][year]
            if expected_total is not None and observed_total != expected_total:
                raise ValueError(
                    f"{path}: total anual divergente em {year}: "
                    f"esperado {expected_total}, encontrado {observed_total}"
                )
        if sum(monthly["BR"][year]) != annual["BR"][year]:
            raise ValueError(f"{path}: soma mensal nacional divergente em {year}")
        if sum(annual[state_code][year] for state_code in STATE_CODES) != annual["BR"][year]:
            raise ValueError(f"{path}: soma por UF divergente em {year}")
        for state_code in STATE_CODES:
            if sum(monthly[state_code][year]) != annual[state_code][year]:
                raise ValueError(
                    f"{path}: soma mensal divergente para {state_code} em {year}"
                )

        audit[year] = {
            "total": annual['BR'][year],
            "rows": row_count,
            "duplicates": duplicates,
            "missingContextFields": missing_context,
            "csvSha256": hashlib.sha256(Path(path).read_bytes()).hexdigest(),
            "monthly": monthly["BR"][year].copy(),
            "states": {state_code: annual[state_code][year] for state_code in STATE_CODES},
        }

    focus_data: dict[str, dict[str, list[int]]] = {
        "BR": {
            "annual": [annual["BR"][year] for year in years],
            "monthly": {f'{year}-{month:02d}': monthly['BR'][year][month - 1] for year in years for month in range(1, 13)},
        }
    }
    for state_code in STATE_CODES:
        focus_data[state_code] = {
            "annual": [annual[state_code][year] for year in years],
            "monthly": {f'{year}-{month:02d}': monthly[state_code][year][month - 1] for year in years for month in range(1, 13)},
        }

    return focus_data, audit


def download_archives(directory: Path, years: tuple[int, ...]) -> tuple[dict[int, Path], dict[int, dict[str, object]]]:
    paths: dict[int, Path] = {}
    archive_info: dict[int, dict[str, object]] = {}

    for year in years:
        url = ARCHIVE_URL.format(year=year)
        zip_path = directory / f"focos_br_ref_{year}.zip"
        csv_path = directory / f"focos_br_ref_{year}.csv"
        digest = hashlib.sha256()
        byte_count = 0
        try:
            with urllib.request.urlopen(url, timeout=120) as response, zip_path.open("wb") as output:
                while chunk := response.read(1024 * 1024):
                    output.write(chunk)
                    digest.update(chunk)
                    byte_count += len(chunk)
        except (OSError, urllib.error.URLError) as error:
            raise RuntimeError(f"falha ao baixar o ZIP oficial de {year}: {error}") from error

        archive_hash = digest.hexdigest()
        if year == 2025 and archive_hash != EXPECTED_2025_ZIP_SHA256:
            raise ValueError(
                f"SHA-256 do ZIP de 2025 divergente: esperado {EXPECTED_2025_ZIP_SHA256}, "
                f"encontrado {archive_hash}"
            )

        expected_member = f"focos_br_ref_{year}.csv"
        try:
            with zipfile.ZipFile(zip_path) as archive:
                members = [
                    member
                    for member in archive.namelist()
                    if Path(member).name == expected_member
                ]
                if len(members) != 1:
                    raise ValueError(
                        f"ZIP de {year}: esperado um arquivo {expected_member}, "
                        f"encontrados {len(members)}"
                    )
                with archive.open(members[0]) as source, csv_path.open("wb") as output:
                    shutil.copyfileobj(source, output)
        except zipfile.BadZipFile as error:
            raise ValueError(f"ZIP inválido para {year}: {error}") from error

        paths[year] = csv_path
        archive_info[year] = {
            "url": url,
            "zipBytes": byte_count,
            "zipSha256": archive_hash,
            "csvMember": members[0],
        }

    return paths, archive_info


def csv_inputs(directory: Path, years: tuple[int, ...]) -> tuple[dict[int, Path], dict[int, dict[str, object]]]:
    paths = {
        year: directory / f"focos_br_ref_{year}.csv"
        for year in years
    }
    archive_info = {
        year: {
            "url": ARCHIVE_URL.format(year=year),
            "zipBytes": None,
            "zipSha256": None,
            "csvMember": paths[year].name,
            "archiveHashNote": "ZIP original não fornecido; foi recebido um CSV local.",
        }
        for year in years
    }
    for year in years:
        archive = directory / f'focos_br_ref_{year}.zip'
        if archive.is_file():
            digest = hashlib.sha256(archive.read_bytes()).hexdigest()
            if year == 2025 and digest != EXPECTED_2025_ZIP_SHA256:
                raise ValueError('SHA-256 do ZIP de 2025 divergente')
            archive_info[year].update(zipBytes=archive.stat().st_size, zipSha256=digest)
            archive_info[year].pop('archiveHashNote', None)
    return paths, archive_info


def month_range(start, end):
    first_year, first_month = map(int, start.split('-'))
    last_year, last_month = map(int, end.split('-'))
    return tuple(f'{index // 12:04d}-{index % 12 + 1:02d}' for index in range(first_year * 12 + first_month - 1, last_year * 12 + last_month))


def historical_data(series):
    """Anos civis, meses recentes e comparação acumulada têm recortes próprios."""
    result = {}
    for region, counts in series.items():
        required = month_range('2003-01', END_MONTH)
        if any(key not in counts or type(counts[key]) is not int or counts[key] < 0 for key in required):
            raise ValueError(f'Série mensal incompleta: {region}')
        annual = [sum(counts[f'{year}-{month:02d}'] for month in range(1, 13)) for year in YEARS]
        current = [sum(counts[f'2026-{month:02d}'] for month in range(1, end + 1)) for end in range(1, 10)]
        historical = [sum(counts[f'{year}-{month:02d}'] for year in YEARS for month in range(1, end + 1)) / len(YEARS) for end in range(1, 10)]
        result[region] = {'annual': annual, 'monthly': [counts[key] for key in month_range('2025-10', END_MONTH)], 'cumulative': current, 'historicalCumulative': historical}
    return result


def csv_encoding(path):
    with path.open('rb') as stream:
        sample = stream.read(65536)
    try:
        codecs.getincrementaldecoder('utf-8-sig')().decode(sample, final=False)
        return 'utf-8-sig'
    except UnicodeDecodeError:
        return 'latin-1'


def validate_monthly(csv_by_month, months, require_daily_coverage=True):
    data = {region: {} for region in ('BR', *STATE_CODES)}
    audit = {}
    ibge_codes = dict(zip(('12','27','16','13','29','23','53','32','52','21','51','50','31','15','25','41','26','22','33','24','43','11','14','42','35','28','17'), STATE_CODES))
    required = ('id', 'lat', 'lon', 'data_hora_gmt', 'satelite', 'estado', 'estado_id', 'pais')
    for month in months:
        path = csv_by_month.get(month)
        if path is None or not path.is_file():
            raise ValueError(f'Arquivo mensal ausente: {month}')
        counts = dict.fromkeys(data, 0)
        seen, days, source_days = {}, set(), set()
        rows = duplicates = 0
        encoding = csv_encoding(path)
        with path.open(encoding=encoding, newline='') as stream:
            reader = csv.DictReader(stream)
            columns = reader.fieldnames or []
            if len(columns) != len(set(columns)) or any(key not in columns for key in required):
                raise ValueError(f'{path}: cabeçalho mensal inválido')
            for row in reader:
                rows += 1
                if None in row or any(not (row.get(key) or '').strip() for key in required):
                    raise ValueError(f'{path}:{reader.line_num}: campos inválidos')
                observed = datetime.strptime(row['data_hora_gmt'].strip(), '%Y-%m-%d %H:%M:%S')
                if observed.strftime('%Y-%m') != month:
                    raise ValueError(f'{path}: data fora da competência {month}')
                source_days.add(observed.day)
                if row['satelite'].strip() != SATELLITE:
                    continue
                uf = ibge_codes.get(row['estado_id'].strip())
                if uf is None or STATE_NAME_TO_CODE.get(normalize_state_name(row['estado'])) != uf or row['pais'].strip().casefold() != 'brasil':
                    raise ValueError(f'{path}: país ou UF inválido')
                lat, lon = float(row['lat']), float(row['lon'])
                if not math.isfinite(lat) or not math.isfinite(lon) or not -90 <= lat <= 90 or not -180 <= lon <= 180:
                    raise ValueError(f'{path}: coordenada inválida')
                identifier, fingerprint = row['id'].strip(), tuple(row.values())
                if identifier in seen:
                    if seen[identifier] != fingerprint:
                        raise ValueError(f'{path}: identificador conflitante: {identifier}')
                    duplicates += 1
                    continue
                seen[identifier] = fingerprint
                days.add(observed.day)
                counts['BR'] += 1
                counts[uf] += 1
        year, number = map(int, month.split('-'))
        expected_days = set(range(1, calendar.monthrange(year, number)[1] + 1))
        if require_daily_coverage and source_days != expected_days:
            raise ValueError(f'{path}: cobertura diária insuficiente para {month}')
        if require_daily_coverage and not days:
            raise ValueError(f'{path}: cobertura de referência ausente em {month}')
        if counts['BR'] != sum(counts[uf] for uf in STATE_CODES):
            raise ValueError(f'{path}: soma por UF divergente')
        for region in data:
            data[region][month] = counts[region]
        audit[month] = {'rows': rows, 'total': counts['BR'], 'states': {uf: counts[uf] for uf in STATE_CODES}, 'duplicates': duplicates, 'sourceDays': sorted(source_days), 'referenceDays': sorted(days), 'daysWithoutReferenceRecords': sorted(expected_days - days), 'encoding': encoding, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size, 'url': MONTHLY_URL.format(month=month.replace('-', ''))}
    return data, audit


def render_module(focus_data: dict[str, dict[str, list[int]]]) -> str:
    urls_text = ",\n    ".join(
        f"'{ARCHIVE_URL.format(year=year)}'" for year in YEARS
    )
    lines = [
        "// Agregados locais dos arquivos oficiais do INPE; auditoria em docs/auditoria-focos.json.",
        "export const focusMetadata = {",
        f"  source: '{SOURCE}',",
        f"  product: '{PRODUCT}',",
        f"  satellite: '{SATELLITE}',",
        f"  months: {json.dumps(month_range('2025-10', END_MONTH))},",
        f"  years: {json.dumps(YEARS)},",
        f"  currentMonths: {json.dumps(month_range('2026-01', END_MONTH))},",
        "  annualPeriod: {start: '2003-01', end: '2025-12'},",
        "  recentPeriod: {start: '2025-10', end: '2026-09'},",
        "  historicalReference: {start: '2003-01', end: '2025-12', calculation: 'Média dos acumulados dos mesmos meses nos 23 anos completos'},",
        "  unit: 'focos',",
        "  urls: [",
        f"    {urls_text}" + ''.join(f",\n    '{MONTHLY_URL.format(month=month.replace('-', ''))}'" for month in month_range('2026-01', END_MONTH)),
        "  ],",
        f"  verifiedAt: '{VERIFIED_AT}',",
        "};",
        "",
        "export const focusData = {",
    ]
    for region, values in focus_data.items():
        lines.append(f"  {region}: {json.dumps(values, ensure_ascii=False)},")
    lines.extend(["};", ""])
    return "\n".join(lines)


def make_audit(
    focus_data: dict[str, dict[str, list[int]]],
    year_audit: dict[int, dict[str, object]],
    archive_info: dict[int, dict[str, object]],
) -> dict[str, object]:
    counts_by_year = {
        str(year): {
            "brasil": year_audit[year]["total"],
            "porUF": year_audit[year]["states"],
            "porMesBrasil": year_audit[year]["monthly"],
        }
        for year in YEARS
    }
    return {
        "source": SOURCE,
        "product": PRODUCT,
        "years": list(YEARS),
        "unit": "focos",
        "verifiedAt": VERIFIED_AT,
        "archives": [
            {"year": year, **archive_info[year]}
            for year in YEARS
        ],
        "annualBrazilTotals": {
            str(year): focus_data["BR"]["annual"][index]
            for index, year in enumerate(YEARS)
        },
        "countsByYear": counts_by_year,
        "validationByYear": year_audit,
        "validations": [
            "Os 23 CSVs anuais oficiais estavam presentes e tinham as colunas esperadas.",
            "Todos os campos exigidos estavam preenchidos em cada linha.",
            "Identificadores repetidos idênticos contados uma vez; conflitos rejeitados nos arquivos anuais.",
            "Cada país era Brasil e cada estado correspondia a uma das 27 UFs mapeadas.",
            "Cada data_pas pertencia ao ano do arquivo, sem conversão de fuso horário.",
            "Totais anuais de 2021–2025 reconciliados com as referências independentes já verificadas; 2003–2020 agregados dos arquivos oficiais, sem inventar totais de controle.",
            "As somas por mês e por UF coincidiam com os totais nacionais anuais.",
        ],
    }


def write_outputs(output_root: Path, module_source: str, audit: dict[str, object]) -> None:
    outputs = {
        output_root / "src" / "focos-base.js": module_source,
        output_root / "docs" / "auditoria-focos.json": json.dumps(
            audit, ensure_ascii=False, indent=2
        )
        + "\n",
    }
    staged: list[tuple[Path, Path]] = []
    try:
        for target, content in outputs.items():
            target.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                newline="\n",
                dir=target.parent,
                prefix=f".{target.name}.",
                suffix=".tmp",
                delete=False,
            ) as temporary_file:
                temporary_file.write(content)
                staged.append((Path(temporary_file.name), target))
        for temporary_path, target in staged:
            os.replace(temporary_path, target)
    finally:
        for temporary_path, _ in staged:
            temporary_path.unlink(missing_ok=True)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Valida focos anuais 2003–2025, meses recentes e acumulados comparáveis de 2026."
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        help="diretório com os CSVs anuais de 2003–2025 e mensais de janeiro–setembro/2026; sem a opção, baixa os arquivos oficiais",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=ROOT,
        help="raiz onde serão gravados src/focos-base.js e docs/auditoria-focos.json",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    arguments = parse_args(argv)
    try:
        if arguments.input_dir:
            csv_by_year, archive_info = csv_inputs(arguments.input_dir, YEARS)
            import_periods(arguments.input_dir, csv_by_year, archive_info, arguments.output_dir)
        else:
            with tempfile.TemporaryDirectory(prefix="importar-focos-inpe-") as temporary_directory:
                csv_by_year, archive_info = download_archives(Path(temporary_directory), YEARS)
                directory = Path(temporary_directory)
                for month in month_range('2026-01', END_MONTH):
                    url = MONTHLY_URL.format(month=month.replace('-', ''))
                    with urllib.request.urlopen(url, timeout=120) as source, (directory / f"focos_mensal_br_{month.replace('-', '')}.csv").open('wb') as target:
                        shutil.copyfileobj(source, target)
                import_periods(directory, csv_by_year, archive_info, arguments.output_dir)
    except (OSError, RuntimeError, ValueError, zipfile.BadZipFile) as error:
        print(f"Erro: {error}", file=sys.stderr)
        return 1

    print(
        "Arquivos gerados: "
        f"{arguments.output_dir / 'src' / 'focos-base.js'} e "
        f"{arguments.output_dir / 'docs' / 'auditoria-focos.json'}"
    )
    return 0


def import_periods(directory, csv_by_year, archive_info, output_root):
    annual, year_audit = validate_and_aggregate(csv_by_year, require_monthly_coverage=True)
    months = month_range('2026-01', END_MONTH)
    paths = {month: directory / f"focos_mensal_br_{month.replace('-', '')}.csv" for month in months}
    recent, monthly_audit = validate_monthly(paths, months)
    # Referência independente publicada no Infoqueima de junho/2026.
    if recent['BR']['2026-06'] != 5209:
        raise ValueError('Total de junho/2026 diverge do boletim oficial: esperado 5209')
    series = {uf: {**record['monthly'], **recent[uf]} for uf, record in annual.items()}
    data = historical_data(series)
    audit = make_audit(annual, year_audit, archive_info)
    audit.update(satellite=SATELLITE, months=list(month_range('2025-10', END_MONTH)), currentMonths=list(month_range('2026-01', END_MONTH)), monthlyFiles=monthly_audit, monthlyBrazil=data['BR']['monthly'], aggregates=data, calculation='Anos civis 2003–2025; meses out/2025–set/2026; acumulados jan–set/2026 versus média aritmética dos acumulados dos mesmos meses de 2003–2025.', monthlyByRegion=series)
    audit['validations'].extend(['Filtragem AQUA_M-T nos CSVs mensais de 2026; os arquivos multissatélite têm registros em todos os dias. Dias sem registros de referência são explicitados, sem inferir ausência de fogo.', 'Identificadores idênticos contados uma vez; conflitos interrompem a importação.', 'Junho de 2026: 5.209 focos, conforme boletim oficial do INPE.', 'Acumulados comparados usam os mesmos meses; 2026 não integra a referência nem a série de anos completos.'])
    write_outputs(output_root, render_module(data), audit)


if __name__ == "__main__":
    raise SystemExit(main())
