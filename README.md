# martin-toledo — portfolio

Sitio personal hecho con [Astro](https://astro.build), Tailwind CSS y Three.js, en español (`/`) e inglés (`/en/`).

## Comandos

```bash
npm install      # una sola vez
npm run dev      # servidor local en http://localhost:4321
npm run build    # genera el sitio en dist/
```

## Dónde se edita cada cosa

- **Textos (los dos idiomas):** `src/i18n/content.ts`.
- **Proyectos (grilla bento con mini interfaces):** `src/components/Bento.astro`.
- **Hero de partículas:** `src/components/Hero.astro` (textos y scroll) y `src/scripts/particles.ts` (Three.js).
- **Caso de estudio de Entaxi:** `src/components/CaseStudy.astro`.
- **CV imprimible (`/cv` y `/en/resume`):** contenido en `src/i18n/cv.ts`, diseño en `src/components/CvPage.astro`.
  Los PDF (`public/cv/*.pdf`) se generan solos en cada `npm run build` con el Chrome instalado
  (integración `integrations/cv-pdf.mjs`, usa `puppeteer-core`). Commitealos: en Cloudflare no hay Chrome
  y el build usa los que están en el repo. Ruta de Chrome distinta: variable `CHROME_PATH`.
- **Colores y efectos (vidrio, brillos, animaciones):** `src/styles/global.css`.

## El mapa de Córdoba

Los puntos del hero salen de las avenidas reales de OpenStreetMap (© OpenStreetMap contributors, ODbL).
Están ya generados en `public/data/`. Para regenerarlos, bajá la query que figura en `scripts/build-map.py`
desde https://overpass-api.de y corré:

```bash
python -I scripts/build-map.py ruta/al/export.json
```

## Rendimiento

- Three.js (~130 KB comprimido) se carga recién después de la primera pintura y solo para el hero.
- La animación se pausa fuera de pantalla y con la pestaña oculta.
- Si el equipo dibuja lento, baja la calidad sola; sin GPU (render por software) no se carga.
- Respeta "reducir movimiento" del sistema operativo.

## Imágenes

- **Foto:** `public/img/foto.jpg` (avatar), `foto-about.jpg` (Sobre mí) y `foto-full.jpg` (se abre al tocarlas).
- **Imagen para compartir el link (1200x630):** `public/og/og-es.jpg` y `og-en.jpg`, generadas con `scripts/og-image.html`.
- **Favicon:** `public/favicon.svg` es la fuente; `favicon.ico`, `apple-touch-icon.png` e `icon-*.png` salen de él.

## Publicación

Publicado en **https://martin-toledo.pages.dev** con Cloudflare Pages (preset Astro, `npm run build`, salida `dist`,
variable `NODE_VERSION=22`). Cada push a `main` se publica solo. Si cambia el dominio, actualizar `site` en
`astro.config.mjs` y volver a correr `npm run build` para regenerar los PDF.
