const MAX_FILE = 5 * 1024 * 1024;
const MAX_BODY = MAX_FILE + 64 * 1024;
const TOPICS = new Set(['', 'procurement', 'esg', 'decisao', 'energia', 'domotica', 'engenharia', 'especialidade', 'telecom', 'energia_iot', 'vetia', 'medreminder', 'outro']);
const FIELDS = new Set(['form-name', 'bot-field', 'nome', 'empresa', 'email', 'assunto', 'servico', 'mensagem', 'consentimento', 'fatura_mensal', 'fatura']);
const reject = status => new Response('Pedido recusado.', { status, headers: {
  'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
} });
const clean = (value, multiline = false) => value.normalize('NFC').replace(/\r\n?/g, '\n')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>]/g, '')
  .replace(multiline ? /\u0000/g : /[\n\t]/g, ' ').trim();

export default async function contactGuard(request, context) {
  if (request.method !== 'POST') return;
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return reject(403);
  const type = request.headers.get('content-type') || '';
  if (!/^(multipart\/form-data|application\/x-www-form-urlencoded)(;|$)/i.test(type)) return reject(415);
  if (Number(request.headers.get('content-length')) > MAX_BODY) return reject(413);
  try {
    const reader = request.body?.getReader();
    if (!reader) return reject(400);
    let size = 0;
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) { await reader.cancel(); return reject(413); }
      chunks.push(value);
    }
    const data = await new Request(request.url, { method: 'POST', headers: { 'content-type': type }, body: new Blob(chunks) }).formData();
    for (const key of data.keys()) if (!FIELDS.has(key) || data.getAll(key).length !== 1) return reject(400);
    if (data.get('form-name') !== 'contacto' || data.get('consentimento') !== 'sim') return reject(400);
    if (data.get('bot-field')) return reject(403);
    for (const [key, max] of [['nome',120], ['empresa',160], ['email',254], ['mensagem',5000]]) {
      const value = data.get(key) ?? '';
      if (typeof value !== 'string' || value.length > max) return reject(400);
      data.set(key, clean(value, key === 'mensagem'));
    }
    if (!data.get('nome') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.get('email'))) return reject(400);
    if (!TOPICS.has(data.get('assunto') ?? '')) return reject(400);
    data.set('servico', data.get('assunto') ?? '');
    const bill = data.get('fatura_mensal');
    if (bill && (!/^\d{3,5}$/.test(bill) || Number(bill) < 500 || Number(bill) > 50000 || Number(bill) % 500)) return reject(400);
    const file = data.get('fatura');
    if (file && typeof file !== 'string' && file.name) {
      if (!file.size) return reject(400);
      if (data.get('assunto') !== 'procurement' || !/\.pdf$/i.test(file.name) || /[\u0000-\u001F<>]/.test(file.name) || file.size > MAX_FILE || (file.type && file.type !== 'application/pdf')) return reject(400);
      if (new TextDecoder().decode(await file.slice(0,5).arrayBuffer()) !== '%PDF-') return reject(400);
    } else if (typeof file === 'string' && file) return reject(400);
    else data.delete('fatura');
    const headers = new Headers(request.headers);
    headers.delete('content-type');
    headers.delete('content-length');
    return context.next(new Request(request.url, { method: 'POST', headers, body: data }));
  } catch { return reject(400); }
}
export const config = { path: '/*' };
