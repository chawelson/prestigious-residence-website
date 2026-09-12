// Local-only preview and responsive QA. Never forwards an enquiry to Formspree.
// Start: node scripts/preview-server.mjs 4174
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.argv[2] || 4174);
let submissions = 0;
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };
const send = (res, status, body, type = 'text/html') => {
  res.writeHead(status, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store' });
  res.end(body);
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (req.method === 'POST') {
      if (url.pathname !== '/__qa/enquiry') return send(res, 405, 'Local test requests only');
      let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 100000) return send(res, 413, '{}', 'application/json'); }
      submissions += 1;
      console.log(`Simulated enquiry ${submissions}: ${url.searchParams.get('result') || 'success'}; no data forwarded or retained`);
      if (url.searchParams.get('result') === 'timeout') return setTimeout(() => send(res, 503, '{}', 'application/json'), 17000);
      if (url.searchParams.get('result') === 'error') return send(res, 503, '{"error":"Simulated failure"}', 'application/json');
      return setTimeout(() => send(res, 200, '{"ok":true}', 'application/json'), 900);
    }
    if (url.pathname === '/__qa') return send(res, 200, await readFile(resolve(root, 'tests/responsive.html')));
    if (url.pathname === '/__qa/count') return send(res, 200, JSON.stringify({ submissions }), 'application/json');
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    const path = resolve(root, `.${decodeURIComponent(pathname)}`);
    if (!path.startsWith(root) || pathname.split('/').some(segment => segment.startsWith('.'))) return send(res, 403, 'Forbidden');
    if (!(await stat(path)).isFile()) return send(res, 404, 'Not found');
    let data = await readFile(path);
    if (pathname === '/index.html') {
      const result = ['error', 'timeout'].includes(url.searchParams.get('result')) ? url.searchParams.get('result') : 'success';
      let page = data.toString().replace('action="https://formspree.io/f/xyknjkbk"', `action="/__qa/enquiry?result=${result}"`);
      // Non-PII event observation is local-only and visible in the test harness.
      page = page.replace('</head>', `<script>window.gtag = function(name,event){document.documentElement.dataset.lastEvent = event;document.documentElement.dataset.eventCount = String(Number(document.documentElement.dataset.eventCount||0)+1);if(new URLSearchParams(location.search).has('analytics_error'))throw new Error('Simulated analytics failure');};</script></head>`);
      if (url.searchParams.has('nojs')) page = page.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
      // Prevent any unconfigured third-party script from being accidentally enabled during QA.
      res.setHeader('Content-Security-Policy', "connect-src 'self'; form-action 'self'");
      data = page;
    }
    return send(res, 200, data, mime[extname(path)] || 'application/octet-stream');
  } catch { send(res, 404, 'Not found'); }
});
server.listen(port, '0.0.0.0', () => console.log(`Local preview: http://localhost:${port}/__qa — all form deliveries simulated`));
