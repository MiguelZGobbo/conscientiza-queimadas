import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const contentTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const port = Number(process.env.PORT || 4173);

createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const extension = relativePath.slice(relativePath.lastIndexOf('.'));
  const allowed = relativePath === 'index.html' || /^src\/[\w/-]+\.(css|js|svg)$/.test(relativePath);

  if (!allowed || !['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(404).end('Página não encontrada.');
    return;
  }

  try {
    const file = await readFile(fileURLToPath(new URL(relativePath, root)));
    response.writeHead(200, {
      'Content-Type': `${contentTypes[extension]}; charset=utf-8`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : file);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Não foi possível abrir a página.');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Home: http://127.0.0.1:${port}`);
});
