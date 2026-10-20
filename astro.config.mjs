import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cvPdf from './integrations/cv-pdf.mjs';

export default defineConfig({
  site: 'https://martin-toledo.pages.dev',
  trailingSlash: 'always', // Cloudflare redirige /cv → /cv/: los links ya van con barra
  integrations: [sitemap(), cvPdf()],
  markdown: {
    // Código de las notas con tema claro y oscuro: global.css elige cuál mostrar según el tema
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark-dimmed' }, wrap: false },
  },
  vite: {
    plugins: [tailwindcss()],
    build: { chunkSizeWarningLimit: 600 }, // Three.js se carga aparte, solo en el hero
  },
});
