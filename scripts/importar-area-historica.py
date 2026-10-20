#!/usr/bin/env python3
"""Importa a Tabela 3 do RAF2025, preservando a medida espacial acumulada."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://raf.ia.mapbiomas.org/raf2025/publication-web-resources/html/publication-20.html'
ORDER = ['Cerrado', 'Amazônia', 'Caatinga', 'Mata Atlântica', 'Pantanal', 'Pampa']


class SourceText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        if data.strip(): self.parts.append(data.strip())


def parse_table(content):
    parser = SourceText()
    parser.feed(content.decode('utf-8'))
    text = ' '.join(parser.parts)
    biomes = {}
    for name in ORDER:
        matches = re.findall(re.escape(name) + r'\s+([\d.]+)\s+([\d,]+)%\s+([\d,]+)%', text)
        if len(matches) != 1: raise ValueError(f'Linha oficial ausente ou ambígua: {name}')
        biomes[name] = int(matches[0][0].replace('.', ''))
    matches = re.findall(r'Brasil\s+([\d.]+)\s+24%\s+100%', text)
    if len(matches) != 1: raise ValueError('Total nacional ausente ou ambíguo')
    total = int(matches[0].replace('.', ''))
    if sum(biomes.values()) != total: raise ValueError('Soma dos biomas divergente da Tabela 3')
    return biomes, total


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, help='HTML original para reprodução sem rede')
    parser.add_argument('--cache', type=Path)
    args = parser.parse_args()
    content = args.input.read_bytes() if args.input else urllib.request.urlopen(URL, timeout=60).read()
    biomes, total = parse_table(content)
    metadata = {'source': 'MapBiomas Fogo — RAF2025', 'collection': 5, 'table': 3, 'period': {'start': 1985, 'end': 2025}, 'unit': 'ha', 'indicator': 'Território atingido pelo fogo ao menos uma vez, sem contar reincidências', 'license': 'CC BY 4.0', 'url': URL, 'verifiedAt': '2026-10-19'}
    audit = {**metadata, 'sha256': hashlib.sha256(content).hexdigest(), 'originalHtml': content.decode('utf-8'), 'biomes': biomes, 'national': total, 'table2National': 208436935, 'table3MinusTable2Ha': total - 208436935, 'note': 'Total e biomas da Tabela 3 preservados. O total da Tabela 2 diverge em 4.673 ha; a publicação não esclarece a causa. Não se somam áreas anuais para calcular território atingido uma única vez.'}
    module = '// Tabela 3 do RAF2025; reprodução: scripts/importar-area-historica.py.\n'
    for name, value in [('historicalAreaMetadata', metadata), ('historicalBiomes', biomes), ('historicalNationalArea', total)]:
        module += f'export const {name} = {json.dumps(value, ensure_ascii=False, indent=2)};\n'
    (ROOT / 'src/area-historica.js').write_text(module, encoding='utf-8', newline='\n')
    (ROOT / 'docs/auditoria-area-historica.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    if args.cache: args.cache.write_bytes(content)
    print('RAF2025: Tabela 3 validada, seis biomas e total nacional preservados.')


if __name__ == '__main__': main()
