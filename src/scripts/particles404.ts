// 404: las partículas forman "404". El mouse las aparta y un clic las hace explotar y volver.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { isSoftwareRenderer } from './gpu';

const vertexShader = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aSpeed;
  attribute float aRand;
  varying float vSpeed;
  varying float vRand;
  void main() {
    vSpeed = aSpeed;
    vRand = aRand;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * uPixelRatio * (0.7 + aRand * 0.6) * (1.0 + smoothstep(4.0, 30.0, aSpeed) * 0.9);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vSpeed;
  varying float vRand;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.05, d);
    // Quietas: blanco cálido con algunas naranjas. En movimiento se "encienden".
    // El color usa otro "dado" que el tamaño: si no, los naranjas serían justo los más grandes
    float heat = clamp(step(0.9, fract(vRand * 7.31)) + smoothstep(4.0, 20.0, vSpeed), 0.0, 1.0);
    gl_FragColor = vec4(mix(uColorB, uColorA, heat), alpha * 0.95);
  }
`;

function cssColor(name: string) {
  return new Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
}

// Puntos sobre la forma del texto, dibujado en un canvas fuera de pantalla.
// `pick` y `jitter` son fijos por partícula: al redimensionar, cada punto conserva su lugar
// relativo en el texto y solo se reescala (si se sorteara de nuevo, todos saldrían volando).
function sampleText(text: string, width: number, height: number, pick: Float32Array, jitter: Float32Array) {
  const count = pick.length;
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.floor(height * 0.95)}px Inter Variable, Inter, system-ui, sans-serif`;
  ctx.fillText(text, width / 2, height / 2 + height * 0.04);
  const data = ctx.getImageData(0, 0, width, height).data;
  const filled: number[] = [];
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (data[(y * width + x) * 4 + 3] > 128) filled.push(x, y);
    }
  }
  const out = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const k = Math.floor(pick[i] * (filled.length / 2)) * 2;
    out[i * 2] = filled[k] - width / 2 + jitter[i * 2];
    out[i * 2 + 1] = height / 2 - filled[k + 1] + jitter[i * 2 + 1];
  }
  return out;
}

interface Options {
  canvas: HTMLCanvasElement;
  onBurst?: (count: number) => void;
}

export async function init404({ canvas, onBurst }: Options): Promise<boolean> {
  if (isSoftwareRenderer()) return false;
  await document.fonts.ready;

  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = mobile ? 2600 : 5200;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
  const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
  renderer.setPixelRatio(pixelRatio);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10);

  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 2);
  const speed = new Float32Array(count);
  const rand = new Float32Array(count);
  let target = new Float32Array(count * 2);
  const pick = new Float32Array(count);
  const jitter = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    rand[i] = Math.random();
    pick[i] = Math.random();
    jitter[i * 2] = (Math.random() - 0.5) * 2;
    jitter[i * 2 + 1] = (Math.random() - 0.5) * 2;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(pos, 3));
  geometry.setAttribute('aSpeed', new BufferAttribute(speed, 1));
  geometry.setAttribute('aRand', new BufferAttribute(rand, 1));
  const uniforms = {
    uSize: { value: mobile ? 2.6 : 2.9 },
    uPixelRatio: { value: pixelRatio },
    uColorA: { value: cssColor('--accent') },
    uColorB: { value: new Color('#fff3e8') },
  };
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const applyTheme = () => {
    const light = document.documentElement.classList.contains('light');
    uniforms.uColorA.value = cssColor('--accent');
    uniforms.uColorB.value = new Color(light ? '#3b2a1c' : '#fff3e8');
    material.blending = light ? NormalBlending : AdditiveBlending;
  };
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // El "404" se adapta al ancho. Solo se recalcula si cambia el ancho: en el celular la barra
  // de direcciones dispara `resize` al hacer scroll y cambia solo el alto.
  let w = 0;
  let h = 0;
  const layout = () => {
    if (Math.abs(canvas.clientWidth - w) < 2 && Math.abs(canvas.clientHeight - h) < 2) return;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.left = -w / 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
    const textW = Math.min(w * 0.9, 900);
    target = sampleText('404', Math.round(textW), Math.round(textW * 0.42), pick, jitter);
  };
  layout();
  // Arranque: los puntos llegan desde todos lados
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.max(w, h) * (0.6 + Math.random() * 0.4);
    pos[i * 3] = reduced ? target[i * 2] : Math.cos(a) * r;
    pos[i * 3 + 1] = reduced ? target[i * 2 + 1] : Math.sin(a) * r;
  }
  window.addEventListener('resize', layout);

  const mouse = { x: 1e6, y: 1e6 };
  const toLocal = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left - w / 2, y: h / 2 - (e.clientY - r.top) };
  };
  window.addEventListener('pointermove', (e) => Object.assign(mouse, toLocal(e)), { passive: true });
  window.addEventListener('pointerleave', () => Object.assign(mouse, { x: 1e6, y: 1e6 }));

  let bursts = 0;
  canvas.addEventListener('pointerdown', (e) => {
    const p = toLocal(e);
    for (let i = 0; i < count; i++) {
      const dx = pos[i * 3] - p.x;
      const dy = pos[i * 3 + 1] - p.y;
      const d = Math.hypot(dx, dy) + 1;
      // Más fuerte cerca del clic; el azar hace que no salgan todas iguales
      const f = (600 + 2600 * Math.exp(-d / 380)) * (0.5 + Math.random());
      vel[i * 2] += (dx / d) * f;
      vel[i * 2 + 1] += (dy / d) * f;
    }
    bursts++;
    onBurst?.(bursts);
  });

  let last = performance.now();
  const frame = (now: number) => {
    // El timestamp de rAF puede ser anterior a performance.now(): nunca dejar que dt sea negativo
    const dt = Math.min(0.033, Math.max(0, (now - last) / 1000));
    last = Math.max(last, now);
    const t = now / 1000;
    const radius = mobile ? 70 : 110;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iv = i * 2;
      let x = pos[ix];
      let y = pos[ix + 1];
      // Resorte hacia su lugar en el "404", con un leve temblor (señal GPS que oscila)
      const tx = target[iv] + Math.sin(t * 1.7 + rand[i] * 40) * 1.2;
      const ty = target[iv + 1] + Math.cos(t * 1.3 + rand[i] * 30) * 1.2;
      let vx = vel[iv] + (tx - x) * 9 * dt * 6;
      let vy = vel[iv + 1] + (ty - y) * 9 * dt * 6;
      // El mouse aparta los puntos cercanos
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < radius * radius) {
        const d = Math.sqrt(d2) + 0.001;
        const f = (1 - d / radius) * 2600 * dt;
        vx += (dx / d) * f;
        vy += (dy / d) * f;
      }
      vx *= 0.9;
      vy *= 0.9;
      x += vx * dt;
      y += vy * dt;
      pos[ix] = x;
      pos[ix + 1] = y;
      vel[iv] = vx;
      vel[iv + 1] = vy;
      speed[i] = Math.hypot(vx, vy) * 0.05;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aSpeed.needsUpdate = true;
    renderer.render(scene, camera);
    if (!document.hidden) requestAnimationFrame(frame);
  };
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });
  requestAnimationFrame(frame);
  return true;
}
