// Cambio de idioma sin recargar, con efecto "Matrix" en los textos visibles.
// Las páginas /es y /en tienen la misma estructura: se baja la otra versión, se emparejan
// los textos en orden y los visibles se "descifran" letra por letra hasta la traducción.
// Si algo no coincide (o el usuario prefiere menos movimiento), se navega normalmente.

const GLYPHS = 'アカサタナハマヤラワイキシチニヒミリウクスツヌフムユルエケセテネヘメレオコソトノホモヨロ0123456789ABCDEFXYZ#$%&*+=<>';
const DURATION = 900;
const ATTRS = ['href', 'aria-label', 'title', 'alt', 'hreflang', 'data-title', 'download', 'lang'];

let busy = false;
let currentPath = location.pathname;

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

function textNodes(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const parent = n.parentElement;
      if (!parent || !n.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      if (parent.closest('script, style, noscript, template')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
}

function isVisible(node: Text) {
  const el = node.parentElement!;
  const range = document.createRange();
  range.selectNodeContents(node);
  const r = range.getBoundingClientRect();
  if (r.width === 0 || r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return false;
  if ('checkVisibility' in el) return el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  return true;
}

// Mientras dura la animación no se puede scrollear (y no salta el layout por la barra)
function lockScroll() {
  const html = document.documentElement;
  const gap = window.innerWidth - html.clientWidth;
  const prev = { overflow: html.style.overflow, padding: html.style.paddingRight };
  const block = (e: Event) => e.preventDefault();
  const keys = (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) e.preventDefault();
  };
  html.style.overflow = 'hidden';
  html.style.paddingRight = `${gap}px`;
  window.addEventListener('wheel', block, { passive: false });
  window.addEventListener('touchmove', block, { passive: false });
  window.addEventListener('keydown', keys);
  return () => {
    html.style.overflow = prev.overflow;
    html.style.paddingRight = prev.padding;
    window.removeEventListener('wheel', block);
    window.removeEventListener('touchmove', block);
    window.removeEventListener('keydown', keys);
  };
}

function scramble(pairs: { node: Text; from: string; to: string; delay: number }[]) {
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const parents = new Set(pairs.map((p) => p.node.parentElement!));
    parents.forEach((el) => el.classList.add('scrambling'));

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(safety);
      pairs.forEach((p) => (p.node.nodeValue = p.to));
      parents.forEach((el) => el.classList.remove('scrambling'));
      resolve();
    };
    // Si el navegador deja de dibujar (pestaña en segundo plano), se completa igual
    const safety = setTimeout(finish, DURATION + 600);

    const frame = (now: number) => {
      if (finished) return;
      let done = true;
      for (const p of pairs) {
        const t = Math.min(1, Math.max(0, (now - start - p.delay) / (DURATION - p.delay)));
        if (t < 1) done = false;
        const len = Math.round(p.from.length + (p.to.length - p.from.length) * t);
        const settled = Math.floor(p.to.length * t * t);
        let out = '';
        for (let i = 0; i < len; i++) {
          const target = p.to[i] ?? '';
          if (i < settled) out += target;
          else if (target === ' ' || p.from[i] === ' ') out += ' ';
          else out += t === 0 ? (p.from[i] ?? '') : randomGlyph();
        }
        p.node.nodeValue = t >= 1 ? p.to : out;
      }
      if (done) finish();
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

// La otra versión se baja de antemano, así el clic responde al instante
const pages = new Map<string, Promise<Document>>();
function load(href: string) {
  if (!pages.has(href)) {
    const page = fetch(href)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((html) => new DOMParser().parseFromString(html, 'text/html'));
    page.catch(() => pages.delete(href));
    pages.set(href, page);
  }
  return pages.get(href)!;
}
function prefetch(href: string) {
  const run = () => load(href).catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 2000 });
  else setTimeout(run, 800);
}

async function switchLanguage(href: string) {
  // Copia de la página actual antes de tocarla: es la que se usa para volver
  const current = document.cloneNode(true) as Document;
  // Clon: el documento cacheado se reutiliza en el próximo cambio
  const next = (await load(href)).cloneNode(true) as Document;

  const currentText = textNodes(document.body);
  const nextText = textNodes(next.body);
  const currentEls = [...document.body.querySelectorAll('*')];
  const nextEls = [...next.body.querySelectorAll('*')];
  const sameShape =
    currentText.length === nextText.length &&
    currentEls.length === nextEls.length &&
    currentEls.every((el, i) => el.tagName === nextEls[i].tagName);
  if (!sameShape) throw new Error('Las páginas no coinciden');

  // Solo se animan los textos visibles; el resto cambia de golpe al final
  const pairs = currentText
    .map((node, i) => ({ node, from: node.nodeValue ?? '', to: nextText[i].nodeValue ?? '', delay: Math.random() * 250 }))
    .filter((p) => p.from !== p.to);
  const visible = pairs.filter((p) => isVisible(p.node));
  const hidden = pairs.filter((p) => !visible.includes(p));

  const unlock = lockScroll();
  try {
    await scramble(visible);
  } finally {
    hidden.forEach((p) => (p.node.nodeValue = p.to));

    // Links, etiquetas accesibles y metadatos del otro idioma
    currentEls.forEach((el, i) => {
      for (const name of ATTRS) {
        const value = nextEls[i].getAttribute(name);
        if (value === null) el.removeAttribute(name);
        else if (el.getAttribute(name) !== value) el.setAttribute(name, value);
      }
    });
    document.documentElement.lang = next.documentElement.lang;
    document.title = next.title;
    for (const sel of ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:url"]']) {
      const value = next.querySelector(sel)?.getAttribute('content');
      if (value) document.querySelector(sel)?.setAttribute('content', value);
    }
    for (const sel of ['link[rel="canonical"]', 'link[rel="alternate"]']) {
      const a = next.querySelector(sel);
      const b = document.querySelector(sel);
      if (a && b) ['href', 'hreflang'].forEach((n) => a.getAttribute(n) && b.setAttribute(n, a.getAttribute(n)!));
    }
    const previous = location.pathname;
    history.pushState({ lang: document.documentElement.lang }, '', href + location.hash);
    currentPath = location.pathname;
    // La versión que acabamos de dejar queda lista para volver sin esperar
    pages.set(previous, Promise.resolve(current));
    unlock();
  }
}

export function initLangSwitch(link: HTMLAnchorElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  prefetch(link.getAttribute('href')!);
  link.addEventListener('pointerenter', () => load(link.getAttribute('href')!).catch(() => {}));

  link.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (busy) return;
    busy = true;
    link.setAttribute('aria-busy', 'true');
    const href = link.getAttribute('href')!;
    switchLanguage(href)
      .catch(() => (location.href = href))
      .finally(() => {
        busy = false;
        link.removeAttribute('aria-busy');
      });
  });

  // Atrás/adelante entre idiomas: recargamos la página que corresponde
  // (los saltos a secciones, como #proyectos, cambian solo el hash y no recargan)
  window.addEventListener('popstate', () => {
    if (location.pathname !== currentPath) location.reload();
  });
}
