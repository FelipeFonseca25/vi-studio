import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'};
let lastSeen = Date.now();
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (pathname === '/api/check-text' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 65536) req.destroy(); });
    req.on('end', () => {
      try {
        const text = JSON.parse(body).text;
        if (typeof text !== 'string') throw Error('Invalid text');
        const normalized = text.toLowerCase().replace(/[^a-z0-9!@|]+/g, '');
        const allowed = ![/n[i1!|]gg+[e3]r/,/n[i1!|]gg+[a@]h?/].some(pattern => pattern.test(normalized));
        res.writeHead(200, {'Content-Type':'application/json'}).end(JSON.stringify({allowed}));
      } catch { res.writeHead(400).end(); }
    });
    return;
  }
  if (pathname === '/api/feedback') { res.writeHead(503, {'Content-Type':'application/json'}).end(JSON.stringify({error:'Feedback indisponível na versão local offline.'})); return; }
  if (pathname.startsWith('/_vercel/')) { res.writeHead(200, {'Content-Type':'text/javascript'}).end('/* Telemetria desativada na versão local. */'); return; }
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  if (pathname === '/heartbeat') { lastSeen = Date.now(); res.writeHead(204).end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) && file !== path.join(root,'index.html')) { res.writeHead(403).end(); return; }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404).end('Arquivo não encontrado'); return; }
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; img-src 'self' blob: data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
    if (req.method === 'HEAD') res.end(); else fs.createReadStream(file).pipe(res);
  });
});
server.listen(Number(process.env.PORT || 0), '127.0.0.1', () => {
  const url = `http://127.0.0.1:${server.address().port}`;
  console.log(`VI Studio: ${url}\nFeche esta janela para encerrar o servidor.`);
  if (process.argv.includes('--open') && process.platform === 'win32') {
    const candidates = [path.join(process.env['ProgramFiles(x86)'] || '', 'Microsoft/Edge/Application/msedge.exe'),path.join(process.env.ProgramFiles || '', 'Microsoft/Edge/Application/msedge.exe'),path.join(process.env.ProgramFiles || '', 'Google/Chrome/Application/chrome.exe')];
    const browser = candidates.find(p => fs.existsSync(p));
    if (browser) spawn(browser, [`--app=${url}`, '--new-window'], {detached:true, stdio:'ignore'}).unref();
    else spawn('rundll32.exe', ['url.dll,FileProtocolHandler',url], {detached:true,stdio:'ignore'}).unref();
  }
});
if (process.argv.includes('--open')) setInterval(() => { if (Date.now()-lastSeen > 180000) server.close(()=>process.exit(0)); },30000).unref();
