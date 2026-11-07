import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await mkdir(path.join(root, 'page-styles'), { recursive: true });
await mkdir(path.join(root, 'vendor'), { recursive: true });
const presentation = path.join(root, 'presentation.css');
let rules = await readFile(presentation, 'utf8').catch(() => '');
function styleClass(style) {
  const value = style.replaceAll('&amp;', '&').replaceAll('&quot;', '"').trim();
  const name = 's-' + createHash('sha256').update(value).digest('hex').slice(0, 12);
  if (!rules.includes('.' + name + ')')) rules += `:is(#asydim-inline#asydim-priority,.${name}){${value}}\n`;
  return name;
}
function secureLinks(text) {
  return text.replace(/<a\b[^>]*>/gi, tag => {
    if (!/target=(?:\\?")_blank(?:\\?")/i.test(tag)) return tag;
    if (/rel=(?:\\?")[^"\\]*(?:\\?")/i.test(tag)) return tag.replace(/rel=(\\?")([^"\\]*)(\\?")/i, (_, q, values) => `rel=${q}${[...new Set([...values.split(/\s+/), 'noopener', 'noreferrer'])].filter(Boolean).join(' ')}${q}`);
    return tag.replace(/>$/, ' rel="noopener noreferrer">');
  });
}
const htmlFiles = (await readdir(root)).filter(file => file.endsWith('.html'));
for (const file of htmlFiles) {
  let html = await readFile(path.join(root, file), 'utf8');
  html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<meta\b[^>]*name=["']generator["'][^>]*>/gi, '');
  let pageCss = '';
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => { pageCss += css + '\n'; return ''; });
  if (pageCss) {
    const cssName = file.replace(/\.html$/, '.css');
    await writeFile(path.join(root, 'page-styles', cssName), pageCss);
    html = html.replace('</head>', `<link rel="stylesheet" href="page-styles/${cssName}" />\n</head>`);
  }
  html = html.replace(/<[a-z][^>]*>/gi, tag => {
    tag = tag.replace(/\s+onerror="([^"]*)"/gi, (_, handler) => {
      const fallback = handler.includes("display='flex'") ? 'flex' : handler.includes("display='block'") ? 'block' : 'hide';
      return ` data-image-fallback="${fallback}"`;
    });
    tag = tag.replace(/\s+onmouseover="([^"]*)"/gi, (_, handler) => {
      const assignments = [...handler.matchAll(/this\.style\.(\w+)='([^']*)'/g)];
      if (!assignments.length) throw new Error('Unsupported hover handler');
      const css = assignments.map(([, key, value]) => key.replace(/[A-Z]/g, c => '-' + c.toLowerCase()) + ':' + value).join(';');
      const name = 'h-' + createHash('sha256').update(css).digest('hex').slice(0, 12);
      if (!rules.includes('.' + name + ')')) rules += `:is(#asydim-inline#asydim-priority,.${name}):hover{${css}}\n`;
      return ` data-hover-class="${name}"`;
    }).replace(/\s+onmouseout="[^"]*"/gi, '');
    const hover = tag.match(/ data-hover-class="([^"]+)"/);
    if (hover) {
      tag = tag.replace(hover[0], '');
      tag = /\sclass="/.test(tag) ? tag.replace(/\sclass="([^"]*)"/, (_, classes) => ` class="${classes} ${hover[1]}"`) : tag.replace(/\s*\/?>$/, end => ` class="${hover[1]}"${end}`);
    }
    if (/\son[a-z]+=/i.test(tag)) throw new Error(`Unhandled event handler in ${file}`);
    const style = tag.match(/\sstyle="([^"]*)"/i);
    if (style) {
      const name = styleClass(style[1]);
      tag = tag.replace(style[0], '');
      tag = /\sclass="/.test(tag) ? tag.replace(/\sclass="([^"]*)"/, (_, classes) => ` class="${classes} ${name}"`) : tag.replace(/\s*\/?>$/, end => ` class="${name}"${end}`);
    }
    return tag;
  });
  html = secureLinks(html);
  html = html.replace('https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js', 'vendor/email.js')
    .replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js', 'vendor/graphics.js')
    .replace('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js', 'vendor/network.js');
  if (!html.includes('href="presentation.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="presentation.css" />\n<script src="image-fallback.js"></script>\n</head>');
  await writeFile(presentation, rules);
  await writeFile(path.join(root, file), html.replace(/[ \t]+$/gm, '').replace(/\n[ \t]*\n[ \t]*\n/g, '\n\n'));
}
const jsFiles = ['script.js', 'enhancements.js', ...(await readdir(path.join(root, 'i18n'))).filter(f => f.endsWith('.js')).map(f => 'i18n/' + f)];
for (const file of jsFiles) {
  let js = await readFile(path.join(root, file), 'utf8');
  js = js.replace(/style="([^"]*)"/g, (_, style) => `class="${styleClass(style)}"`);
  js = secureLinks(js);
  const result = await minify(js, { mangle: false, compress: { defaults: false, pure_funcs: ['console.log', 'console.debug', 'console.warn'] }, format: { beautify: true, comments: false }, sourceMap: false });
  await writeFile(path.join(root, file), result.code + '\n');
}
await writeFile(presentation, rules);
const vendors = [
  ['@emailjs/browser/dist/email.min.js', 'email.js'],
  ['three/build/three.min.js', 'graphics.js'],
  ['vanta/dist/vanta.net.min.js', 'network.js']
];
for (const [input, output] of vendors) {
  const code = await readFile(path.join(root, 'node_modules', input), 'utf8');
  const result = await minify(code, { compress: { pure_funcs: ['console.log', 'console.debug', 'console.warn'] }, mangle: true, format: { comments: false }, sourceMap: false });
  await writeFile(path.join(root, 'vendor', output), result.code + '\n');
}
let licenses = '';
for (const name of ['@emailjs/browser', 'three', 'vanta']) {
  const dir = path.join(root, 'node_modules', name);
  const license = (await readdir(dir)).find(f => /^licen[cs]e(?:\.|$)/i.test(f));
  if (!license) throw new Error('Missing third-party license: ' + name);
  licenses += name + '\n' + await readFile(path.join(dir, license), 'utf8') + '\n\n';
}
await writeFile(path.join(root, 'vendor', 'LICENSES.txt'), licenses);
process.stdout.write(`Hardened ${htmlFiles.length} pages; externalised inline presentation and pinned browser libraries.\n`);
