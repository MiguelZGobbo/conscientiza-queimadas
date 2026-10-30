import { readFile, writeFile, mkdir, lstat, readdir } from 'node:fs/promises';
import { resolve, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// Lista de entrega explícita: os originais e as ferramentas ficam no repositório.
export const publicFiles = [
  'index.html', 'queimadas.html', 'dados.html', 'prevencao.html', 'sobre.html', 'fontes.html',
  '404.html', '_headers',
  'src/fonts/fraunces-v38-latin-600.woff2', 'src/fonts/OFL-Fraunces.txt',
  ...['styles.css', 'paginas.css', 'queimadas.css', 'dados.css', 'prevencao.css',
    'navigation.js', 'hero-interaction.js', 'dados.js', 'graficos-interacao.js', 'focos.js',
    'graficos.js', 'dados-base.js', 'focos-base.js', 'seletor-estados.js', 'favicon.svg', 'smoke.svg',
    'footer-background.webp', 'footer-background-768.webp', 'footer-background-960.webp',
    'footer-background-1440.webp', 'footer-background-1920.webp'].map(name => `src/${name}`),
];

// Somente páginas conhecidas têm alias sem extensão; assets continuam explícitos.
const canonicalDocuments = new Map(['queimadas', 'dados', 'prevencao', 'sobre', 'fontes'].map(route => [route, `${route}.html`]));

async function rejectSymlinks(path) {
  let info;
  try { info = await lstat(path); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
  if (info.isSymbolicLink()) throw new Error(`Link simbólico não permitido: ${path}`);
  if (info.isDirectory()) for (const name of await readdir(path)) await rejectSymlinks(resolve(path, name));
}

function references(text, extension) {
  if (extension === '.html' || extension === '.svg') {
    const attributes = [...text.matchAll(/\b(?:src|href|data-src)\s*=\s*["']([^"']+)["']/g)].map(match => match[1]);
    const sources = [...text.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/g)]
      .flatMap(match => match[1].split(',').map(candidate => candidate.trim().split(/\s+/)[0]));
    return [...attributes, ...sources];
  }
  if (extension === '.js') return [...text.matchAll(/\b(?:from\s*|import\s*\(\s*)['"](\.[^'"]+)['"]/g)].map(match => match[1]);
  if (extension === '.css') return [...text.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)].map(match => match[1]);
  return [];
}

export async function preparePublication(root) {
  root = resolve(root);
  const output = resolve(root, 'dist');
  const evidence = resolve(root, '.auditoria-local');
  // Validar o conjunto inteiro antes de atualizar qualquer arquivo de saída.
  if (relative(root, output) !== 'dist') throw new Error('Destino inválido.');
  await rejectSymlinks(output);
  await rejectSymlinks(evidence);
  const files = [];
  const contents = new Map();
  for (const path of publicFiles) {
    await rejectSymlinks(resolve(root, path.split('/')[0]));
    const bytes = await readFile(resolve(root, path));
    for (const ref of references(bytes.toString('utf8'), extname(path))) {
      if (/^(#|https?:|mailto:|tel:|data:)/i.test(ref)) continue;
      const url = new URL(ref, `https://local.invalid/${path}`);
      const referencePath = decodeURIComponent(url.pathname).slice(1) || 'index.html';
      const dependency = canonicalDocuments.get(referencePath) || referencePath;
      if (url.origin !== 'https://local.invalid' || !publicFiles.includes(dependency)) {
        throw new Error(`Dependência fora da lista: ${path} → ${ref}`);
      }
    }
    files.push({ path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    contents.set(path, bytes);
  }
  // Não apagar conteúdo alheio caso dist já tenha sido usado para outra finalidade.
  async function checkExisting(directory) {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
    for (const entry of entries) {
      const path = resolve(directory, entry.name);
      const deliveredPath = relative(output, path).replaceAll('\\', '/');
      if (entry.isDirectory()) {
        if (!publicFiles.some(file => file.startsWith(`${deliveredPath}/`))) throw new Error(`Diretório inesperado em dist: ${entry.name}`);
        await checkExisting(path);
      } else if (!publicFiles.includes(deliveredPath)) throw new Error(`Arquivo inesperado em dist: ${entry.name}`);
    }
  }
  await checkExisting(output);
  for (const { path } of files) {
    await mkdir(dirname(resolve(output, path)), { recursive: true });
    await writeFile(resolve(output, path), contents.get(path));
  }
  const manifest = { date: new Date().toISOString(), directory: 'dist', totalBytes: files.reduce((sum, file) => sum + file.bytes, 0), files };
  await mkdir(evidence, { recursive: true });
  await writeFile(resolve(evidence, 'manifesto-publicacao.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== '--root')) throw new Error('Uso: node scripts/preparar-publicacao.mjs [--root diretório]');
    const result = await preparePublication(args[1] || fileURLToPath(new URL('../', import.meta.url)));
    console.log(`dist/: ${result.files.length} arquivos; ${result.totalBytes} bytes. Nenhuma publicação realizada.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
