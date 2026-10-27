// Genera la imagen para compartir de cada página de proyecto: le saca una foto a /og-card/<proyecto>-<idioma>/
// con el Chrome instalado. Igual que los PDF del CV, se escriben en dist/ y en public/ (para subirlas al
// repo: en Cloudflare no hay Chrome). Al final borra /og-card/ del sitio publicado.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findChrome, serve } from './chrome.mjs';

export default function ogProjects() {
  let publicDir;
  return {
    name: 'og-projects',
    hooks: {
      'astro:config:done': ({ config }) => {
        publicDir = fileURLToPath(config.publicDir);
      },
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const cardsDir = path.join(root, 'og-card');
        if (!fs.existsSync(cardsDir)) return;
        const cards = fs.readdirSync(cardsDir);
        const chrome = findChrome();
        if (!chrome) {
          logger.warn('No se encontró Chrome: se usan las imágenes ya guardadas en public/og/projects/.');
        } else {
          const { default: puppeteer } = await import('puppeteer-core');
          const server = await serve(root);
          const { port } = server.address();
          const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
          try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1200, height: 630 });
            for (const card of cards) {
              await page.goto(`http://127.0.0.1:${port}/og-card/${card}/`, { waitUntil: 'networkidle0' });
              await page.evaluateHandle('document.fonts.ready');
              const jpg = await page.screenshot({ type: 'jpeg', quality: 88 });
              for (const base of [root, publicDir]) {
                const out = path.join(base, 'og', 'projects', `${card}.jpg`);
                fs.mkdirSync(path.dirname(out), { recursive: true });
                fs.writeFileSync(out, jpg);
              }
            }
            logger.info(`${cards.length} imágenes en og/projects/`);
          } finally {
            await browser.close();
            server.close();
          }
        }
        fs.rmSync(cardsDir, { recursive: true, force: true });
      },
    },
  };
}
