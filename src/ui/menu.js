// The tracklist: a full-screen back-cover menu. Esc or a link closes it.

export function initMenu(lenis) {
  const button = document.querySelector('.corner__menu');
  const panel = document.getElementById('tracklist');
  if (!button || !panel) return;

  const focusables = () => [button, ...panel.querySelectorAll('a')];

  function open() {
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    button.textContent = 'Close';
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    panel.querySelector('a')?.focus();
  }

  function close({ restoreFocus = true } = {}) {
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Menu';
    lenis?.start();
    document.body.style.overflow = '';
    if (restoreFocus) button.focus();
  }

  button.addEventListener('click', () => (panel.hidden ? open() : close()));

  panel.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    e.preventDefault();
    close({ restoreFocus: false });
    const target = document.querySelector(link.getAttribute('href'));
    if (lenis) lenis.scrollTo(target, { offset: 0 });
    else target?.scrollIntoView();
    target?.setAttribute('tabindex', '-1');
    target?.focus({ preventScroll: true });
  });

  document.addEventListener('keydown', (e) => {
    if (panel.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const items = focusables();
      const i = items.indexOf(document.activeElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
      e.preventDefault();
      items[next].focus();
    }
  });
}
