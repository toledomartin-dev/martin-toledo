import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cvPdf from './integrations/cv-pdf.mjs';
import ogProjects from './integrations/og-projects.mjs';

export default defineConfig({
  site: 'https://martin-toledo.pages.dev',
  trailingSlash: 'always', // Cloudflare redirige /cv → /cv/: los links ya van con barra
  // Los casos de Entaxi y GPS pasaron a ser páginas de proyecto (public/_redirects hace lo mismo con 301 en Cloudflare)
  redirects: {
    '/caso-entaxi/': '/proyectos/entaxi/',
    '/en/entaxi-case-study/': '/en/projects/entaxi/',
    '/caso-gps/': '/proyectos/gps-colectivos/',
    '/en/gps-case-study/': '/en/projects/bus-gps/',
  },
  integrations: [sitemap({ filter: (page) => !/caso-entaxi|entaxi-case-study|caso-gps|gps-case-study|og-card/.test(page) }), cvPdf(), ogProjects()],
  markdown: {
    // Código de las notas con tema claro y oscuro: global.css elige cuál mostrar según el tema
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark-dimmed' }, wrap: false },
  },
  vite: {
    plugins: [tailwindcss()],
    build: { chunkSizeWarningLimit: 600 }, // Three.js se carga aparte, solo en el hero
  },
});
