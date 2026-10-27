import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createStaticServer } from '../../scripts/dev-server.mjs';

export async function withPublicationServer(prefix, run, headers = {}) {
  const root = fileURLToPath(new URL('../../dist/', import.meta.url));
  // Apenas o subconjunto /* usado pelo projeto; não é um emulador do Pages.
  const lines = (await readFile(new URL('../../dist/_headers', import.meta.url), 'utf8')).trim().split(/\r?\n/);
  assert.equal(lines.shift(), '/*', 'Regra única esperada em _headers.');
  const distributedHeaders = {};
  for (const line of lines) {
    assert.ok(line.length < 2000, 'Linha de _headers excede o limite.');
    const match = /^\s+([\w-]+):\s+(.+)$/.exec(line);
    assert.ok(match, 'Sintaxe inesperada em _headers.');
    const name = match[1].toLowerCase();
    assert.equal(distributedHeaders[name], undefined, 'Cabeçalho duplicado.');
    distributedHeaders[name] = match[2];
  }
  const server = createStaticServer({ root, prefix });
  server.prependListener('request', (_request, response) => {
    for (const [name, value] of Object.entries({ ...distributedHeaders, ...headers })) response.setHeader(name, value);
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try { await run(`http://127.0.0.1:${server.address().port}${prefix}`); }
  finally {
    const closed = new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    // A página ainda existe na fixture; liberar também suas conexões persistentes.
    server.closeAllConnections();
    await closed;
  }
}
