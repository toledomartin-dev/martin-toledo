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
};

export function initSound(toggle: HTMLElement) {
  let on = false;
  try {
    on = localStorage.getItem(KEY) === 'on';
  } catch (e) {}
  toggle.setAttribute('aria-pressed', String(on));
  let entered = false;

  toggle.addEventListener('click', () => {
    on = !on;
    toggle.setAttribute('aria-pressed', String(on));
    try {
      localStorage.setItem(KEY, on ? 'on' : 'off');
    } catch (e) {}
    if (on) {
      entered = true;
      sounds.enter();
    }
  });

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
    if (el === toggle) return;
    if (!entered) return enter();
    if (!el) return;
    el.matches('.btn-glow') ? sounds.press() : sounds.tick();
  });
}
