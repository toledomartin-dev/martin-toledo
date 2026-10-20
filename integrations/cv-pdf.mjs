// Genera los PDF del CV al terminar el build, imprimiendo /cv y /en/resume con el Chrome instalado.
// Los PDF se escriben en dist/ (para el sitio) y en public/ (para subirlos al repo: en Cloudflare
// no hay Chrome, así que allá se usan los que ya están commiteados).
// Ruta de Chrome personalizada: variable de entorno CHROME_PATH.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CV_FILES = [
  { page: '/cv/', file: 'cv/martin-toledo-cv-es.pdf' },
  { page: '/en/resume/', file: 'cv/martin-toledo-resume-en.pdf' },
];

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

// Servidor estático mínimo sobre dist/ (las rutas del sitio son absolutas, file:// no sirve)
function serve(root) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(root, url);
    if (!file.startsWith(root)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

export default function cvPdf() {
  let publicDir;
  return {
    name: 'cv-pdf',
    hooks: {
      'astro:config:done': ({ config }) => {
        publicDir = fileURLToPath(config.publicDir);
      },
      'astro:build:done': async ({ dir, logger }) => {
        const chrome = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
        if (!chrome) {
          logger.warn('No se encontró Chrome: se usan los PDF del CV ya guardados en public/cv/.');
          return;
        }
        const { default: puppeteer } = await import('puppeteer-core');
        const root = fileURLToPath(dir);
        const server = await serve(root);
        const { port } = server.address();
        const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
        try {
          for (const { page: route, file } of CV_FILES) {
            const page = await browser.newPage();
            await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle0' });
            await page.evaluateHandle('document.fonts.ready');
            const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
            await page.close();
            for (const base of [root, publicDir]) {
              const out = path.join(base, file);
              fs.mkdirSync(path.dirname(out), { recursive: true });
              fs.writeFileSync(out, pdf);
            }
            logger.info(`${file} (${Math.round(pdf.length / 1024)} KB)`);
          }
        } finally {
          await browser.close();
          server.close();
        }
      },
    },
  };
}
