// Genera los PDF del CV al terminar el build, imprimiendo /cv y /en/resume con el Chrome instalado.
// Los PDF se escriben en dist/ (para el sitio) y en public/ (para subirlos al repo: en Cloudflare
// no hay Chrome, así que allá se usan los que ya están commiteados).
// Ruta de Chrome personalizada: variable de entorno CHROME_PATH.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findChrome, serve } from './chrome.mjs';

export const CV_FILES = [
  { page: '/cv/', file: 'cv/martin-toledo-cv-es.pdf' },
  { page: '/en/resume/', file: 'cv/martin-toledo-resume-en.pdf' },
];

export default function cvPdf() {
  let publicDir;
  return {
    name: 'cv-pdf',
    hooks: {
      'astro:config:done': ({ config }) => {
        publicDir = fileURLToPath(config.publicDir);
      },
      'astro:build:done': async ({ dir, logger }) => {
        const chrome = findChrome();
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
