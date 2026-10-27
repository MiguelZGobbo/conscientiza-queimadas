import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { measurementOptions, measureSite } from '../scripts/medir-site.mjs';
import { createStaticServer } from '../scripts/dev-server.mjs';
import { publicFiles } from '../scripts/preparar-publicacao.mjs';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

test('medidor aceita somente origem pública conhecida ou loopback sem credenciais', () => {
  assert.equal(measurementOptions(['--base-url', 'https://conscientiza-queimadas.pages.dev/']).baseURL, 'https://conscientiza-queimadas.pages.dev/');
  for (const url of ['https://outro.example/', 'http://conscientiza-queimadas.pages.dev/', 'http://user:secret@localhost/', 'https://conscientiza-queimadas.pages.dev.evil.example/']) {
    assert.throws(() => measurementOptions(['--base-url', url]));
  }
});

test('WebKit contabiliza cada salto HTTP na navegação, além dos recursos finais', async () => {
  const root = await mkdtemp(join(tmpdir(), 'cq-medicao-'));
  let server;
  try {
    for (const path of publicFiles) {
      const target = join(root, path);
      await mkdir(dirname(target), { recursive: true });
      let bytes = await readFile(new URL(`../${path}`, import.meta.url));
      if (path.endsWith('.html')) bytes = Buffer.from(bytes.toString('utf8').replace(/href="\.\/(queimadas|dados|prevencao|sobre|fontes)"/g, 'href="./$1.html"').replaceAll('href="./"', 'href="./index.html"'));
      await writeFile(target, bytes);
    }
    server = createStaticServer({ root, canonicalRedirects: true });
    server.listen(0, '127.0.0.1'); await once(server, 'listening');
    const report = await measureSite(measurementOptions(['--base-url', `http://127.0.0.1:${server.address().port}/`, '--profiles', 'ios-webkit', '--scenarios', 'navigation', '--runs', '1', '--output', join(root, 'evidencias')]));
    const redirected = report.samples.filter(sample => sample.initial.navigation.redirectCount > 0);
    assert.equal(redirected.length, 12);
    for (const sample of redirected) {
      assert.equal(sample.initial.requests, sample.initial.resources.length + 1 + sample.initial.navigation.redirectCount);
      assert.equal(sample.afterScroll.requests, sample.afterScroll.resources.length + 1 + sample.afterScroll.navigation.redirectCount);
      assert.deepEqual(sample.errors, []);
    }
  } finally {
    if (server) { const closed = once(server, 'close'); server.close(); server.closeAllConnections(); await closed; }
    assert.ok(root.startsWith(join(tmpdir(), 'cq-medicao-')));
    await rm(root, { recursive: true, force: true });
  }
});

test('servidor de ensaio revalida sem transferir corpo e normaliza rotas sem alterar o padrão dev', async () => {
  for (const cache of ['no-store', 'revalidate']) {
    const server = createStaticServer({ cache, canonicalRedirects: cache === 'revalidate' });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    try {
      const base = `http://127.0.0.1:${server.address().port}`;
      const redirect = await fetch(`${base}/dados.html`, { redirect: 'manual' });
      assert.equal(redirect.status, cache === 'revalidate' ? 308 : 200);
      if (cache === 'revalidate') assert.equal(redirect.headers.get('location'), '/dados');
      const first = await fetch(`${base}/dados`);
      assert.equal(first.status, 200);
      assert.equal(first.headers.get('cache-control'), cache === 'revalidate' ? 'public, max-age=0, must-revalidate' : 'no-store');
      if (cache === 'revalidate') {
        assert.ok(first.headers.get('etag'));
        const second = await fetch(`${base}/dados`, { headers: { 'If-None-Match': first.headers.get('etag') } });
        assert.equal(second.status, 304);
        assert.equal(await second.text(), '');
        assert.equal((await fetch(`${base}/ausente`)).status, 404);
      }
    } finally {
      const closed = once(server, 'close');
      server.close(); server.closeAllConnections(); await closed;
    }
  }
});
