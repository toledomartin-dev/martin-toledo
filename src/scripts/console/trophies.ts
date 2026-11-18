// Trofeos de la consola: se guardan en este navegador (localStorage). Con sesión de Google, además se
// suben a AWS (main.ts) para contar qué porcentaje de jugadores consiguió cada uno.
import { sfx } from '../sound';

export interface TrophyDef {
  id: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  name: string;
  desc: string;
}

const KEY = 'console-trophies';
const PLATINUM = 'platino';

function load(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

export function createTrophies(defs: TrophyDef[], onUnlock: (def: TrophyDef, all: Set<string>) => void) {
  const unlocked = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify([...unlocked]));
    } catch {}
  }

  function unlock(id: string) {
    const def = defs.find((d) => d.id === id);
    if (!def || unlocked.has(id)) return;
    unlocked.add(id);
    save();
    sfx('trophy');
    onUnlock(def, unlocked);
    // Con todos los demás, llega el platino
    const rest = defs.filter((d) => d.id !== PLATINUM);
    if (id !== PLATINUM && rest.every((d) => unlocked.has(d.id))) {
      setTimeout(() => unlock(PLATINUM), 1600);
    }
  }

  // Trofeos que vienen de la cuenta (otra computadora): se suman sin aviso ni sonido
  function merge(ids: string[]) {
    const before = unlocked.size;
    ids.forEach((id) => defs.some((d) => d.id === id) && unlocked.add(id));
    if (unlocked.size === before) return false;
    save();
    const rest = defs.filter((d) => d.id !== PLATINUM);
    if (!unlocked.has(PLATINUM) && rest.every((d) => unlocked.has(d.id))) unlock(PLATINUM);
    return true;
  }

  return { unlock, merge, has: (id: string) => unlocked.has(id), all: () => unlocked };
}
