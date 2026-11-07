import { readFile, writeFile, readdir, mkdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { minify } from 'terser';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.resolve(root, 'dist');
if (path.dirname(dist) !== root || path.basename(dist) !== 'dist') throw new Error('Invalid output directory');
await rm(dist, { recursive: true, force: true });
await mkdir(dist);
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
const pages = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, location]) => {
  const url = new URL(location);
  if (url.origin !== 'https://asydim.pt' || (url.pathname !== '/' && !/^\/[a-z0-9-]+\.html$/.test(url.pathname))) throw new Error('Unexpected public page in sitemap');
  return url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
}))];
if (!pages.includes('index.html')) throw new Error('Public page list is missing the home page');
const hashes = new Set();
for (const file of pages) {
  let html = await readFile(path.join(root, file), 'utf8');
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  if (/\son[a-z]+\s*=|\sstyle\s*=|<style\b/i.test(html)) throw new Error('Inline code requires migration: ' + file);
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\bsrc=/.test(match[1])) {
      if (!/type="application\/ld\+json"/.test(match[1])) throw new Error('Executable inline script: ' + file);
      hashes.add("'sha256-" + createHash('sha256').update(match[2]).digest('base64') + "'");
    }
  }
  if (/sourceMappingURL|name=["']generator["']/i.test(html)) throw new Error('Unexpected metadata: ' + file);
  await writeFile(path.join(dist, file), html);
}
await cp(path.join(root, 'images'), path.join(dist, 'images'), { recursive: true, filter: source => {
  const relative = path.relative(path.join(root, 'images'), source);
  if (!relative) return true;
  if (relative.split(path.sep).some(part => part.startsWith('.'))) return false;
  return !path.extname(source) || /\.(png|jpe?g|webp|gif|svg|avif|ico)$/i.test(source);
} });
for (const dir of ['page-styles', '.well-known']) await cp(path.join(root, dir), path.join(dist, dir), { recursive: true, filter: source => {
  const relative = path.relative(path.join(root, dir), source);
  return !relative || (dir === '.well-known' ? relative === 'security.txt' : /^[a-z0-9-]+\.css$/i.test(relative));
} });
for (const file of ['styles.css', 'presentation.css']) {
  const css = (await readFile(path.join(root, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
  await writeFile(path.join(dist, file), css);
}
for (const file of ['robots.txt', 'sitemap.xml']) await cp(path.join(root, file), path.join(dist, file));
await cp(path.join(root, 'public/404.html'), path.join(dist, '404.html'));
for (const dir of ['i18n', 'vendor']) await mkdir(path.join(dist, dir));
const scripts = ['script.js', 'enhancements.js', 'image-fallback.js'];
for (const dir of ['i18n', 'vendor']) for (const file of await readdir(path.join(root, dir))) {
  if (file.endsWith('.js')) scripts.push(dir + '/' + file);
}
for (const file of scripts) {
  const result = await minify(await readFile(path.join(root, file), 'utf8'), { compress: { pure_funcs: ['console.log', 'console.debug', 'console.warn'] }, mangle: { toplevel: false }, format: { comments: false }, sourceMap: false });
  await writeFile(path.join(dist, file), result.code + '\n');
}
await cp(path.join(root, 'vendor/LICENSES.txt'), path.join(dist, 'vendor/LICENSES.txt'));
for (const file of await readdir(path.join(dist, 'page-styles'))) {
  const css = (await readFile(path.join(dist, 'page-styles', file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
  await writeFile(path.join(dist, 'page-styles', file), css);
}
const csp = [
  "default-src 'self'", "script-src 'self' " + [...hashes].join(' '), "script-src-attr 'none'",
  "style-src 'self' https://fonts.googleapis.com", "style-src-attr 'none'",
  "font-src 'self' https://fonts.gstatic.com", "img-src 'self'", "connect-src 'self' https://api.emailjs.com",
  "object-src 'none'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'", "frame-src 'none'", "worker-src 'none'", "media-src 'none'", 'upgrade-insecure-requests'
].join('; ');
const headers = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY', 'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()',
  'Content-Security-Policy': csp,
  'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Resource-Policy': 'same-origin'
};
const text = '/*\n' + Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`).join('\n') + '\n\n/.well-known/security.txt\n  Content-Type: text/plain; charset=utf-8\n  Cache-Control: public, max-age=3600\n';
await writeFile(path.join(root, '_headers'), text);
await writeFile(path.join(dist, '_headers'), text);
const blocked = ['/.env', '/.env*', '/.git', '/.git/*', '/.gitignore', '/.DS_Store', '/.vscode', '/.vscode/*', '/.idea/*', '/package.json', '/package-lock.json', '/npm-shrinkwrap.json', '/pnpm-lock.yaml', '/yarn.lock', '/README.md', '/composer.json', '/composer.lock', '/netlify.toml', '/scripts/*', '/tests/*', '/node_modules/*', '/private/*', '/pdf_text.txt'];
const toml = '[build]\n  command = "npm run build"\n  publish = "dist"\n\n[build.environment]\n  NODE_VERSION = "22"\n\n' + blocked.map(from => `[[redirects]]\n  from = ${JSON.stringify(from)}\n  to = "/404.html"\n  status = 404\n  force = true\n`).join('\n');
await writeFile(path.join(root, 'netlify.toml'), toml);
process.stdout.write(`Production build: ${pages.length} pages, strict CSP, no source maps; only public files in dist.\n`);
