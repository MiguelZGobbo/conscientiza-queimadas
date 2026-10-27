import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, mkdir, writeFile, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
const script = fileURLToPath(new URL('../scripts/preparar-publicacao.mjs', import.meta.url));
const pages = ['index.html', 'queimadas.html', 'dados.html', 'prevencao.html', 'sobre.html', 'fontes.html'];
const additions = ['404.html', '_headers'];

async function fixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'cq-publicacao-'));
  try {
    for (const page of pages) await cp(join(project, page), join(root, page));
    for (const name of additions) {
      try { await cp(join(project, name), join(root, name)); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    await cp(join(project, 'src'), join(root, 'src'), { recursive: true });
    await mkdir(join(root, 'docs'));
    await writeFile(join(root, 'docs', 'interno.txt'), 'não publicar');
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function prepare(root) {
  return spawnSync(process.execPath, [script, '--root', root], { encoding: 'utf8' });
}

test('copia somente o site e preserva bytes; o manifesto fica fora de dist', async () => fixture(async root => {
  const result = prepare(root);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(await readFile(join(root, '.auditoria-local', 'manifesto-publicacao.json'), 'utf8'));
  assert.equal(manifest.files.length, 29);
  for (const file of manifest.files) {
    assert.deepEqual(await readFile(join(root, 'dist', file.path)), await readFile(join(root, file.path)));
    assert.match(file.sha256, /^[a-f0-9]{64}$/);
  }
  assert.deepEqual((await readdir(join(root, 'dist'))).sort(), [...pages, ...additions, 'src'].sort());
  assert.equal(manifest.files.some(file => /artwork|area-historica|interno|manifesto/.test(file.path)), false);
}));

test('atualiza arquivos sem recriar dist e rejeita extras antes de escrever', async () => fixture(async root => {
  assert.equal(prepare(root).status, 0);
  const before = await stat(join(root, 'dist'));
  await writeFile(join(root, 'index.html'), '<h1>Edição atualizada</h1>');
  assert.equal(prepare(root).status, 0);
  assert.equal((await stat(join(root, 'dist'))).ino, before.ino);
  assert.equal(await readFile(join(root, 'dist', 'index.html'), 'utf8'), '<h1>Edição atualizada</h1>');
  await writeFile(join(root, 'dist', 'privado.txt'), 'preservar');
  await writeFile(join(root, 'index.html'), '<h1>Não copiar ainda</h1>');
  assert.match(prepare(root).stderr, /inesperado/);
  assert.equal(await readFile(join(root, 'dist', 'privado.txt'), 'utf8'), 'preservar');
  assert.equal(await readFile(join(root, 'dist', 'index.html'), 'utf8'), '<h1>Edição atualizada</h1>');
  await rm(join(root, 'dist', 'privado.txt'));
  await mkdir(join(root, 'dist', 'docs'));
  assert.match(prepare(root).stderr, /inesperado/);
  assert.equal(await readFile(join(root, 'dist', 'index.html'), 'utf8'), '<h1>Edição atualizada</h1>');
}));

test('rejeita dependência local fora da lista sem alterar distribuição anterior', async () => fixture(async root => {
  assert.equal(prepare(root).status, 0);
  const before = await readFile(join(root, 'dist', 'index.html'));
  await writeFile(join(root, 'src', 'nao-listado.js'), 'console.log(1)');
  await writeFile(join(root, 'index.html'), '<script src="./src/nao-listado.js"></script>');
  const result = prepare(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /fora da lista/);
  assert.deepEqual(await readFile(join(root, 'dist', 'index.html')), before);
}));

test('resolve somente as páginas canônicas conhecidas sem liberar recursos fora da lista', async () => fixture(async root => {
  await writeFile(join(root, 'index.html'), '<a href="./">Home</a><a href="./dados#estados">Dados</a><a href="./fontes">Fontes</a>');
  assert.equal(prepare(root).status, 0);
  for (const path of ['./privado', './src/styles', './src/artwork/README.md']) {
    await writeFile(join(root, 'index.html'), `<a href="${path}">Não publicar</a>`);
    assert.match(prepare(root).stderr, /fora da lista/);
  }
}));

test('rejeita symlink no destino sem escrever fora da pasta do projeto', async () => fixture(async root => {
  const { symlink } = await import('node:fs/promises');
  await mkdir(join(root, 'externo'));
  await symlink(join(root, 'externo'), join(root, 'dist'), 'junction');
  const result = prepare(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /simbólico/);
  assert.deepEqual(await readdir(join(root, 'externo')), []);
}));

test('serve o artefato real na raiz e em subdiretório, com MIME e 404', async () => fixture(async root => {
  assert.equal(prepare(root).status, 0);
  const expected = (await readFile(join(root, 'dist', 'src', 'styles.css'), 'utf8')) + '\n/* artefato isolado */';
  await writeFile(join(root, 'dist', 'src', 'styles.css'), expected);
  for (const prefix of ['/', '/projeto/']) {
    const server = spawn(process.execPath, [join(project, 'scripts', 'dev-server.mjs'), '--root', join(root, 'dist'), '--prefix', prefix], { env: { ...process.env, PORT: '4377' }, stdio: ['ignore', 'pipe', 'pipe'] });
    try {
      await Promise.race([once(server.stdout, 'data'), once(server, 'exit').then(() => { throw new Error('Servidor encerrou antes de iniciar.'); })]);
      const base = `http://127.0.0.1:4377${prefix}`;
      const css = await fetch(`${base}src/styles.css`);
      assert.equal(css.status, 200);
      assert.match(css.headers.get('content-type'), /text\/css/);
      assert.equal(await css.text(), expected);
      for (const page of pages) assert.equal((await fetch(`${base}${page}`)).status, 200, page);
      for (const page of pages.filter(page => page !== 'index.html')) {
        const alias = await fetch(`${base}${page.slice(0, -5)}`);
        assert.equal(alias.status, 200, page);
        assert.equal(await alias.text(), await readFile(join(root, page), 'utf8'));
      }
      for (const path of ['docs/interno.txt', 'package.json', '.git/config', '_headers', 'inexistente.html', 'nivel/acentua%C3%A7%C3%A3o/ausente', 'src/ausente.js', '%ZZ', 'src/artwork/originais/rodape.png']) {
        const missing = await fetch(`${base}${path}`);
        assert.equal(missing.status, 404, path);
        assert.match(await missing.text(), /Página não encontrada/);
      }
      assert.equal((await fetch(`${base}404.html`)).status, 200);
      assert.equal(await (await fetch(`${base}ausente`, { method: 'HEAD' })).text(), '');
      assert.equal((await fetch(base, { method: 'HEAD' })).status, 200);
      assert.equal((await fetch(base, { method: 'HEAD' })).headers.get('x-content-type-options'), 'nosniff');
      assert.equal((await fetch(base, { method: 'POST' })).status, 404);
      if (prefix !== '/') assert.equal((await fetch('http://127.0.0.1:4377/index.html')).status, 404);
    } finally {
      server.kill();
      await once(server, 'exit');
    }
  }
}));
