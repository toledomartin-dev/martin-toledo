// Lo común al globo del hero: puntos sobre los continentes, las ciudades y la orientación.
// Lo usan la esfera provisoria (canvas 2D) y la de Three.js, así las dos coinciden.
import { isLand } from './land-mask';

const RAD = Math.PI / 180;
export const CORDOBA = { lat: -31.42, lon: -64.18 };
export const SAN_JUAN = { lat: -31.54, lon: -68.53 };

// Girar `spin` sobre el eje del planeta pone esa longitud de frente; inclinar `tilt` centra esa latitud
export const FOCUS_SPIN = -CORDOBA.lon * RAD;
export const FOCUS_TILT = CORDOBA.lat * RAD;
// Al cargar: Sudamérica a la vista, con Córdoba un poco a la izquierda para que el giro la acerque
export const START_SPIN = FOCUS_SPIN - 0.9;
export const IDLE_TILT = -0.32;

/** Punto de la esfera unitaria para una latitud y longitud (x = este, y = norte, z = hacia la cámara) */
export function toXYZ(lat: number, lon: number): [number, number, number] {
  const p = lat * RAD;
  const l = lon * RAD;
  return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
}

/** Gira sobre el eje del planeta y después inclina, igual que el shader: rotX(tilt) · rotY(spin) */
export function rotate([x, y, z]: number[], spin: number, tilt: number): [number, number, number] {
  const cs = Math.cos(spin);
  const ss = Math.sin(spin);
  const x1 = cs * x + ss * z;
  const z1 = -ss * x + cs * z;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return [x1, ct * y - st * z1, st * y + ct * z1];
}

/** `count` puntos repartidos parejo sobre los continentes (esfera de Fibonacci filtrada por la máscara) */
export function landPoints(count: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  let n = count * 4;
  for (;;) {
    const land: number[] = [];
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const x = Math.cos(golden * i) * r;
      const z = Math.sin(golden * i) * r;
      if (isLand(Math.asin(y) / RAD, Math.atan2(x, z) / RAD)) land.push(x, y, z);
    }
    const found = land.length / 3;
    if (found >= count) {
      // Submuestreo parejo para quedarse con exactamente `count`
      const out = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) out.set(land.slice(Math.floor((i * found) / count) * 3, Math.floor((i * found) / count) * 3 + 3), i * 3);
      return out;
    }
    n = Math.ceil(n * 1.5);
  }
}
