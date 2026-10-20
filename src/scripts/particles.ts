// Hero de partículas: una esfera interactiva que, con el scroll, se transforma en
// el mapa de Córdoba (avenidas reales de OpenStreetMap) con vehículos circulando.
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
  WebGLRenderer,
} from 'three';
import { isSoftwareRenderer } from './gpu';

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
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
    // Esfera: gira despacio y "respira"
    float breathe = 1.0 + 0.035 * sin(uTime * 1.3 + aRand * 6.2831);
    vec3 s = rotY(uTime * 0.12) * rotX(0.35) * (aSphere * 1.55 * breathe);

    // Mapa: plano inclinado que gira apenas
    float a = uTime * 0.02;
    vec2 m2 = mat2(cos(a), -sin(a), sin(a), cos(a)) * aMap * uMapScale;
    vec3 m = rotX(-1.0) * vec3(m2.x, m2.y, 0.0);

    // Transición escalonada por partícula, con un remolino a mitad de camino
    float p = smoothstep(0.0, 1.0, clamp(uProgress * 1.8 - aRand * 0.6, 0.0, 1.0));
    float mid = p * (1.0 - p) * 4.0;
    vec3 swirl = vec3(
      sin(aRand * 40.0 + uTime) * 0.9,
      cos(aRand * 33.0 + uTime * 0.8) * 0.6,
      sin(aRand * 27.0) * 0.9
    ) * mid;
    vec3 pos = mix(s, m, p) + swirl;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Desplazamiento en pantalla: esfera y mapa pueden ubicarse distinto
    vec2 offset = mix(uSphereOffset, uMapOffset, smoothstep(0.0, 1.0, uProgress));
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

    // Cara trasera de la esfera más tenue, para dar volumen
    float facing = clamp(s.z / 1.55 * 0.5 + 0.5, 0.0, 1.0);
    vAlpha = mix(mix(0.22, 1.0, facing), 0.85, p);
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
    // Mayoría blanco cálido, una parte en el color de acento; el mouse los "enciende"
    // En el mapa el naranja queda para los vehículos
    vec3 color = mix(uColorB, uColorA, clamp(step(0.8, vTint) * (1.0 - vMap * 0.85) + vHot, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha * vAlpha * uOpacity);
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

interface Options {
  canvas: HTMLCanvasElement;
  section: HTMLElement;
  onProgress?: (p: number) => void;
}

function cssColor(name: string) {
  return new Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
}

/** Devuelve false si no se pudo (o no convenía) iniciar las partículas. */
export async function initParticles({ canvas, section, onProgress }: Options): Promise<boolean> {
  if (isSoftwareRenderer()) return false;

  const [pointsBuf, routes] = await Promise.all([
    fetch('/data/cordoba-points.bin').then((r) => r.arrayBuffer()),
    fetch('/data/cordoba-routes.json').then((r) => r.json() as Promise<number[][][]>),
  ]);

  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raw = new Int16Array(pointsBuf);
  const count = Math.min(raw.length / 2, mobile ? 7000 : 16000);

  // ---------- Partículas principales ----------
  const sphere = new Float32Array(count * 3);
  const map = new Float32Array(count * 2);
  const rand = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    // Esfera de Fibonacci: distribución pareja
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    sphere.set([Math.cos(th) * r, y, Math.sin(th) * r], i * 3);
    map[i * 2] = raw[i * 2] / 32767;
    map[i * 2 + 1] = raw[i * 2 + 1] / 32767;
    rand[i] = Math.random();
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(sphere, 3)); // usado por el bounding sphere
  geometry.setAttribute('aSphere', new BufferAttribute(sphere, 3));
  geometry.setAttribute('aMap', new BufferAttribute(map, 2));
  geometry.setAttribute('aRand', new BufferAttribute(rand, 1));

  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
  renderer.setPixelRatio(pixelRatio);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
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

  // ---------- Tema ----------
  const applyTheme = () => {
    const light = document.documentElement.classList.contains('light');
    uniforms.uColorA.value = cssColor('--accent');
    vUniforms.uColor.value = cssColor('--accent');
    uniforms.uColorB.value = new Color(light ? '#3b2a1c' : '#fff3e8');
    // El modo de mezcla se aplica en cada render: no hace falta recompilar los shaders
    // (recompilarlos bloqueaba la página justo durante la animación del tema)
    material.blending = vMaterial.blending = light ? NormalBlending : AdditiveBlending;
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
    // Escritorio: esfera y mapa a la derecha del texto. Móvil: centrados, detrás del texto.
    uniforms.uSphereOffset.value = wide ? [0.38, 0.02] : [0, 0.32];
    uniforms.uMapOffset.value = wide ? [0.4, -0.04] : [0, 0.28];
    uniforms.uMapScale.value = wide ? 2.35 : 1.9;
  };
  resize();
  window.addEventListener('resize', resize);

  // ---------- Interacción ----------
  const mouse = { x: 9, y: 9, active: 0 };
  const onPointer = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
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

  function frame() {
    const now = performance.now();
    const elapsed = Math.min(1, Math.max(0, (now - last) / 1000));
    const dt = Math.min(0.05, elapsed);
    last = Math.max(last, now);
    if (!reduced) time += dt;

    // Suavizado por tiempo real: llega igual aunque el dispositivo dibuje pocos cuadros
    progress += (target - progress) * (1 - Math.exp(-elapsed * 4));
    uniforms.uTime.value = time;
    uniforms.uProgress.value = progress;
    onProgress?.(progress);

    // El mouse se suaviza y se "apaga" solo si deja de moverse
    const mu = uniforms.uMouse.value as number[];
    mu[0] += (mouse.x - mu[0]) * Math.min(1, dt * 8);
    mu[1] += (mouse.y - mu[1]) * Math.min(1, dt * 8);
    mouse.active = Math.max(0, mouse.active - dt * 0.6);
    uniforms.uMouseStrength.value += (mouse.active - uniforms.uMouseStrength.value) * Math.min(1, dt * 5);

    // Vehículos: solo se ven cuando el mapa está formado
    const vOpacity = Math.min(1, Math.max(0, (progress - 0.75) / 0.2));
    vUniforms.uOpacity.value = vOpacity;
    if (vOpacity > 0) {
      vehicles.forEach((v, i) => {
        if (!reduced) v.t += (v.speed * dt * v.dir) / Math.max(0.3, v.total);
        for (let k = 0; k < TRAIL; k++) {
          pointAt(v, v.t - v.dir * k * (0.006 / Math.max(0.3, v.total)), vPos, (i * TRAIL + k) * 3);
        }
      });
      vGeometry.attributes.position.needsUpdate = true;
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
  loop();
  return true;
}
