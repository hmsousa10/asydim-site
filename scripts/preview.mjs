import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const headerText = await readFile(path.join(root, '_headers'), 'utf8');
const headers = Object.fromEntries(headerText.split('\n\n')[0].split('\n').slice(1).filter(Boolean).map(line => { const i = line.indexOf(':'); return [line.slice(0, i).trim(), line.slice(i + 1).trim()]; }));
const mime = { '.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.xml':'application/xml; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.webp':'image/webp', '.ico':'image/x-icon' };
http.createServer(async (req, res) => {
  let url;
  try { url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400, headers); return res.end(); }
  const file = path.resolve(root, '.' + (url === '/' ? '/index.html' : url));
  const safe = file.startsWith(root + path.sep) && !url.split('/').some(part => part.startsWith('.') && !(part === '.well-known' && url === '/.well-known/security.txt')) && !url.endsWith('.map') && !['/_headers','/_redirects'].includes(url);
  let data, status = 200;
  try { if (!safe || !(await stat(file)).isFile()) throw new Error(); data = await readFile(file); } catch { data = await readFile(path.join(root, '404.html')); status = 404; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { ...headers, Allow: 'GET, HEAD' }); return res.end(); }
  res.writeHead(status, { ...headers, 'Content-Type': status === 404 ? mime['.html'] : mime[path.extname(file)] || 'application/octet-stream' });
  res.end(req.method === 'HEAD' ? undefined : data);
}).listen(4174, '127.0.0.1', () => process.stdout.write('Production preview: http://127.0.0.1:4174/\n'));
