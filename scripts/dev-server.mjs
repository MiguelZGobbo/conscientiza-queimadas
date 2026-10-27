import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative, extname, isAbsolute } from 'node:path';
import { publicFiles } from './preparar-publicacao.mjs';

const contentTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

// Somente ferramenta local: permite conferir a mesma distribuição em / e /projeto/.
export function createStaticServer({ root = fileURLToPath(new URL('../', import.meta.url)), prefix = '/' } = {}) {
  root = resolve(root);
  if (!/^\/(?:[\w-]+\/)*$/.test(prefix)) throw new Error('Prefixo inválido; use / ou /projeto/.');
  return createServer(async (request, response) => {
    async function sendFile(path, status) {
      const [rootPath, filePath] = await Promise.all([realpath(root), realpath(resolve(root, path))]);
      const contained = relative(rootPath, filePath);
      if (contained.startsWith('..') || isAbsolute(contained)) throw Object.assign(new Error('Fora da raiz.'), { code: 'ENOENT' });
      const file = await readFile(filePath);
      const extension = extname(path);
      response.writeHead(status, {
        'Content-Type': `${contentTypes[extension]}${extension === '.webp' ? '' : '; charset=utf-8'}`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(request.method === 'HEAD' ? undefined : file);
    }

    async function notFound() {
      try { await sendFile('404.html', 404); }
      catch { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end(request.method === 'HEAD' ? undefined : 'Página não encontrada.'); }
    }

    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { await notFound(); return; }
    let relativePath = pathname.startsWith(prefix) ? pathname.slice(prefix.length) || 'index.html' : '';
    // Alias local para exercitar os documentos; não simula redirects do Cloudflare.
    if (relativePath && publicFiles.includes(`${relativePath}.html`)) relativePath += '.html';

    if (!publicFiles.includes(relativePath) || relativePath === '_headers' || !['GET', 'HEAD'].includes(request.method)) {
      await notFound();
      return;
    }

    try {
      await sendFile(relativePath, 200);
    } catch (error) {
      if (error.code === 'ENOENT') await notFound();
      else response.writeHead(500).end('Não foi possível abrir a página.');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = {};
    const args = process.argv.slice(2);
    for (let index = 0; index < args.length; index += 2) {
      if (!['--root', '--prefix'].includes(args[index]) || !args[index + 1]) throw new Error('Uso: npm run dev -- [--root dist] [--prefix /projeto/]');
      options[args[index].slice(2)] = args[index + 1];
    }
    const server = createStaticServer(options);
    server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Home: http://127.0.0.1:${server.address().port}${options.prefix || '/'}`));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
