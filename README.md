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
- **Proyectos (grilla bento):** `src/components/Bento.astro`. Las mini interfaces animadas están en
  `src/components/mocks/` y se repiten arriba de cada página de proyecto (`ProjectVisual.astro`).
- **Hero de partículas:** `src/components/Hero.astro` (textos y scroll) y `src/scripts/particles.ts` (Three.js).
- **Páginas de proyecto (`/proyectos/…` y `/en/projects/…`):** un archivo por proyecto en `src/projects/`
  con los textos en los dos idiomas, el stack y el diagrama. El orden está en `src/projects/index.ts`.
  El diagrama animado (`src/components/ArchDiagram.astro`) toma la posición de cada nodo en el dibujo ancho
  (`at`, viewBox de 960 de ancho) y en el del celular (`m`, tres columnas en x = 60, 180 y 300), y el recorrido
  como una lista de pasos con las conexiones que se encienden (`-id` = en sentido inverso).
- **CV imprimible (`/cv` y `/en/resume`):** contenido en `src/i18n/cv.ts`, diseño en `src/components/CvPage.astro`.
  Los PDF (`public/cv/*.pdf`) se generan solos en cada `npm run build` con el Chrome instalado
  (integración `integrations/cv-pdf.mjs`, usa `puppeteer-core`). Commitealos: en Cloudflare no hay Chrome
  y el build usa los que están en el repo. Ruta de Chrome distinta: variable `CHROME_PATH`.
- **Colores y efectos (vidrio, brillos, animaciones, menús desplegables):** `src/styles/global.css`.
- **Sonidos (Web Audio, apagados por defecto):** `src/scripts/sound.ts`.
- **Caché offline:** `public/sw.js`. Si algo queda viejo en los navegadores, subir `VERSION`.

## El globo

Antes del mapa, el hero muestra la Tierra con puntos solo sobre los continentes. Sale de una máscara de
tierra de 1° (`src/scripts/land-mask.ts`, 360 × 180 bits) generada a partir de Natural Earth (dominio público).
Para regenerarla, bajá `land-110m.json` del paquete world-atlas
(https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json) y corré:

```bash
node scripts/build-globe.mjs ruta/a/land-110m.json
```

Las ciudades, la orientación inicial y el giro hasta Córdoba están en `src/scripts/globe.ts`.

## El mapa de Córdoba

Los puntos del hero salen de las avenidas reales de OpenStreetMap (© OpenStreetMap contributors, ODbL).
Están ya generados en `public/data/`. Para regenerarlos, bajá la query que figura en `scripts/build-map.py`
desde https://overpass-api.de y corré:

```bash
python -I scripts/build-map.py ruta/al/export.json
```

## Rendimiento

- Three.js (~130 KB comprimido) se carga recién después de la primera pintura y solo para el hero. Mientras
  tanto, un canvas 2D dibuja la misma esfera quieta.
- La animación se pausa fuera de pantalla y con la pestaña oculta.
- Si el equipo dibuja lento, baja la calidad sola; sin GPU (render por software) no se carga.
- Respeta "reducir movimiento" del sistema operativo.

## Imágenes

- **Foto:** `public/img/foto.jpg` (avatar), `foto-about.jpg` (Sobre mí) y `foto-full.jpg` (se abre al tocarlas).
- **Imagen para compartir el link (1200x630):** `public/og/og-es.jpg` y `og-en.jpg`, generadas con `scripts/og-image.html`.
- **Imagen para compartir cada proyecto:** `public/og/projects/<proyecto>-<idioma>.jpg`. Se generan solas en cada
  `npm run build` con el Chrome instalado (integración `integrations/og-projects.mjs`, a partir de `src/pages/og-card/`).
  Commitealas, igual que los PDF del CV.
- **Favicon:** `public/favicon.svg` es la fuente; `favicon.ico`, `apple-touch-icon.png` e `icon-*.png` salen de él.

## Publicación

Publicado en **https://martin-toledo.pages.dev** con Cloudflare Pages (preset Astro, `npm run build`, salida `dist`,
variable `NODE_VERSION=22`). Cada push a `main` se publica solo. Si cambia el dominio, actualizar `site` en
`astro.config.mjs` y volver a correr `npm run build` para regenerar los PDF.
