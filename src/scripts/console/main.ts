// La consola: una fila de juegos (proyectos) y apps. Se maneja con mouse, touch, teclado
// (flechas, Enter, D, /, Esc) o con un joystick real gracias a la Gamepad API del navegador.
//
// Estados: encendido ("boot") → ¿quién juega? ("who") → inicio ("home") → apagado ("off").
import { initSound, sfx } from '../sound';
import { createTrophies, type TrophyDef } from './trophies';
// Three.js (~130 KB) se descarga solo si hay animación de encendido o apagado
import type { Boot } from './boot';
const loadBoot = () => import('./boot').catch(() => null);
import { createAuth } from './auth';

type Input = 'keys' | 'pad' | 'touch';
type State = 'boot' | 'who' | 'home' | 'off';

export function initConsole(root: HTMLElement) {
  const tx = JSON.parse(root.dataset.ui!) as Record<
    'unlocked' | 'progress' | 'locked' | 'signedHint' | 'connecting' | 'authError' | 'pct' | 'pctNone',
    string
  >;
  const api = root.dataset.api!;
  const defs = JSON.parse(root.dataset.trophies!) as TrophyDef[];
  const lang = root.dataset.lang!;
  const home = root.dataset.home!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const row = root.querySelector<HTMLElement>('.cs-row')!;
  // Biblioteca: "projects" (proyectos y apps) o "fun" (juegos de mentira). `tiles` son las de la visible.
  type Tab = 'projects' | 'fun';
  const allTiles = [...root.querySelectorAll<HTMLButtonElement>('.cs-tile')];
  const tabButtons = [...root.querySelectorAll<HTMLButtonElement>('.cs-tabs [data-tab]')];
  let tab: Tab = 'projects';
  try {
    if (sessionStorage.getItem('console-tab') === 'fun') tab = 'fun';
  } catch {}
  let tiles = allTiles.filter((t) => t.dataset.group === tab);
  const infos = new Map([...root.querySelectorAll<HTMLElement>('[data-info]')].map((el) => [el.dataset.info!, el]));
  const layers = new Map([...root.querySelectorAll<HTMLElement>('[data-bg]')].map((el) => [el.dataset.bg!, el]));
  const dialogs = new Map([...root.querySelectorAll<HTMLDialogElement>('dialog[data-panel]')].map((d) => [d.dataset.panel!, d]));
  const toast = root.querySelector<HTMLElement>('.cs-toast')!;
  const bootEl = root.querySelector<HTMLElement>('[data-boot]')!;
  const who = root.querySelector<HTMLElement>('[data-who]')!;
  const users = [...who.querySelectorAll<HTMLButtonElement>('.cs-who-user')];
  const games = allTiles.filter((t) => t.dataset.kind === 'game').map((t) => t.dataset.id!);

  initSound([...root.querySelectorAll<HTMLElement>('[data-sound-toggle]')], { entrance: false });

  let state: State = document.documentElement.classList.contains('cs-skip-boot') ? 'home' : 'boot';

  // ---------- Modo de entrada: cambia las ayudas de abajo (teclas, joystick o nada en touch)
  function setInput(mode: Input) {
    root.dataset.input = mode;
  }
  setInput(window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'keys');
  root.addEventListener('pointerdown', (e) => setInput(e.pointerType === 'touch' ? 'touch' : 'keys'));

  // ---------- Trofeos
  let toastTimer = 0;
  const trophies = createTrophies(defs, (def, all) => {
    toast.querySelector('[data-toast-name]')!.textContent = def.name;
    toast.querySelector('[data-toast-label]')!.textContent = tx.unlocked;
    toast.dataset.tier = def.tier;
    toast.classList.remove('is-shown');
    void toast.offsetWidth; // reinicia la animación si llega otro trofeo enseguida
    toast.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-shown'), 4200);
    paintTrophies(all);
    pushTrophies([def.id]);
  });

  function paintTrophies(all = trophies.all()) {
    root.querySelectorAll<HTMLElement>('[data-trophy]').forEach((el) => {
      const done = all.has(el.dataset.trophy!);
      el.classList.toggle('is-unlocked', done);
      const label = el.querySelector('[data-trophy-state]');
      if (label) label.textContent = done ? '' : tx.locked;
    });
    const progress = tx.progress.replace('{n}', String(all.size)).replace('{total}', String(defs.length));
    root.querySelectorAll('[data-trophy-count]').forEach((el) => (el.textContent = progress));
    root.querySelectorAll<HTMLElement>('[data-trophy-bar]').forEach((el) => el.style.setProperty('--p', String(all.size / defs.length)));
    root.querySelectorAll('[data-level]').forEach((el) => (el.textContent = String(1 + all.size)));
  }
  paintTrophies();
  document.addEventListener('guestbook:sent', () => trophies.unlock('firma'));

  // ---------- Usuario: invitado o cuenta de Google (Cognito)
  const authCfg = JSON.parse(root.dataset.auth!) as { domain: string; clientId: string; path: string };
  const auth = createAuth({ ...authCfg, redirectUri: location.origin + authCfg.path });
  const PROFILE = 'console-profile'; // con sesión iniciada se puede jugar igual como invitado
  const googleUser = users.find((u) => u.dataset.user === 'google')!;
  const googleTexts = {
    name: googleUser.querySelector('[data-who-name]')!.textContent!,
    hint: googleUser.querySelector('[data-who-hint]')!.textContent!,
  };
  const guestName = root.querySelector('[data-user-name]')!.textContent!;

  const getProfile = () => {
    try {
      return localStorage.getItem(PROFILE) ?? 'google';
    } catch {
      return 'google';
    }
  };
  const setProfile = (p: 'guest' | 'google') => {
    try {
      localStorage.setItem(PROFILE, p);
    } catch {}
  };

  function setAvatar(el: HTMLElement, picture?: string) {
    const img = el.querySelector('img')!;
    if (picture) img.src = picture;
    else img.removeAttribute('src');
    img.hidden = !picture;
    el.classList.toggle('has-photo', !!picture);
  }

  // Pinta quién juega: el botón de arriba, el menú y la opción de Google en "¿Quién juega?"
  function paintUser() {
    const account = auth.user();
    const active = account && getProfile() === 'google' ? account : null;
    root.querySelectorAll<HTMLElement>('.cs-top [data-avatar], [data-panel="user"] [data-avatar]').forEach((el) => setAvatar(el, active?.picture));
    root.querySelector('[data-user-name]')!.textContent = active?.name ?? guestName;
    root.querySelector<HTMLElement>('[data-action="signout"]')!.hidden = !account;
    setAvatar(googleUser.querySelector('[data-avatar]')!, account?.picture);
    googleUser.querySelector('[data-who-name]')!.textContent = account?.name ?? googleTexts.name;
    googleUser.querySelector('[data-who-hint]')!.textContent = account ? tx.signedHint : googleTexts.hint;
  }
  paintUser();

  // ¿Se vuelve de Google? Se cambia el código por los tokens y se entra con la cuenta
  auth.handleRedirect().then((result) => {
    if (result === 'ok') {
      setProfile('google');
      paintUser();
      setTimeout(() => trophies.unlock('encendido'), 700);
    } else if (result === 'error') {
      showNotice(tx.authError);
    }
    syncTrophies();
  });

  // ---------- Trofeos en la cuenta (API Gateway → Lambda trofeos → DynamoDB)
  const playing = () => !!auth.user() && getProfile() === 'google';

  async function callApi(path: string, init: RequestInit = {}) {
    const token = await auth.accessToken();
    if (!token) return null;
    const res = await fetch(api + path, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return res.ok ? res.json() : null;
  }

  // Desbloqueo nuevo con la cuenta: se cuenta en el porcentaje global
  function pushTrophies(ids: string[]) {
    if (!playing() || !ids.length) return;
    callApi('/trofeos', { method: 'POST', body: JSON.stringify({ ids }) })
      .then(() => (globalAt = 0)) // que los porcentajes se vuelvan a pedir
      .catch(() => {});
  }

  // Al entrar con la cuenta: se traen sus trofeos (de otra computadora) y se suben los de este navegador
  async function syncTrophies() {
    if (!playing()) return;
    try {
      const mine = await callApi('/trofeos/mios');
      if (!mine) return;
      const server = new Set<string>(mine.trofeos);
      if (trophies.merge(mine.trofeos)) paintTrophies();
      pushTrophies([...trophies.all()].filter((id) => !server.has(id)));
    } catch {}
  }

  // Porcentajes: se piden al abrir los trofeos, como mucho una vez por minuto
  let globalAt = 0;
  async function loadGlobal() {
    if (Date.now() - globalAt < 60_000) return;
    globalAt = Date.now();
    try {
      const res = await fetch(api + '/trofeos');
      if (!res.ok) return;
      const { jugadores, trofeos: counts } = (await res.json()) as { jugadores: number; trofeos: Record<string, number> };
      root.querySelectorAll<HTMLElement>('[data-trophy-pct]').forEach((el) => {
        const id = el.closest<HTMLElement>('[data-trophy]')!.dataset.trophy!;
        if (!jugadores) return void (el.textContent = '');
        const n = counts[id] ?? 0;
        const p = (n / jugadores) * 100;
        el.textContent = n ? tx.pct.replace('{p}', p < 1 ? '<1' : String(Math.round(p))) : tx.pctNone;
      });
    } catch {
      globalAt = 0;
    }
  }

  function showNotice(text: string) {
    const label = toast.querySelector('[data-toast-label]');
    toast.querySelector('[data-toast-name]')!.textContent = text;
    if (label) label.textContent = '';
    toast.dataset.tier = 'notice';
    toast.classList.remove('is-shown');
    void toast.offsetWidth;
    toast.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-shown'), 4200);
  }

  // ---------- Selección en la fila
  const SEL = 'console-sel';
  const SEEN = 'console-seen';
  let seen = new Set<string>();
  try {
    seen = new Set(JSON.parse(localStorage.getItem(SEEN) ?? '[]'));
  } catch {}
  let index = 0;
  try {
    index = Math.max(0, tiles.findIndex((t) => t.dataset.id === sessionStorage.getItem(SEL)));
  } catch {}

  function select(i: number, { sound = true, focus = false } = {}) {
    i = Math.max(0, Math.min(tiles.length - 1, i));
    const changed = i !== index;
    index = i;
    const tile = tiles[i];
    const id = tile.dataset.id!;
    tiles.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
    infos.forEach((el, key) => el.classList.toggle('is-active', key === id));
    layers.forEach((el, key) => el.classList.toggle('is-active', key === id));
    root.style.setProperty('--tint', tile.dataset.color!);
    // Se centra moviendo solo la fila (scrollIntoView también corría la pantalla entera de costado).
    // Se espera un cuadro: la tarjeta elegida cambia de tamaño y hay que medirla ya crecida.
    requestAnimationFrame(() =>
      row.scrollTo({
        left: tile.offsetLeft - row.clientWidth / 2 + tile.offsetWidth / 2,
        behavior: reduced ? 'auto' : 'smooth',
      }),
    );
    if (focus) tile.focus({ preventScroll: true });
    if (changed && sound) sfx('move');
    try {
      sessionStorage.setItem(SEL, id);
    } catch {}

    if (tile.dataset.kind === 'game' && !seen.has(id)) {
      seen.add(id);
      try {
        localStorage.setItem(SEEN, JSON.stringify([...seen]));
      } catch {}
      if (games.every((g) => seen.has(g))) trophies.unlock('explorador');
    }
  }

  // ---------- Pestañas de la biblioteca: cada una recuerda qué elemento tenía elegido
  const lastIndex: Record<Tab, number> = { projects: 0, fun: 0 };

  function setTab(next: Tab, { sound = true, focusRow = false } = {}) {
    if (next !== tab) {
      lastIndex[tab] = index;
      tab = next;
      tiles = allTiles.filter((t) => t.dataset.group === tab);
      allTiles.forEach((t) => {
        if (!tiles.includes(t)) t.tabIndex = -1;
      });
      index = -1; // fuerza a `select` a repintar aunque el número coincida
      select(lastIndex[tab], { sound: false, focus: focusRow });
      if (sound) sfx('move');
      try {
        sessionStorage.setItem('console-tab', tab);
      } catch {}
    }
    root.dataset.tab = tab;
    tabButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === tab)));
  }
  tabButtons.forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab as Tab)));

  // ---------- Paneles
  const openDialog = () => [...dialogs.values()].find((d) => d.open);

  function openPanel(name: string) {
    const dialog = dialogs.get(name);
    if (!dialog || dialog.open) return;
    openDialog()?.close(); // del menú del usuario a los trofeos, por ejemplo
    dialog.showModal();
    sfx('press');
    if (name === 'profile') trophies.unlock('curioso');
    if (name.startsWith('details-')) trophies.unlock('detalles');
    if (name === 'search') resetSearch();
    if (name === 'trophies') loadGlobal();
    if (name === 'fun-error') sfx('back');
  }

  dialogs.forEach((dialog) => {
    dialog.addEventListener('close', () => {
      sfx('back');
      if (state === 'home' && !openDialog()) tiles[index].focus({ preventScroll: true });
    });
    // Clic afuera del panel (en el fondo oscuro) lo cierra
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
  });

  // Lo que se puede enfocar dentro de un panel, en orden, sin lo invisible (la trampa para bots,
  // los resultados filtrados del buscador)
  function focusables(scope: HTMLElement) {
    return [...scope.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([tabindex="-1"]), textarea')].filter(
      (el) => el.getClientRects().length > 0,
    );
  }

  function moveFocus(scope: HTMLElement, dir: number) {
    const els = focusables(scope);
    if (!els.length) return;
    const i = els.indexOf(document.activeElement as HTMLElement);
    els[(i + dir + els.length) % els.length].focus();
    sfx('move');
  }

  // ---------- Buscador
  const search = dialogs.get('search')!;
  const searchInput = search.querySelector<HTMLInputElement>('[data-search-input]')!;
  const results = [...search.querySelectorAll<HTMLElement>('[data-result]')];
  const empty = search.querySelector<HTMLElement>('[data-search-empty]')!;
  const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

  function filterResults() {
    const q = normalize(searchInput.value);
    let shown = 0;
    results.forEach((li) => {
      const match = !q || normalize(li.dataset.search!).includes(q);
      li.hidden = !match;
      if (match) shown++;
    });
    empty.hidden = shown > 0;
  }
  function resetSearch() {
    searchInput.value = '';
    filterResults();
  }
  searchInput.addEventListener('input', filterResults);
  searchInput.addEventListener('keydown', (e) => {
    const first = results.find((li) => !li.hidden)?.querySelector('button');
    if (e.key === 'ArrowDown' && first) {
      e.preventDefault();
      first.focus();
    } else if (e.key === 'Enter' && first) {
      e.preventDefault();
      first.click();
    }
  });
  search.querySelectorAll<HTMLButtonElement>('[data-goto]').forEach((b) =>
    b.addEventListener('click', () => {
      search.close();
      const target = allTiles.find((t) => t.dataset.id === b.dataset.goto);
      if (!target) return;
      setTab(target.dataset.group as Tab, { sound: false });
      select(tiles.indexOf(target), { focus: true });
    }),
  );

  // ---------- Acciones
  function go(href: string, { fromConsole = false } = {}) {
    sfx('press');
    // Marca para que la página del proyecto ofrezca "Volver a la consola" en vez del sitio clásico
    try {
      if (fromConsole) sessionStorage.setItem('from-console', '1');
      else sessionStorage.removeItem('from-console');
    } catch {}
    root.classList.add('is-leaving');
    // Una pausa corta: que se vea el trofeo y suene antes de irse
    setTimeout(() => location.assign(href), reduced ? 0 : 650);
  }

  function activate() {
    const { kind, id, href, errTitle, errBody } = tiles[index].dataset;
    if (kind === 'fun') {
      // Juegos de mentira: siempre falta algo (premium, espacio, el disco 2…)
      const panel = dialogs.get('fun-error')!;
      panel.querySelector('[data-fun-title]')!.textContent = errTitle!;
      panel.querySelector('[data-fun-body]')!.textContent = errBody!;
      openPanel('fun-error');
    } else if (kind === 'game') {
      trophies.unlock('jugador');
      go(href!, { fromConsole: true });
    } else if (id === 'exit') {
      shutdown();
    } else {
      openPanel(id!);
    }
  }

  function details() {
    const tile = tiles[index];
    if (tile.dataset.kind === 'game') openPanel(`details-${tile.dataset.id}`);
  }

  allTiles.forEach((tile) =>
    tile.addEventListener('click', () => {
      const k = tiles.indexOf(tile);
      if (k === index) activate();
      else if (k >= 0) select(k);
    }),
  );
  root.querySelectorAll<HTMLElement>('[data-action]').forEach((el) =>
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const action = el.dataset.action;
      if (action === 'play') activate();
      else if (action === 'details') details();
      else if (action === 'open') openPanel(el.dataset.target!);
      else if (action === 'switch') {
        openDialog()?.close();
        showWho();
      } else if (action === 'signout') {
        setProfile('guest');
        auth.logout();
      } else if (action === 'off') shutdown();
    }),
  );

  // ---------- Encendido
  let boot: Boot | null = null;

  function onBootKey(e: KeyboardEvent) {
    if (e.key === 'Tab' || e.metaKey || e.ctrlKey || e.altKey) return;
    // Que esta tecla no llegue también a la consola (un Enter abriría un juego)
    e.preventDefault();
    e.stopImmediatePropagation();
    leaveBoot();
  }
  function onBootPointer(e: PointerEvent) {
    if ((e.target as Element).closest('[data-sound-toggle]')) return;
    leaveBoot();
  }

  async function leaveBoot() {
    if (state !== 'boot') return;
    window.removeEventListener('keydown', onBootKey, true);
    bootEl.removeEventListener('pointerdown', onBootPointer);
    sfx('boot');
    showWho();
    bootEl.classList.add('is-off');
    await (boot ? boot.explode() : new Promise((r) => setTimeout(r, 700)));
    bootEl.hidden = true;
    bootEl.classList.remove('is-off', 'is-ready', 'no-gl');
  }

  if (state === 'boot') {
    const canvas = bootEl.querySelector('canvas')!;
    const logo = bootEl.querySelector<SVGSVGElement>('svg.logo')!;
    // En fase de captura: llega antes que el manejo normal del teclado
    window.addEventListener('keydown', onBootKey, true);
    bootEl.addEventListener('pointerdown', onBootPointer);
    (reduced ? Promise.resolve(null) : loadBoot()).then((mod) => {
      if (state !== 'boot') return; // ya se salió del encendido mientras se descargaba
      boot = mod ? mod.startBoot(canvas, logo) : null;
      // Sin WebGL (o con movimiento reducido) se muestra el logo de SVG en lugar de las partículas
      if (!boot) bootEl.classList.add('no-gl');
      (boot ? boot.formed : new Promise((r) => setTimeout(r, 500))).then(() => bootEl.classList.add('is-ready'));
    });
  } else {
    bootEl.hidden = true;
    root.classList.add('is-on');
  }
  select(index, { sound: false });
  setTab(tab, { sound: false }); // pinta la pestaña guardada (sin cambiar nada)

  // ---------- ¿Quién juega?
  let userIndex = 0;

  function pickUser(i: number, sound = true) {
    userIndex = Math.max(0, Math.min(users.length - 1, i));
    users.forEach((u, k) => u.setAttribute('aria-selected', String(k === userIndex)));
    users[userIndex].focus({ preventScroll: true });
    if (sound) sfx('move');
  }

  function showWho() {
    state = 'who';
    root.classList.remove('is-on');
    who.classList.remove('is-off');
    who.hidden = false;
    // Si hay sesión de Google y se venía jugando con ella, queda elegida
    pickUser(auth.user() && getProfile() === 'google' ? users.indexOf(googleUser) : 0, false);
  }

  function chooseUser() {
    const user = users[userIndex];
    sfx('press');
    if (user === googleUser) {
      // Sin sesión: se va a Google (y vuelve a la consola). Con sesión: se entra directo.
      if (!auth.user()) {
        user.classList.add('is-busy');
        user.querySelector('[data-who-hint]')!.textContent = tx.connecting;
        auth.login();
        return;
      }
      setProfile('google');
    } else {
      setProfile('guest');
    }
    paintUser();
    syncTrophies();
    state = 'home';
    who.classList.add('is-off');
    setTimeout(() => (who.hidden = true), 500);
    root.classList.add('is-on');
    select(index, { sound: false, focus: true });
    setTimeout(() => trophies.unlock('encendido'), 700);
  }

  users.forEach((u, k) =>
    u.addEventListener('click', () => {
      pickUser(k, k !== userIndex);
      chooseUser();
    }),
  );

  // ---------- Apagado: el logo se arma, gira, se contrae y recién ahí se va al sitio
  function shutdown() {
    if (state === 'off') return;
    state = 'off';
    openDialog()?.close();
    sfx('back');
    root.classList.add('is-leaving'); // la fila y la info se desvanecen mientras baja la pantalla negra
    try {
      sessionStorage.removeItem('from-console');
    } catch {}
    document.documentElement.classList.remove('cs-skip-boot');
    bootEl.hidden = false;
    bootEl.classList.add('is-shutdown');
    const canvas = bootEl.querySelector('canvas')!;
    const logo = bootEl.querySelector<SVGSVGElement>('svg.logo')!;
    (reduced ? Promise.resolve(null) : loadBoot())
      .then((mod) => {
        const off = mod ? mod.startBoot(canvas, logo, { shutdown: true }) : null;
        if (!off) bootEl.classList.add('no-gl');
        return off ? off.explode() : new Promise((r) => setTimeout(r, 1200));
      })
      .then(() => setTimeout(() => location.assign(home), 350));
  }

  // ---------- Zonas: arriba (buscador, sonido, idioma, usuario) · la fila · abajo (Jugar, Detalles)
  // ↑ y ↓ pasan de una zona a otra; ← y → se mueven dentro de la zona.
  type Zone = 'top' | 'row' | 'actions';
  const topItems = () => [...root.querySelectorAll<HTMLElement>('.cs-top button, .cs-top a')];
  const actionItems = () => [...root.querySelectorAll<HTMLElement>('.cs-info.is-active .cs-actions > *')];

  function zoneOf(el: Element | null): Zone {
    if (el?.closest('.cs-top')) return 'top';
    if (el?.closest('.cs-infos')) return 'actions';
    return 'row';
  }

  function moveInZone(items: HTMLElement[], dir: number) {
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next = items[Math.max(0, Math.min(items.length - 1, i < 0 ? 0 : i + dir))];
    if (next && next !== document.activeElement) {
      next.focus();
      sfx('move');
    }
  }

  function goToZone(zone: Zone) {
    if (zone === 'row') tiles[index].focus({ preventScroll: true });
    else (zone === 'top' ? topItems()[0] : actionItems()[0])?.focus();
    sfx('move');
  }

  // ---------- Teclado
  const ARROWS: Record<string, number> = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };

  window.addEventListener('keydown', (e) => {
    if (state === 'boot' || state === 'off') return;
    const target = e.target as HTMLElement;

    if (state === 'who') {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        pickUser(userIndex + (e.key === 'ArrowLeft' ? -1 : 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        chooseUser();
      }
      return;
    }

    if (target.closest('input, textarea')) return;

    // Con un panel abierto, las flechas pasan de un botón al otro (Jugar ↔ Cerrar); Enter lo acciona
    // el propio botón y Esc cierra el panel (eso ya lo hace el navegador)
    const dialog = openDialog();
    if (dialog) {
      const dir = ARROWS[e.key];
      // Si el panel tiene un solo botón (los trofeos), las flechas quedan para desplazar la lista
      if (dir && focusables(dialog).length > 1) {
        e.preventDefault();
        setInput('keys');
        moveFocus(dialog, dir);
      }
      return;
    }

    // Enter o espacio sobre un botón o link: que actúe el propio botón (si no, se ejecutaría dos veces)
    if ((e.key === 'Enter' || e.key === ' ') && target.closest('a, button')) return;

    const arrows = () => {
      setInput('keys');
      trophies.unlock('teclado');
    };

    // Arriba o abajo de la fila: las flechas se mueven entre esos botones
    const zone = zoneOf(target);
    if (zone !== 'row' && e.key in ARROWS) {
      e.preventDefault();
      arrows();
      const horizontal = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
      if (horizontal) moveInZone(zone === 'top' ? topItems() : actionItems(), ARROWS[e.key]);
      else if ((zone === 'top' && e.key === 'ArrowDown') || (zone === 'actions' && e.key === 'ArrowUp')) goToZone('row');
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
        arrows();
        select(index + 1, { focus: true });
        break;
      case 'ArrowLeft':
        arrows();
        select(index - 1, { focus: true });
        break;
      case 'ArrowUp':
        arrows();
        goToZone('top');
        break;
      case 'ArrowDown':
        arrows();
        goToZone('actions');
        break;
      case 'Home':
        select(0, { focus: true });
        break;
      case 'End':
        select(tiles.length - 1, { focus: true });
        break;
      case 'Enter':
      case ' ':
        activate();
        break;
      case 'd':
      case 'D':
        details();
        break;
      case '/':
        openPanel('search');
        break;
      default:
        return;
    }
    e.preventDefault();
  });

  // ---------- Rueda del mouse: pasa de juego en juego
  let wheelAt = 0;
  root.addEventListener(
    'wheel',
    (e) => {
      if (state !== 'home' || openDialog()) return;
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 8) return;
      e.preventDefault();
      const now = performance.now();
      if (now - wheelAt < 180) return;
      wheelAt = now;
      select(index + Math.sign(delta));
    },
    { passive: false },
  );

  // ---------- Joystick (Gamepad API): se lee el estado en cada cuadro
  const held: Record<string, number> = {};
  let padLoop = 0;
  let usedPad = false;

  // true al apretar; si se mantiene y `repeat`, se repite (como una tecla)
  function pressed(name: string, down: boolean, now: number, repeat = false) {
    if (!down) {
      delete held[name];
      return false;
    }
    const next = held[name];
    if (next === undefined) {
      held[name] = now + 380;
      return true;
    }
    if (repeat && now >= next) {
      held[name] = now + 110;
      return true;
    }
    return false;
  }

  function poll(now: number) {
    padLoop = requestAnimationFrame(poll);
    const gp = [...navigator.getGamepads()].find(Boolean);
    if (!gp) return;
    const b = (i: number) => Boolean(gp.buttons[i]?.pressed);
    const ax = gp.axes[0] ?? 0;
    const ay = gp.axes[1] ?? 0;
    // Disposición estándar: 0 abajo (aceptar), 1 derecha (volver), 3 arriba, 12–15 la cruz
    const left = pressed('left', b(14) || ax < -0.5, now, true);
    const right = pressed('right', b(15) || ax > 0.5, now, true);
    const up = pressed('up', b(12) || ay < -0.5, now, true);
    const down = pressed('down', b(13) || ay > 0.5, now, true);
    const accept = pressed('a', b(0), now);
    const back = pressed('b', b(1), now);
    const info = pressed('y', b(3), now);
    const start = pressed('start', b(9), now);
    const lb = pressed('lb', b(4), now);
    const rb = pressed('rb', b(5), now);
    if (!(left || right || up || down || accept || back || info || start || lb || rb)) return;

    setInput('pad');
    if (!usedPad) {
      usedPad = true;
      trophies.unlock('joystick');
    }
    if (state === 'off') return;
    if (state === 'boot') return void leaveBoot();
    if (state === 'who') {
      if (left || right) pickUser(userIndex + (left ? -1 : 1));
      else if (accept || start) chooseUser();
      return;
    }

    const dialog = openDialog();
    if (dialog) {
      if (back) dialog.close();
      else if (up || left) moveFocus(dialog, -1);
      else if (down || right) moveFocus(dialog, 1);
      else if (accept) (document.activeElement as HTMLElement | null)?.click();
      return;
    }
    // Arriba o abajo de la fila: la cruz se mueve entre esos botones y A aprieta el elegido
    const zone = zoneOf(document.activeElement);
    if (zone !== 'row') {
      if (left || right) moveInZone(zone === 'top' ? topItems() : actionItems(), left ? -1 : 1);
      else if (back || (zone === 'top' && down) || (zone === 'actions' && up)) goToZone('row');
      else if (accept) (document.activeElement as HTMLElement | null)?.click();
      else if (info) details();
      else if (start) openPanel('user');
      return;
    }
    // Gatillos de arriba (LB / RB): cambian de biblioteca
    if (lb || rb) return void setTab(lb ? 'projects' : 'fun', { focusRow: true });
    if (left) select(index - 1, { focus: true });
    if (right) select(index + 1, { focus: true });
    if (up) goToZone('top');
    if (down) goToZone('actions');
    if (accept) activate();
    if (start) openPanel('user');
    if (info) details();
  }

  window.addEventListener('gamepadconnected', () => {
    setInput('pad');
    if (!padLoop) padLoop = requestAnimationFrame(poll);
  });
  window.addEventListener('gamepaddisconnected', () => {
    if ([...navigator.getGamepads()].some(Boolean)) return;
    cancelAnimationFrame(padLoop);
    padLoop = 0;
    setInput('keys');
  });

  // ---------- Volver con el botón "atrás" del navegador
  // El navegador puede restaurar la página tal como quedó (caché de ida y vuelta), o sea, a mitad de
  // la salida y con todo invisible: al volver se deshace la salida.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    root.classList.remove('is-leaving');
    if (state === 'off') location.reload(); // se había apagado: mejor arrancar de cero
    else select(index, { sound: false });
  });

  // ---------- Reloj de la barra
  const clock = root.querySelector('[data-clock]');
  const time = new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit' });
  const tick = () => {
    if (clock) clock.textContent = time.format(new Date());
  };
  tick();
  setInterval(tick, 15000);
}
