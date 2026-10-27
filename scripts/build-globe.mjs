// Genera la máscara de tierra del globo del hero (src/scripts/land-mask.ts): un bit por celda de 1°,
// 360 × 180, a partir de los continentes de Natural Earth (dominio público) en TopoJSON.
// Bajá land-110m.json del paquete world-atlas (https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json)
// y corré:  node scripts/build-globe.mjs ruta/a/land-110m.json

import fs from 'node:fs';

const topo = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const { scale, translate } = topo.transform;

// Arcos cuantizados y en deltas → coordenadas [lon, lat]
const arcs = topo.arcs.map((arc) => {
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
  });
});
const ring = (ids) =>
  ids.flatMap((id, i) => {
    const pts = id < 0 ? [...arcs[~id]].reverse() : arcs[id];
    return i ? pts.slice(1) : pts;
  });

const rings = topo.objects.land.geometries
  .flatMap((g) => (g.type === 'Polygon' ? [g.arcs] : g.arcs))
  .flatMap((polygon) => polygon.map(ring))
  .map((pts) => {
    const minLat = Math.min(...pts.map((p) => p[1]));
    const maxLat = Math.max(...pts.map((p) => p[1]));
    // Eurasia (por Chukotka) y Fiji cruzan el antimeridiano: saltan de 180° a -180° a mitad del
    // contorno. Se "desenrollan" para que la longitud sea continua (la Antártida, que rodea el polo, no)
    const crosses = minLat > -80 && pts.some((p, i) => i && Math.abs(p[0] - pts[i - 1][0]) > 180);
    if (!crosses) return { pts, minLat, maxLat, shifts: [0] };
    let off = 0;
    const unwrapped = pts.map(([x, y], i) => {
      if (i) {
        const dx = x - pts[i - 1][0];
        if (dx > 180) off -= 360;
        if (dx < -180) off += 360;
      }
      return [x + off, y];
    });
    return { pts: unwrapped, minLat, maxLat, shifts: [0, 360, -360] };
  });

// Par-impar: un punto está dentro de un contorno si cruza una cantidad impar de bordes
const inRing = (p, lon, lat) => {
  let odd = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i];
    const [xj, yj] = p[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) odd = !odd;
  }
  return odd;
};
// Tierra: cantidad impar de contornos que lo rodean (así los lagos quedan afuera). Un contorno
// desenrollado se prueba también con el punto corrido una vuelta
const inside = (lon, lat) => {
  let odd = false;
  for (const r of rings) {
    if (lat < r.minLat || lat > r.maxLat) continue;
    if (r.shifts.some((s) => inRing(r.pts, lon + s, lat))) odd = !odd;
  }
  return odd;
};

const W = 360;
const H = 180;
const bits = new Uint8Array((W * H) / 8);
let land = 0;
for (let row = 0; row < H; row++) {
  const lat = 89.5 - row;
  for (let col = 0; col < W; col++) {
    if (inside(col - 179.5, lat)) {
      const k = row * W + col;
      bits[k >> 3] |= 1 << (k & 7);
      land++;
    }
  }
}

const out = `// Generado por scripts/build-globe.mjs a partir de Natural Earth (dominio público). No editar a mano.
// Un bit por celda de 1°: fila 0 = latitud 89,5° N, columna 0 = longitud 179,5° O.
const MASK = '${Buffer.from(bits).toString('base64')}';

let bits: Uint8Array | null = null;

/** true si el punto (en grados) cae sobre tierra firme */
export function isLand(lat: number, lon: number) {
  bits ??= Uint8Array.from(atob(MASK), (c) => c.charCodeAt(0));
  const row = Math.min(${H - 1}, Math.max(0, Math.floor(90 - lat)));
  const col = (((Math.floor(lon + 180) % ${W}) + ${W}) % ${W});
  const k = row * ${W} + col;
  return ((bits[k >> 3] >> (k & 7)) & 1) === 1;
}
`;
fs.writeFileSync(new URL('../src/scripts/land-mask.ts', import.meta.url), out);
console.log(`land-mask.ts: ${land} de ${W * H} celdas son tierra (${((land / (W * H)) * 100).toFixed(1)} %)`);
