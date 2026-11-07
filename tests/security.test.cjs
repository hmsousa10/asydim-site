const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const loadGuard = () => import(pathToFileURL(path.join(root, 'netlify/edge-functions/contact-guard.js')).href);
function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({ 'form-name':'contacto', 'bot-field':'', nome:'QA', email:'qa@example.com', empresa:'', assunto:'procurement', servico:'procurement', mensagem:'Pedido', consentimento:'sim', fatura_mensal:'5000' })) data.set(key, value);
  return data;
}
async function submit(data, headers = {}) {
  const { default: guard } = await loadGuard();
  let forwarded;
  const response = await guard(new Request('https://www.asydim.pt/', { method:'POST', body:data, headers }), { next: async req => { forwarded = await req.formData(); return new Response('accepted'); } });
  return { response, forwarded };
}
test('valid PDF forwards sanitised text to Netlify', async () => {
  const data = form(); data.set('nome', '  QA\u0000<>  '); data.set('mensagem', 'linha 1\r\nlinha 2');
  data.set('fatura', new File(['%PDF-1.4\nfixture'], 'invoice.pdf', { type:'application/pdf' }));
  const { response, forwarded } = await submit(data);
  assert.equal(response.status, 200); assert.equal(forwarded.get('nome'), 'QA');
  assert.equal(forwarded.get('mensagem').replace(/\r\n/g, '\n'), 'linha 1\nlinha 2'); assert.equal(forwarded.get('fatura').name, 'invoice.pdf');
});
test('rejects honeypot, missing consent, duplicate fields and cross-site requests', async () => {
  for (const change of [data => data.set('bot-field','bot'), data => data.delete('consentimento'), data => data.append('email','other@example.com')]) {
    const data = form(); change(data); const result = await submit(data); assert(result.response.status >= 400); assert.equal(result.forwarded, undefined);
  }
  assert.equal((await submit(form(), { origin:'https://other.example' })).response.status, 403);
});
test('rejects disguised files, images, empty PDFs and PDFs above 5 MB', async () => {
  for (const file of [new File(['HTML'], 'bad.pdf', {type:'application/pdf'}), new File(['%PDF-1.4'], 'bad.png', {type:'image/png'}), new File([], 'empty.pdf', {type:'application/pdf'}), new File(['%PDF-', new Uint8Array(5*1024*1024)], 'large.pdf', {type:'application/pdf'})]) {
    const data = form(); data.set('fatura',file); const result = await submit(data);
    assert.equal(result.response.status, 400, file.name); assert.equal(result.forwarded, undefined);
  }
});
test('rejects oversize and malformed requests; GET passes through', async () => {
  const { default: guard } = await loadGuard();
  assert.equal(await guard(new Request('https://www.asydim.pt/'), {}), undefined);
  assert.equal((await guard(new Request('https://www.asydim.pt/', {method:'POST',body:'{}',headers:{'content-type':'application/json'}}), {})).status,415);
  assert.equal((await guard(new Request('https://www.asydim.pt/', {method:'POST',body:'x',headers:{'content-type':'multipart/form-data','content-length':'99999999'}}), {})).status,413);
});
test('production publishes only public assets without inline code or maps', () => {
  const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(item => item.isDirectory() ? walk(path.join(dir,item.name)) : [path.join(dir,item.name)]);
  const files = walk(path.join(root,'dist'));
  assert(!files.some(f => /(?:\.map$|package(?:-lock)?\.json$|README\.md$|netlify\.toml$|\.env$)/.test(f)));
  for (const f of files.filter(f=>f.endsWith('.html'))) assert(!/<!--|\son\w+\s*=|\sstyle\s*=|<style\b|name=["']generator["']/i.test(fs.readFileSync(f,'utf8')),f);
  for (const f of files.filter(f=>f.endsWith('.js'))) assert(!/sourceMappingURL|console\.(log|debug|warn)\s*\(/.test(fs.readFileSync(f,'utf8')),f);
  const headers = fs.readFileSync(path.join(root,'_headers'),'utf8');
  assert(headers.includes("script-src-attr 'none'")); assert(headers.includes("style-src-attr 'none'"));
  assert(!headers.includes('unsafe-inline')); assert(!headers.includes('unsafe-eval'));
  const security = fs.readFileSync(path.join(root,'.well-known/security.txt'),'utf8');
  assert.match(security,/^Contact: mailto:info@asydim.pt\r?$/m); assert.match(security,/^Expires: 2027-/m);
});
