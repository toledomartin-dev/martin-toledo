// Hero de partículas: la Tierra dibujada con puntos que, con el scroll, gira hasta Córdoba, se acerca
// y se transforma en el mapa de la ciudad (avenidas reales de OpenStreetMap) con vehículos circulando
// que reportan su posición al servidor.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';
import { CORDOBA, FOCUS_SPIN, FOCUS_TILT, IDLE_TILT, SAN_JUAN, START_SPIN, landPoints, rotate, toXYZ } from './globe';

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uSpin;
  uniform float uTilt;
  uniform float uZoom;
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform float uAspect;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec2 uSphereOffset;
  uniform vec2 uMapOffset;
  uniform float uMapScale;

  attribute vec3 aSphere;
  attribute vec2 aMap;
  attribute float aRand;

  varying float vAlpha;
  varying float vHot;
  varying float vTint;
  varying float vMap;

  mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
  mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }

  void main() {
    // Globo: gira sobre su eje, se inclina y se acerca; los puntos "respiran" apenas
    float breathe = 1.0 + 0.02 * sin(uTime * 1.3 + aRand * 6.2831);
    float radius = 1.55 * uZoom;
    vec3 s = rotX(uTilt) * rotY(uSpin) * (aSphere * radius * breathe);

    // Mapa: plano inclinado que gira apenas
    float a = uTime * 0.02;
    vec2 m2 = mat2(cos(a), -sin(a), sin(a), cos(a)) * aMap * uMapScale;
    vec3 m = rotX(-1.0) * vec3(m2.x, m2.y, 0.0);

    // Transición escalonada por partícula, con un remolino a mitad de camino
    float p = smoothstep(0.0, 1.0, clamp(uMorph * 1.8 - aRand * 0.6, 0.0, 1.0));
    float mid = p * (1.0 - p) * 4.0;
    vec3 swirl = vec3(
      sin(aRand * 40.0 + uTime) * 0.9,
      cos(aRand * 33.0 + uTime * 0.8) * 0.6,
      sin(aRand * 27.0) * 0.9
    ) * mid;
    vec3 pos = mix(s, m, p) + swirl;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Desplazamiento en pantalla: globo y mapa pueden ubicarse distinto
    vec2 offset = mix(uSphereOffset, uMapOffset, smoothstep(0.0, 1.0, uMorph));
    gl_Position.xy += offset * gl_Position.w;

    // El mouse empuja los puntos (en espacio de pantalla)
    vec2 ndc = gl_Position.xy / gl_Position.w;
    vec2 d = ndc - uMouse;
    d.x *= uAspect;
    float dist = length(d);
    float force = uMouseStrength * smoothstep(0.32, 0.0, dist);
    vec2 push = normalize(d + 1e-5) * force * 0.11;
    push.x /= uAspect;
    gl_Position.xy += push * gl_Position.w;

    // Cara trasera del globo más tenue, para dar volumen
    float facing = clamp(s.z / radius * 0.5 + 0.5, 0.0, 1.0);
    vAlpha = mix(mix(0.12, 1.0, facing), 0.85, p);
    vHot = force;
    vTint = aRand;
    vMap = p;

    gl_PointSize = uSize * (0.6 + aRand * 0.8) * uPixelRatio * (1.0 + force * 1.2) / -mv.z;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;

  varying float vAlpha;
  varying float vHot;
  varying float vTint;
  varying float vMap;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.05, d);
    // Mayoría blanco cálido, unos pocos en el color de acento; el mouse los "enciende".
    // El naranja queda para lo que importa: Córdoba en el globo y los vehículos en el mapa
    vec3 color = mix(uColorB, uColorA, clamp(step(0.93, vTint) * (1.0 - vMap * 0.85) + vHot, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha * vAlpha * uOpacity);
  }
`;

// Sobre el globo: Córdoba y San Juan, el arco entre las dos y un haz de datos que sube "a la nube"
const globeVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSpin;
  uniform float uTilt;
  uniform float uZoom;
  uniform float uPixelRatio;
  uniform vec2 uOffset;
  attribute float aT;
  attribute float aKind; // 0 arco, 1 haz, 2 ciudad, 3 onda de la ciudad
  varying float vA;
  varying float vKind;

  mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
  mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }

  void main() {
    float radius = 1.55 * uZoom;
    vec3 p = rotX(uTilt) * rotY(uSpin) * (position * radius);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_Position.xy += uOffset * gl_Position.w;

    float a = 1.0;
    float size = 22.0;
    if (aKind < 0.5) {
      float d = fract(fract(uTime * 0.45) - aT);
      a = 0.35 + 0.65 * smoothstep(0.3, 0.0, d);
      size = 26.0 + 30.0 * smoothstep(0.12, 0.0, d);
    } else if (aKind < 1.5) {
      float d = fract(fract(uTime * 0.6 + 0.3) - aT);
      a = (0.2 + 0.8 * smoothstep(0.25, 0.0, d)) * (1.0 - aT * 0.7);
      size = 24.0 + 30.0 * smoothstep(0.1, 0.0, d);
    } else if (aKind < 2.5) {
      size = 64.0;
    } else {
      float pulse = fract(uTime * 0.7 + aT);
      a = 1.0 - pulse;
      size = 60.0 + 220.0 * pulse;
    }
    // Lo que queda del otro lado del planeta no se ve
    vA = a * smoothstep(-0.05, 0.25, p.z / radius);
    vKind = aKind;
    gl_PointSize = size * uPixelRatio / -mv.z;
  }
`;

const globeFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vA;
  varying float vKind;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float shape = vKind > 2.5 ? smoothstep(0.5, 0.44, d) * smoothstep(0.34, 0.42, d) : smoothstep(0.5, 0.0, d);
    vec3 color = uColor + (vKind > 1.5 && vKind < 2.5 ? smoothstep(0.25, 0.0, d) * 0.7 : 0.0);
    gl_FragColor = vec4(color, shape * vA * uOpacity);
  }
`;

const vehicleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uMapScale;
  uniform vec2 uMapOffset;
  attribute float aFade;
  varying float vFade;

  mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }

  void main() {
    float a = uTime * 0.02;
    vec2 m2 = mat2(cos(a), -sin(a), sin(a), cos(a)) * position.xy * uMapScale;
    vec3 m = rotX(-1.0) * vec3(m2.x, m2.y, 0.0);
    vec4 mv = modelViewMatrix * vec4(m, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_Position.xy += uMapOffset * gl_Position.w;
    vFade = aFade;
    gl_PointSize = (64.0 * aFade + 12.0) * uPixelRatio / -mv.z;
  }
`;

const vehicleFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor + core * core * 0.6, core * (0.35 + vFade * 0.65) * uOpacity);
  }
`;

// Reportes: una onda donde está el vehículo y un paquete que sube hasta el servidor
const pingVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uMapScale;
  uniform vec2 uMapOffset;
  attribute float aAlpha;
  attribute float aSize;
  attribute float aKind; // 0 paquete, 1 onda, 2 servidor
  varying float vA;
  varying float vKind;

  mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }

  void main() {
    float a = uTime * 0.02;
    vec2 m2 = mat2(cos(a), -sin(a), sin(a), cos(a)) * position.xy * uMapScale;
    vec3 m = rotX(-1.0) * vec3(m2.x, m2.y, position.z * uMapScale);
    vec4 mv = modelViewMatrix * vec4(m, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_Position.xy += uMapOffset * gl_Position.w;
    vA = aAlpha;
    vKind = aKind;
    gl_PointSize = aSize * uPixelRatio / -mv.z;
  }
`;

const pingFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vA;
  varying float vKind;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float shape = vKind > 0.5 && vKind < 1.5 ? smoothstep(0.5, 0.42, d) * smoothstep(0.22, 0.38, d) : smoothstep(0.5, 0.0, d);
    vec3 color = uColor + smoothstep(0.3, 0.0, d) * (vKind > 1.5 ? 0.9 : vKind < 0.5 ? 0.7 : 0.0);
    gl_FragColor = vec4(color, shape * vA * uOpacity);
  }
`;

export interface ParticleLabels {
  vehicle: string;
  reported: string;
  seconds: string;
}

interface Options {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext; // creado por getGpuContext sobre el mismo canvas
  section: HTMLElement;
  onProgress?: (p: number) => void;
  // Capa HTML sobre el canvas: nombres de las ciudades y la tarjeta del vehículo señalado
  overlay?: { cordoba: HTMLElement; sanJuan: HTMLElement; server: HTMLElement; tip: HTMLElement; labels: ParticleLabels };
}

function cssColor(name: string) {
  return new Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Devuelve false si no se pudo (o no convenía) iniciar las partículas. */
export async function initParticles({ canvas, gl, section, onProgress, overlay }: Options): Promise<boolean> {
  const [pointsBuf, routes] = await Promise.all([
    fetch('/data/cordoba-points.bin').then((r) => r.arrayBuffer()),
    fetch('/data/cordoba-routes.json').then((r) => r.json() as Promise<number[][][]>),
  ]);

  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const raw = new Int16Array(pointsBuf);
  const count = Math.min(raw.length / 2, mobile ? 7000 : 16000);

  // ---------- Partículas principales: continentes ↔ avenidas ----------
  const sphere = landPoints(count);
  const map = new Float32Array(count * 2);
  const rand = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    map[i * 2] = raw[i * 2] / 32767;
    map[i * 2 + 1] = raw[i * 2 + 1] / 32767;
    rand[i] = Math.random();
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(sphere, 3)); // usado por el bounding sphere
  geometry.setAttribute('aSphere', new BufferAttribute(sphere, 3));
  geometry.setAttribute('aMap', new BufferAttribute(map, 2));
  geometry.setAttribute('aRand', new BufferAttribute(rand, 1));

  const renderer = new WebGLRenderer({ canvas, context: gl, antialias: false, alpha: true });
  const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
  renderer.setPixelRatio(pixelRatio);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uSpin: { value: START_SPIN },
    uTilt: { value: IDLE_TILT },
    uZoom: { value: 1 },
    uMouse: { value: [9, 9] },
    uMouseStrength: { value: 0 },
    uAspect: { value: 1 },
    uPixelRatio: { value: pixelRatio },
    uSize: { value: mobile ? 30 : 27 },
    uSphereOffset: { value: [0, 0] },
    uMapOffset: { value: [0, 0] },
    uMapScale: { value: 2.35 },
    uColorA: { value: cssColor('--accent') },
    uColorB: { value: new Color('#fff3e8') },
    uOpacity: { value: 1 },
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

  // ---------- Sobre el globo: ciudades, arco Córdoba → San Juan y haz de datos ----------
  const cba = toXYZ(CORDOBA.lat, CORDOBA.lon);
  const sj = toXYZ(SAN_JUAN.lat, SAN_JUAN.lon);
  const gPos: number[] = [];
  const gT: number[] = [];
  const gKind: number[] = [];
  const ARC = 40;
  for (let k = 0; k <= ARC; k++) {
    const t = k / ARC;
    // Interpolación sobre la esfera, levantada en el medio para que se vea el arco
    const v = cba.map((c, j) => c * (1 - t) + sj[j] * t);
    const len = Math.hypot(...v);
    const lift = 1 + 0.035 * Math.sin(Math.PI * t);
    gPos.push(...v.map((c) => (c / len) * lift));
    gT.push(t);
    gKind.push(0);
  }
  // El haz sale de Córdoba hacia arriba en pantalla (hacia el norte y afuera): como Córdoba queda
  // de frente, uno recto hacia afuera apuntaría a la cámara y no se vería
  const RAD = Math.PI / 180;
  const north = [
    -Math.sin(CORDOBA.lat * RAD) * Math.sin(CORDOBA.lon * RAD),
    Math.cos(CORDOBA.lat * RAD),
    -Math.sin(CORDOBA.lat * RAD) * Math.cos(CORDOBA.lon * RAD),
  ];
  const BEAM = 34;
  for (let k = 0; k <= BEAM; k++) {
    const t = k / BEAM;
    gPos.push(...cba.map((c, j) => c * (1 + 0.12 * t) + north[j] * 0.45 * t * t));
    gT.push(t);
    gKind.push(1);
  }
  for (const [city, phase] of [
    [cba, 0],
    [sj, 0.5],
  ] as const) {
    gPos.push(...city, ...city);
    gT.push(phase, phase);
    gKind.push(2, 3);
  }
  const gGeometry = new BufferGeometry();
  gGeometry.setAttribute('position', new BufferAttribute(new Float32Array(gPos), 3));
  gGeometry.setAttribute('aT', new BufferAttribute(new Float32Array(gT), 1));
  gGeometry.setAttribute('aKind', new BufferAttribute(new Float32Array(gKind), 1));
  const gUniforms = {
    uTime: uniforms.uTime,
    uSpin: uniforms.uSpin,
    uTilt: uniforms.uTilt,
    uZoom: uniforms.uZoom,
    uPixelRatio: uniforms.uPixelRatio,
    uOffset: uniforms.uSphereOffset,
    uColor: { value: cssColor('--accent') },
    uOpacity: { value: 0 },
  };
  const gMaterial = new ShaderMaterial({
    vertexShader: globeVertex,
    fragmentShader: globeFragment,
    uniforms: gUniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const gPoints = new Points(gGeometry, gMaterial);
  gPoints.frustumCulled = false;
  scene.add(gPoints);

  // ---------- Vehículos con estela sobre las avenidas ----------
  const TRAIL = 7;
  const vehicles = routes
    .filter((r) => r.length > 3)
    .flatMap((route, i) => {
      const lens = [0];
      for (let k = 1; k < route.length; k++) {
        lens.push(lens[k - 1] + Math.hypot(route[k][0] - route[k - 1][0], route[k][1] - route[k - 1][1]));
      }
      const per = mobile ? 1 : 2;
      return Array.from({ length: per }, (_, j) => ({
        route,
        lens,
        total: lens[lens.length - 1],
        t: (i * 0.37 + j * 0.5) % 1,
        speed: 0.018 + ((i * 7 + j) % 5) * 0.004,
        dir: j % 2 ? -1 : 1,
        kmh: 18 + ((i * 11 + j * 7) % 27),
        lastReport: -Math.random() * 20,
      }));
    });
  const vCount = vehicles.length * TRAIL;
  const vPos = new Float32Array(vCount * 3);
  const vFade = new Float32Array(vCount);
  for (let i = 0; i < vCount; i++) vFade[i] = 1 - (i % TRAIL) / TRAIL;
  const vGeometry = new BufferGeometry();
  vGeometry.setAttribute('position', new BufferAttribute(vPos, 3));
  vGeometry.setAttribute('aFade', new BufferAttribute(vFade, 1));
  const vUniforms = {
    uTime: uniforms.uTime,
    uPixelRatio: uniforms.uPixelRatio,
    uMapScale: uniforms.uMapScale,
    uMapOffset: uniforms.uMapOffset,
    uColor: { value: cssColor('--accent') },
    uOpacity: { value: 0 },
  };
  const vMaterial = new ShaderMaterial({
    vertexShader: vehicleVertex,
    fragmentShader: vehicleFragment,
    uniforms: vUniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const vPoints = new Points(vGeometry, vMaterial);
  vPoints.frustumCulled = false;
  scene.add(vPoints);

  const pointAt = (v: (typeof vehicles)[number], t: number, out: Float32Array, o: number) => {
    const target = (((t % 1) + 1) % 1) * v.total;
    let k = 1;
    while (k < v.lens.length - 1 && v.lens[k] < target) k++;
    const seg = v.lens[k] - v.lens[k - 1] || 1;
    const f = (target - v.lens[k - 1]) / seg;
    out[o] = v.route[k - 1][0] + (v.route[k][0] - v.route[k - 1][0]) * f;
    out[o + 1] = v.route[k - 1][1] + (v.route[k][1] - v.route[k - 1][1]) * f;
    out[o + 2] = 0;
  };

  // ---------- Reportes al servidor ----------
  // Cada ranura: dos ondas en el vehículo + un paquete con una estela larga que sube hasta el servidor.
  // Los dos últimos puntos son el servidor: su halo, que late, y el núcleo, que destella al recibir.
  const SLOTS = mobile ? 5 : 8;
  const PKT = 14;
  const PER = 2 + PKT;
  const server = [0.05, 0.22, 0.42];
  const pCount = SLOTS * PER + 2;
  const HALO = pCount - 2;
  const CORE = pCount - 1;
  const pPos = new Float32Array(pCount * 3);
  const pAlpha = new Float32Array(pCount);
  const pSize = new Float32Array(pCount);
  const pKind = new Float32Array(pCount);
  for (let s = 0; s < SLOTS; s++) {
    pKind[s * PER] = 1;
    pKind[s * PER + 1] = 1;
  }
  pKind[HALO] = 1;
  pKind[CORE] = 2;
  pPos.set(server, HALO * 3);
  pPos.set(server, CORE * 3);
  const pGeometry = new BufferGeometry();
  pGeometry.setAttribute('position', new BufferAttribute(pPos, 3));
  pGeometry.setAttribute('aAlpha', new BufferAttribute(pAlpha, 1));
  pGeometry.setAttribute('aSize', new BufferAttribute(pSize, 1));
  pGeometry.setAttribute('aKind', new BufferAttribute(pKind, 1));
  const pUniforms = {
    uTime: uniforms.uTime,
    uPixelRatio: uniforms.uPixelRatio,
    uMapScale: uniforms.uMapScale,
    uMapOffset: uniforms.uMapOffset,
    uColor: { value: cssColor('--accent') },
    uOpacity: { value: 0 },
  };
  const pMaterial = new ShaderMaterial({
    vertexShader: pingVertex,
    fragmentShader: pingFragment,
    uniforms: pUniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const pPoints = new Points(pGeometry, pMaterial);
  pPoints.frustumCulled = false;
  scene.add(pPoints);
  const pings = Array.from({ length: SLOTS }, () => ({ start: -10, x: 0, y: 0 }));
  let nextPing = 0;
  let serverFlash = -10;
  const PING_LIFE = 1.8;

  // ---------- Tema ----------
  const applyTheme = () => {
    const light = document.documentElement.classList.contains('light');
    const accent = cssColor('--accent');
    uniforms.uColorA.value = accent;
    vUniforms.uColor.value = accent;
    gUniforms.uColor.value = accent;
    pUniforms.uColor.value = accent;
    uniforms.uColorB.value = new Color(light ? '#3b2a1c' : '#fff3e8');
    // El modo de mezcla se aplica en cada render: no hace falta recompilar los shaders
    // (recompilarlos bloqueaba la página justo durante la animación del tema)
    for (const m of [material, vMaterial, gMaterial, pMaterial]) m.blending = light ? NormalBlending : AdditiveBlending;
  };
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // ---------- Tamaño y layout ----------
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = w / h;
    const wide = w >= 1024;
    // Escritorio: globo y mapa a la derecha del texto. Móvil: centrados, detrás del texto.
    uniforms.uSphereOffset.value = wide ? [0.38, 0.02] : [0, 0.32];
    uniforms.uMapOffset.value = wide ? [0.4, -0.04] : [0, 0.28];
    uniforms.uMapScale.value = wide ? 2.35 : 1.9;
  };
  resize();
  window.addEventListener('resize', resize);

  // Del espacio de la escena a píxeles del canvas (sumando el desplazamiento que hace el shader)
  camera.updateMatrixWorld();
  const tmp = new Vector3();
  const toScreen = (x: number, y: number, z: number, offset: number[]) => {
    tmp.set(x, y, z).project(camera);
    return [((tmp.x + offset[0] + 1) / 2) * canvas.clientWidth, ((1 - (tmp.y + offset[1])) / 2) * canvas.clientHeight];
  };
  // Posición de un punto del mapa (coordenadas del plano) en la escena, igual que el shader
  const mapToScene = (x: number, y: number, h = 0) => {
    const a = uniforms.uTime.value * 0.02;
    const k = uniforms.uMapScale.value;
    const mx = (Math.cos(a) * x + Math.sin(a) * y) * k;
    const my = (-Math.sin(a) * x + Math.cos(a) * y) * k;
    const mz = h * k;
    const c = Math.cos(-1);
    const s = Math.sin(-1);
    return [mx, c * my - s * mz, s * my + c * mz] as const;
  };

  // ---------- Interacción ----------
  const mouse = { x: 9, y: 9, active: 0, px: -1, py: -1 };
  const onPointer = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouse.px = e.clientX - rect.left;
    mouse.py = e.clientY - rect.top;
    mouse.active = 1;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', onPointer, { passive: true });

  let target = 0;
  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    const travel = section.offsetHeight - window.innerHeight;
    target = Math.min(1, Math.max(0, -rect.top / Math.max(1, travel)));
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Loop (se pausa fuera de pantalla o con la pestaña oculta) ----------
  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) loop();
  }).observe(section);
  document.addEventListener('visibilitychange', () => !document.hidden && loop());

  let raf = 0;
  let last = performance.now();
  let time = 0;
  let progress = target;
  let spin = START_SPIN;

  // Calidad adaptativa: si los cuadros salen lentos, bajamos resolución y cantidad de puntos;
  // si aun así no alcanza, dejamos de animar en continuo y dibujamos solo ante scroll o mouse.
  let quality = 2;
  let slowFrames = 0;
  let sampled = 0;
  let idle = false;
  const degrade = () => {
    quality--;
    if (quality === 1) {
      renderer.setPixelRatio(1);
      uniforms.uPixelRatio.value = 1;
      geometry.setDrawRange(0, Math.floor(count / 2));
      resize();
    } else {
      idle = true;
    }
  };
  const wake = () => idle && visible && !document.hidden && requestAnimationFrame(frame);
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('pointermove', wake, { passive: true });

  function loop() {
    cancelAnimationFrame(raf);
    if (!visible || document.hidden) return;
    raf = requestAnimationFrame(loop);
    if (idle) {
      cancelAnimationFrame(raf);
      return;
    }
    frame();
  }

  const setLabel = (el: HTMLElement, pos: number[], alpha: number) => {
    el.style.opacity = String(alpha);
    if (alpha > 0) el.style.transform = `translate(${pos[0]}px, ${pos[1]}px)`;
  };

  function frame() {
    const now = performance.now();
    const elapsed = Math.min(1, Math.max(0, (now - last) / 1000));
    const dt = Math.min(0.05, elapsed);
    last = Math.max(last, now);
    if (!reduced) time += dt;

    // Suavizado por tiempo real: llega igual aunque el dispositivo dibuje pocos cuadros
    progress += (target - progress) * (1 - Math.exp(-elapsed * 4));
    uniforms.uTime.value = time;
    onProgress?.(progress);

    // Etapas del scroll: el globo gira hasta Córdoba, se acerca y se convierte en el mapa
    const focus = smooth(0.0, 0.2, progress);
    const morph = Math.min(1, Math.max(0, (progress - 0.22) / 0.78));
    if (!reduced) spin += dt * 0.1 * (1 - focus);
    const turns = Math.round((spin - FOCUS_SPIN) / (Math.PI * 2));
    uniforms.uSpin.value = spin + (FOCUS_SPIN + turns * Math.PI * 2 - spin) * focus;
    uniforms.uTilt.value = IDLE_TILT + (FOCUS_TILT - IDLE_TILT) * focus;
    uniforms.uZoom.value = 1 + 0.75 * smooth(0.06, 0.42, progress);
    uniforms.uMorph.value = morph;
    const globe = (1 - smooth(0.22, 0.4, progress)) * (0.35 + 0.65 * focus);
    gUniforms.uOpacity.value = globe;

    // El mouse se suaviza y se "apaga" solo si deja de moverse
    const mu = uniforms.uMouse.value as number[];
    mu[0] += (mouse.x - mu[0]) * Math.min(1, dt * 8);
    mu[1] += (mouse.y - mu[1]) * Math.min(1, dt * 8);
    mouse.active = Math.max(0, mouse.active - dt * 0.6);
    uniforms.uMouseStrength.value += (mouse.active - uniforms.uMouseStrength.value) * Math.min(1, dt * 5);

    // Vehículos: solo se ven cuando el mapa está formado
    const vOpacity = smooth(0.68, 0.9, morph);
    vUniforms.uOpacity.value = vOpacity;
    pUniforms.uOpacity.value = vOpacity;
    if (vOpacity > 0) {
      vehicles.forEach((v, i) => {
        if (!reduced) v.t += (v.speed * dt * v.dir) / Math.max(0.3, v.total);
        for (let k = 0; k < TRAIL; k++) {
          pointAt(v, v.t - v.dir * k * (0.006 / Math.max(0.3, v.total)), vPos, (i * TRAIL + k) * 3);
        }
      });
      vGeometry.attributes.position.needsUpdate = true;

      // Cada tanto un vehículo reporta su posición: onda en el lugar y paquete hasta el servidor
      if (!reduced && time >= nextPing) {
        const slot = pings.findIndex((p) => time - p.start > PING_LIFE);
        if (slot >= 0) {
          const vi = Math.floor(Math.random() * vehicles.length);
          pings[slot] = { start: time, x: vPos[vi * TRAIL * 3], y: vPos[vi * TRAIL * 3 + 1] };
          vehicles[vi].lastReport = time;
        }
        nextPing = time + 0.25 + Math.random() * 0.35;
      }
      pings.forEach((p, s) => {
        const age = time - p.start;
        const o = s * PER;
        // Dos ondas, una detrás de la otra, donde está el vehículo
        for (const [i, delay] of [
          [0, 0],
          [1, 0.25],
        ]) {
          const ring = Math.min(1, Math.max(0, (age - delay) / 0.9));
          pPos.set([p.x, p.y, 0], (o + i) * 3);
          pAlpha[o + i] = age < PING_LIFE && age >= delay ? (1 - ring) ** 1.4 : 0;
          pSize[o + i] = 60 + 340 * ring;
        }
        // El paquete sube en curva hasta el servidor dejando una estela que se apaga
        for (let k = 0; k < PKT; k++) {
          const t = Math.min(1, Math.max(0, (age - 0.2 - k * 0.028) / 1.0));
          const e = t * t * (3 - 2 * t);
          pPos.set([p.x + (server[0] - p.x) * e, p.y + (server[1] - p.y) * e, server[2] * Math.sin((e * Math.PI) / 2)], (o + 2 + k) * 3);
          pAlpha[o + 2 + k] = t > 0 && t < 1 ? (1 - k / PKT) ** 1.3 : 0;
          pSize[o + 2 + k] = k ? 40 - k * 2 : 70;
        }
        if (age > 1.2 && age < 1.2 + dt * 1.5) serverFlash = time;
      });
      const flash = Math.max(0, 1 - (time - serverFlash) / 0.45);
      const pulse = (time * 0.8) % 1;
      pAlpha[HALO] = 0.55 * (1 - pulse);
      pSize[HALO] = 140 + 260 * pulse;
      pAlpha[CORE] = 1;
      pSize[CORE] = 140 + 120 * flash;
      for (const name of ['position', 'aAlpha', 'aSize'] as const) pGeometry.attributes[name].needsUpdate = true;
    }

    // Capa HTML: nombres de las ciudades sobre el globo y la tarjeta del vehículo señalado
    if (overlay) {
      const r = 1.55 * uniforms.uZoom.value;
      for (const [el, city] of [
        [overlay.cordoba, cba],
        [overlay.sanJuan, sj],
      ] as const) {
        const [x, y, z] = rotate(city, uniforms.uSpin.value, uniforms.uTilt.value);
        setLabel(el, toScreen(x * r, y * r, z * r, uniforms.uSphereOffset.value), z > 0.2 ? globe * smooth(0.04, 0.16, progress) : 0);
      }

      const [sx, sy, sz] = mapToScene(server[0], server[1], server[2]);
      setLabel(overlay.server, toScreen(sx, sy, sz, uniforms.uMapOffset.value), vOpacity);

      let near = -1;
      let best = 22 * 22;
      let at: number[] = [];
      if (hover && vOpacity > 0.8 && mouse.px >= 0) {
        vehicles.forEach((_, i) => {
          const [x, y, z] = mapToScene(vPos[i * TRAIL * 3], vPos[i * TRAIL * 3 + 1]);
          const p = toScreen(x, y, z, uniforms.uMapOffset.value);
          const d = (p[0] - mouse.px) ** 2 + (p[1] - mouse.py) ** 2;
          if (d < best) {
            best = d;
            near = i;
            at = p;
          }
        });
      }
      if (near >= 0) {
        const v = vehicles[near];
        const ago = Math.max(1, Math.round(time - v.lastReport));
        const { vehicle, reported, seconds } = overlay.labels;
        // El texto va en el span interno, que es el que tiene el estilo de la tarjeta
        (overlay.tip.firstElementChild ?? overlay.tip).textContent = `${vehicle} ${214 + near} · ${v.kmh} km/h · ${reported} ${ago} ${seconds}`;
        setLabel(overlay.tip, at, 1);
      } else {
        overlay.tip.style.opacity = '0';
      }
    }

    renderer.render(scene, camera);

    if (quality > 0 && sampled < 90) {
      sampled++;
      if (elapsed > 0.045) slowFrames++;
      if (sampled === 45 || sampled === 90) {
        if (slowFrames > 20) degrade();
        slowFrames = 0;
      }
    }
  }
  // Los shaders se compilan en paralelo antes del primer cuadro: compilarlos al dibujar frenaba la
  // página (con una placa de video real, cientos de milisegundos con los cuatro materiales)
  try {
    await renderer.compileAsync(scene, camera);
  } catch {
    renderer.compile(scene, camera);
  }
  loop();
  return true;
}
