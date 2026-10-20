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

## Pendientes antes de publicar

- [ ] Foto: `public/img/foto.jpg` (cuadrada). Aparece como avatar junto a la ubicación en el hero.
- [ ] Link de GitHub en `site` (`src/i18n/content.ts`).

## Publicar en Cloudflare Pages

1. Crear un repo en GitHub y subir este proyecto.
2. En Cloudflare: Workers & Pages → Create → Pages → conectar el repo.
3. Framework preset: **Astro** · Build command: `npm run build` · Output: `dist`.
4. Cada push a `main` se publica solo. Si usás otro dominio, actualizá `site` en `astro.config.mjs`.
