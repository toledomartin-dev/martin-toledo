// Menú desplegable (celular y CV): la animación la hace .pop-menu en global.css con [data-open].
// Se cierra con Escape, tocando afuera o eligiendo una opción.
export function bindMenu(button: HTMLElement, menu: HTMLElement) {
  const setOpen = (open: boolean) => {
    menu.toggleAttribute('data-open', open);
    menu.inert = !open;
    button.setAttribute('aria-expanded', String(open));
  };
  setOpen(false);

  button.addEventListener('click', () => setOpen(!menu.hasAttribute('data-open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('pointerdown', (e) => {
    const target = e.target as Node;
    if (menu.hasAttribute('data-open') && !menu.contains(target) && !button.contains(target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !menu.hasAttribute('data-open')) return;
    setOpen(false);
    button.focus();
  });
}
