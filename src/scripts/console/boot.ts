// Encendido de la consola: miles de partículas llegan en remolino desde los bordes y se juntan
// dibujando el logo (la M que termina en un pin). Al empezar, estallan hacia afuera y se apagan.
// Apagado: el logo arranca armado, gira y se contrae hacia el centro hasta desaparecer.
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer } from 'three';
import { getGpuContext } from '../gpu';

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uForm;
  uniform float uExplode;
  uniform float uShrink;
  uniform float uIntro;
  uniform float uPixelRatio;
  uniform float uSize;

  attribute vec3 aStart;
  attribute vec3 aTarget;
  attribute float aRand;
  attribute float aKind;

  varying float vAlpha;
  varying float vKind;

  void main() {
    // Cada partícula sale con su propio retraso: el logo se arma de a poco, no de golpe
    float p = smoothstep(0.0, 1.0, clamp(uForm * 1.7 - aRand * 0.7, 0.0, 1.0));
    float mid = p * (1.0 - p) * 4.0;
    vec3 swirl = vec3(
      sin(aRand * 41.0 + uTime * 1.4),
      cos(aRand * 29.0 + uTime * 1.1),
      sin(aRand * 17.0 + uTime)
    ) * mid * 0.8;

    // Ya formado, cada punto tiembla apenas, como si estuviera vivo
    vec3 shimmer = vec3(sin(uTime * 2.1 + aRand * 30.0), cos(uTime * 1.7 + aRand * 22.0), 0.0) * 0.012 * p;
    vec3 pos = mix(aStart, aTarget, p) + swirl + shimmer;

    // Estallido final: hacia afuera desde el centro, cada una a su velocidad
    vec3 dir = normalize(aTarget + vec3(sin(aRand * 13.0), cos(aRand * 7.0), aRand - 0.5) * 0.6);
    pos += dir * uExplode * uExplode * (3.0 + aRand * 5.0);

    // Apagado: gira y se contrae hacia el centro, cada partícula a su ritmo
    float k = clamp(uShrink * (1.0 + aRand * 0.6), 0.0, 1.0);
    float ang = k * k * 4.0;
    pos.xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * pos.xy;
    pos *= 1.0 - k * k;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float size = aKind == 2.0 ? 0.7 : (aKind == 1.0 ? 1.25 : 1.0);
    gl_PointSize = uSize * size * uPixelRatio * (1.0 + mid * 0.8) / -mv.z;

    // uIntro: al arrancar las partículas aparecen de a poco, no de golpe
    vAlpha = (0.25 + 0.75 * p) * (1.0 - uExplode) * (1.0 - k) * uIntro;
    vKind = aKind;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uRoute;
  uniform vec3 uPin;
  uniform vec3 uRing;
  varying float vAlpha;
  varying float vKind;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float soft = smoothstep(0.5, 0.0, d);
    vec3 color = vKind == 1.0 ? uPin : (vKind == 2.0 ? uRing : uRoute);
    gl_FragColor = vec4(color, soft * vAlpha);
  }
`;

// Puntos a lo largo de un trazo del SVG del logo (en coordenadas 0–32), con un poco de grosor
function sample(path: SVGGeometryElement, count: number, thickness: number) {
  const length = path.getTotalLength();
  const out: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const p = path.getPointAtLength(Math.random() * length);
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * thickness;
    out.push([p.x + Math.cos(a) * r, p.y + Math.sin(a) * r]);
  }
  return out;
}

export interface Boot {
  /** Se resuelve cuando el logo terminó de formarse */
  formed: Promise<void>;
  /** Estalla, se apaga y libera la placa de video */
  explode: () => Promise<void>;
}

/**
 * `shutdown: true` arranca con el logo ya armado y lo hace desaparecer solo:
 * `explode()` devuelve la promesa de cuando terminó (no hace falta llamarlo para que arranque).
 */
export function startBoot(canvas: HTMLCanvasElement, logo: SVGSVGElement, { shutdown = false } = {}): Boot | null {
  const gl = getGpuContext(canvas);
  if (!gl) return null;

  const route = logo.querySelector<SVGGeometryElement>('.logo-route');
  const pin = logo.querySelector<SVGGeometryElement>('.logo-pin');
  const ring = logo.querySelector<SVGGeometryElement>('circle');
  if (!route || !pin || !ring) return null;

  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const total = small ? 2600 : 5200;
  const groups: [SVGGeometryElement, number, number, number][] = [
    [route, 0.56, 0.75, 0], // la M
    [pin, 0.2, 0.55, 1], // el pin, en naranja
    [ring, 0.24, 0.25, 2], // el contorno, tenue
  ];

  const start = new Float32Array(total * 3);
  const target = new Float32Array(total * 3);
  const rand = new Float32Array(total);
  const kind = new Float32Array(total);
  const scale = 1.7 / 16; // el logo mide 32: queda de unas 3,4 unidades de ancho

  let i = 0;
  for (const [el, share, thickness, k] of groups) {
    const points = sample(el, Math.round(total * share), thickness);
    for (const [x, y] of points) {
      if (i >= total) break;
      target.set([(x - 16) * scale, -(y - 16) * scale, 0], i * 3);
      // Arrancan lejos, en una espiral alrededor de la pantalla
      const a = Math.random() * Math.PI * 2;
      const r = 4 + Math.random() * 4;
      start.set([Math.cos(a) * r, Math.sin(a) * r * 0.7, (Math.random() - 0.5) * 6], i * 3);
      rand[i] = Math.random();
      kind[i] = k;
      i++;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(target, 3));
  geometry.setAttribute('aTarget', new BufferAttribute(target, 3));
  geometry.setAttribute('aStart', new BufferAttribute(start, 3));
  geometry.setAttribute('aRand', new BufferAttribute(rand, 1));
  geometry.setAttribute('aKind', new BufferAttribute(kind, 1));
  geometry.setDrawRange(0, i);

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff7a1a';
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uForm: { value: 0 },
      uExplode: { value: 0 },
      uShrink: { value: 0 },
      uIntro: { value: shutdown ? 1 : 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uSize: { value: small ? 34 : 42 },
      uRoute: { value: new Color('#f1f2f4') },
      uPin: { value: new Color(accent) },
      uRing: { value: new Color('#5b6270') },
    },
  });

  const scene = new Scene();
  scene.add(new Points(geometry, material));
  const camera = new PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 7;

  const renderer = new WebGLRenderer({ canvas, context: gl, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // En pantallas angostas la cámara se aleja para que el logo entre entero
    camera.position.z = w < h ? 9 : 7;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  const FORM_MS = 2300;
  const t0 = performance.now();
  let explodeAt = 0;
  let running = true;
  let resolveFormed = () => {};
  const formed = new Promise<void>((r) => (resolveFormed = r));
  let resolveGone = () => {};
  const gone = new Promise<void>((r) => (resolveGone = r));

  const finish = () => {
    running = false;
    window.removeEventListener('resize', resize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    resolveGone();
  };

  const SHRINK_DELAY = 900; // primero se ve el logo armado mientras la pantalla se oscurece
  const SHRINK_MS = 1500;

  const frame = (now: number) => {
    if (!running) return;
    const t = now - t0;
    material.uniforms.uTime.value = t / 1000;
    if (shutdown) {
      material.uniforms.uForm.value = 1;
      resolveFormed();
      const k = Math.min(1, Math.max(0, (t - SHRINK_DELAY) / SHRINK_MS));
      material.uniforms.uShrink.value = k;
      if (k >= 1) return finish();
    } else {
      material.uniforms.uForm.value = Math.min(1, t / FORM_MS);
      const intro = Math.min(1, t / 1100);
      material.uniforms.uIntro.value = intro * intro;
      if (t >= FORM_MS) resolveFormed();
    }
    if (explodeAt) {
      const k = Math.min(1, (now - explodeAt) / 850);
      material.uniforms.uExplode.value = k;
      if (k >= 1) return finish();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  return {
    formed,
    explode: () => {
      if (!shutdown && !explodeAt) explodeAt = performance.now();
      return gone;
    },
  };
}
