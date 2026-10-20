import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Entrada: shapefile BR_UF_2025 original do IBGE, com .dbf, .shx, .prj e .cpg.
const input = process.argv[2];
if (!input) throw new Error('Uso: node scripts/gerar-mapa.mjs caminho/BR_UF_2025.shp');
const require = createRequire(import.meta.url);
const output = join(mkdtempSync(join(tmpdir(), 'conscientiza-mapa-')), 'ufs.json');
execFileSync(process.execPath, [require.resolve('mapshaper/bin/mapshaper'),
  '-i', resolve(input),
  '-proj', '+proj=aea +lat_1=-5 +lat_2=-32 +lat_0=-15 +lon_0=-54 +ellps=GRS80',
  '-simplify', 'weighted', 'interval=4000', 'keep-shapes',
  '-o', output, 'format=geojson', 'precision=1',
], { stdio: 'inherit' });
const { features } = JSON.parse(readFileSync(output, 'utf8'));
if (features.length !== 27 || new Set(features.map(f => f.properties.SIGLA_UF)).size !== 27) {
  throw new Error('A malha precisa conter as 27 UFs distintas.');
}
const points = features.flatMap(f => f.geometry.coordinates.flat(f.geometry.type === 'MultiPolygon' ? 2 : 1));
const xs = points.map(p => p[0]);
const ys = points.map(p => p[1]);
const left = Math.min(...xs);
const top = Math.max(...ys);
const scale = 768 / (Math.max(...xs) - left);
const height = Math.ceil((top - Math.min(...ys)) * scale + 32);
const coordinate = ([x, y]) => `${((x - left) * scale + 16).toFixed(1)},${((top - y) * scale + 16).toFixed(1)}`;
const paths = features.sort((a, b) => a.properties.NM_UF.localeCompare(b.properties.NM_UF, 'pt-BR')).map(feature => {
  const polygons = feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [feature.geometry.coordinates];
  const d = polygons.flatMap(polygon => polygon.map(ring => `M${ring.map(coordinate).join('L')}Z`)).join('');
  return `          <path data-uf="${feature.properties.SIGLA_UF}" aria-label="${feature.properties.NM_UF}" d="${d}"/>`;
});
const svg = `<svg class="brazil-map" viewBox="0 0 800 ${height}" role="group" aria-labelledby="map-title map-description" xmlns="http://www.w3.org/2000/svg">
          <title id="map-title">Unidades federativas do Brasil</title>
          <desc id="map-description">Mapa para seleção de uma unidade federativa. A mesma consulta está disponível no seletor textual.</desc>
${paths.join('\n')}
        </svg>`;
const page = new URL('../dados.html', import.meta.url);
const html = readFileSync(page, 'utf8');
if (!html.includes('<!-- MAPA-IBGE:INICIO -->')) throw new Error('Marcador do mapa ausente.');
writeFileSync(page, html.replace(/<!-- MAPA-IBGE:INICIO -->[\s\S]*?<!-- MAPA-IBGE:FIM -->/,
  `<!-- MAPA-IBGE:INICIO -->\n        ${svg}\n        <!-- MAPA-IBGE:FIM -->`));
console.log(`Mapa atualizado: 27 UFs; SVG com ${Buffer.byteLength(svg)} bytes.`);
