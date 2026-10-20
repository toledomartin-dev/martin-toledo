import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cvPdf from './integrations/cv-pdf.mjs';

// Cambiar por el dominio definitivo cuando esté (ej. https://martintoledo.dev)
export default defineConfig({
  site: 'https://martin-toledo.pages.dev',
  integrations: [sitemap(), cvPdf()],
  vite: {
    plugins: [tailwindcss()],
    build: { chunkSizeWarningLimit: 600 }, // Three.js se carga aparte, solo en el hero
  },
});
