// Marker-sticker notes that pop out beside the normal cursor ("that's me" over
// the photo, "open" over a project link, and so on). Notes come from a
// data-hover attribute; links and buttons without one get a note saying what
// the click does. The pointer is also tracked for the hero: over the liquid it
// parts the stripes and nudges the letters of the name.
// Touch screens have no hover, so there are no notes; a finger held on the
// liquid does the parting instead.

const PART_PX = 40; // radius the stripes part around, in CSS px

function actionFor(el) {
  if (el.tagName === 'BUTTON') return el.textContent.trim().toLowerCase();
  const href = el.getAttribute('href') || '';
  if (href.startsWith('mailto:')) return 'say hi';
  if (href === '/resume') return 'résumé';
  if (href.startsWith('#')) return 'go';
  if (href.includes('github.com')) return 'code';
  return 'open';
}

function noteFor(target) {
  if (!(target instanceof Element)) return '';
  const action = target.closest('a, button');
  if (action) return action.dataset.hover || actionFor(action);
  return target.closest('[data-hover]')?.dataset.hover || '';
}

function overLiquid(target) {
  return target instanceof Element && !!target.closest('.hero, .contact') && !target.closest('a, button, p');
}

export function createHoverNotes() {
  const state = { cx: -999, cy: -999, liquid: 0, over: false };
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!fine) {
    window.addEventListener('pointerdown', (e) => {
      state.cx = e.clientX;
      state.cy = e.clientY;
      state.over = overLiquid(e.target);
    }, { passive: true });
    window.addEventListener('pointermove', (e) => {
      state.cx = e.clientX;
      state.cy = e.clientY;
    }, { passive: true });
    const lift = () => { state.over = false; };
    window.addEventListener('pointerup', lift);
    window.addEventListener('pointercancel', lift);
  } else {
    const note = document.createElement('span');
    note.className = 'hover-note';
    note.setAttribute('aria-hidden', 'true');
    document.body.appendChild(note);

    const show = (target) => {
      const text = noteFor(target);
      state.over = overLiquid(target);
      if (text) note.textContent = text;
      note.classList.toggle('is-on', !!text);
    };

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      state.cx = e.clientX;
      state.cy = e.clientY;
      note.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      show(e.target);
    }, { passive: true });
    // scrolling moves content under a still pointer, so re-check what it's over
    window.addEventListener('scroll', () => {
      if (state.cx > -900) show(document.elementFromPoint(state.cx, state.cy));
    }, { passive: true });
    const hide = () => {
      state.over = false;
      note.classList.remove('is-on');
    };
    document.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
  }

  return {
    state,
    radius: PART_PX,
    update(dt) {
      state.liquid += ((state.over ? 1 : 0) - state.liquid) * Math.min(1, dt * 8);
    },
  };
}
