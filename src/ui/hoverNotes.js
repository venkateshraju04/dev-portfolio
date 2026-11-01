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
  if (href.includes('/resume')) return 'résumé';
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

    // Only touch the DOM when the note actually changes, so the pop-in
    // animation never restarts for the same note
    let current = '';
    const apply = (text) => {
      if (text === current) return;
      current = text;
      if (text) note.textContent = text;
      note.classList.toggle('is-on', !!text);
    };

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      state.cx = e.clientX;
      state.cy = e.clientY;
      note.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      state.over = overLiquid(e.target);
      apply(noteFor(e.target));
    }, { passive: true });

    // Scrolling slides content under a still pointer, and keeps sliding for a
    // moment after (smooth scrolling winding down, the project strip catching up).
    // Keep checking what's underneath every frame, but only switch notes once the
    // new one has held for a few frames, so brushing past an edge or a gap
    // between tickets can't make it flicker.
    const HOLD_FRAMES = 5;
    let watch = 0;
    let watchUntil = 0;
    let candidate = '';
    let held = 0;
    const tick = (now) => {
      const target = document.elementFromPoint(state.cx, state.cy);
      const text = noteFor(target);
      state.over = overLiquid(target);
      if (text === current) {
        held = 0;
      } else if (text === candidate) {
        if (++held >= HOLD_FRAMES) apply(text);
      } else {
        candidate = text;
        held = 1;
      }
      watch = now < watchUntil ? requestAnimationFrame(tick) : 0;
    };
    window.addEventListener('scroll', () => {
      if (state.cx < -900) return; // pointer hasn't been seen yet
      watchUntil = performance.now() + 1500;
      if (!watch) watch = requestAnimationFrame(tick);
    }, { passive: true });
    const hide = () => {
      state.over = false;
      apply('');
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
