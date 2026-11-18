// Sonidos sutiles sintetizados con Web Audio (sin archivos). Apagados por defecto: se activan con
// el botón del header y la preferencia queda guardada. El navegador no deja sonar nada antes de que
// la persona toque algo, así que el sonido de entrada suena con la primera interacción.
const KEY = 'sound';
const PRESSABLE = 'button, a, [role="button"], summary';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.5;
    // Un pasabajos suaviza todo: nada estridente
    const lowpass = ctx.createBiquadFilter();
    lowpass.frequency.value = 4200;
    master.connect(lowpass).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Una nota con ataque corto y caída exponencial
function tone(freq: number, { at = 0, dur = 0.08, gain = 0.06, type = 'sine' as OscillatorType, slide = 1 } = {}) {
  const ac = audio();
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(gain, t + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(env).connect(master!);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

const sounds = {
  // Clic suave para botones y links
  tick: () => tone(1400, { dur: 0.05, gain: 0.05, type: 'triangle', slide: 0.6 }),
  // Botón principal: dos notas que suben
  press: () => {
    tone(660, { dur: 0.09, gain: 0.05 });
    tone(990, { at: 0.05, dur: 0.12, gain: 0.04 });
  },
  // Entrada: arpegio corto y cálido (La mayor)
  enter: () => {
    [440, 554.37, 659.25, 880].forEach((f, i) => tone(f, { at: i * 0.07, dur: 0.9 - i * 0.12, gain: 0.035 }));
    tone(220, { dur: 1.1, gain: 0.03, type: 'triangle' });
  },
  // Consola: moverse entre juegos (un toque corto y grave)
  move: () => tone(880, { dur: 0.045, gain: 0.035, type: 'triangle', slide: 0.8 }),
  // Consola: volver o cerrar (dos notas que bajan)
  back: () => {
    tone(740, { dur: 0.07, gain: 0.04 });
    tone(494, { at: 0.05, dur: 0.1, gain: 0.035 });
  },
  // Consola: trofeo desbloqueado (campanita brillante)
  trophy: () => {
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(f, { at: i * 0.06, dur: 0.5, gain: 0.03 }));
  },
  // Consola: encendido (acorde que crece de a poco, Re mayor con novena)
  boot: () => {
    [146.83, 220, 293.66, 369.99, 659.25].forEach((f, i) =>
      tone(f, { at: i * 0.12, dur: 2.4 - i * 0.2, gain: 0.03, type: i < 2 ? 'triangle' : 'sine' }),
    );
  },
};

export type SoundName = keyof typeof sounds;

/** Toca un sonido solo si la persona activó el sonido (sirve para teclado y joystick, que no pasan por el clic). */
export function sfx(name: SoundName) {
  try {
    if (localStorage.getItem(KEY) !== 'on') return;
  } catch (e) {
    return;
  }
  sounds[name]();
}

// `toggles`: uno o más botones que prenden y apagan lo mismo (la consola tiene uno en el encendido
// y otro arriba). `entrance: false` saltea el arpegio de entrada (la consola tiene su propio sonido).
export function initSound(toggles: HTMLElement | HTMLElement[], { entrance = true } = {}) {
  const buttons = Array.isArray(toggles) ? toggles : [toggles];
  let on = false;
  try {
    on = localStorage.getItem(KEY) === 'on';
  } catch (e) {}
  const paint = () => buttons.forEach((b) => b.setAttribute('aria-pressed', String(on)));
  paint();
  let entered = !entrance;

  buttons.forEach((toggle) =>
    toggle.addEventListener('click', () => {
      on = !on;
      paint();
      try {
        localStorage.setItem(KEY, on ? 'on' : 'off');
      } catch (e) {}
      if (on) {
        entered = true;
        sounds.enter();
      }
    }),
  );

  // Con el sonido ya activado de una visita anterior: la entrada suena con el primer toque o tecla
  const enter = () => {
    if (entered || !on) return;
    entered = true;
    sounds.enter();
  };
  window.addEventListener('keydown', enter, { once: true });

  document.addEventListener('pointerdown', (e) => {
    if (!on) return;
    const el = (e.target as Element).closest(PRESSABLE);
    if (el && buttons.includes(el as HTMLElement)) return;
    if (!entered) return enter();
    if (!el) return;
    el.matches('.btn-glow') ? sounds.press() : sounds.tick();
  });
}
