import 'lenis/dist/lenis.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/slab.css';
import './styles/ticket.css';
import './styles/sections.css';
import './styles/hover-notes.css';

import { createCurrents } from './hero/currents.js';
import { createFloatingName } from './hero/floatingName.js';
import { splitSlabs } from './motion/slab.js';
import {
  ScrollTrigger,
  createScroller,
  liquidWidth,
  slamHeadings,
  slamTicketTitles,
  drawStrokes,
  buildWall,
} from './motion/scroll.js';
import { pinTicketStrip, tearOnClick } from './sections/tickets.js';
import { initMenu } from './ui/menu.js';
import { createHoverNotes } from './ui/hoverNotes.js';

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(pointer: coarse)').matches;
const mobile = touch || window.innerWidth < 768;
const fullMotion = !reduced && !mobile;
if (fullMotion) root.classList.add('motion');

// Split slab text into letters first: the hero's floating name is built from them
const slabs = splitSlabs();

function seenIntro() {
  try {
    if (sessionStorage.getItem('currents-intro')) return true;
    sessionStorage.setItem('currents-intro', '1');
  } catch {
    /* storage blocked: just play it */
  }
  return false;
}

/* ---------- The current ---------- */
const pointer = createHoverNotes();
let scene = 'hero';
let floating = null;

const currents = createCurrents(document.getElementById('currents'), {
  mobile,
  onFrame(state, dt) {
    if (state.intro < 10) state.intro += dt;

    // Over the liquid, the pointer parts the stripes and nudges the floating letters
    pointer.update(dt);
    const W = window.innerWidth;
    const H = window.innerHeight;
    const { cx, cy, liquid } = pointer.state;
    const r = pointer.radius * liquid;
    state.cursor = [(cx - W / 2) / H, (H / 2 - cy) / H, r / H];

    if (floating && scene === 'hero') {
      floating.update(dt, state.time, { x: cx, y: cy, r }, state.sink, state.intro, !reduced);
      currents.setMask(floating.drawMask());
    }
  },
});

async function layoutHero() {
  if (!currents) return;
  currents.resize();
  try {
    await document.fonts.load('900 100px Anybody');
  } catch {
    /* measure with the fallback font */
  }
  floating ||= createFloatingName(document.querySelector('.hero__name'));
  const end = floating.measure();

  // the liquid floods out from under the name, and the letters surface as it passes
  const W = window.innerWidth;
  const H = window.innerHeight;
  currents.state.floodFrom = [(end.right * 0.5 - W / 2) / H, (H / 2 - end.cy) / H];
}

if (currents) {
  root.classList.add('webgl');
  const intro = !reduced && !seenIntro();
  currents.state.intro = intro ? 0 : 10;
  await layoutHero();

  if (reduced) {
    currents.renderOnce();
  } else {
    currents.start();
  }
  setTimeout(() => root.classList.add('is-ready'), intro ? 1000 : 50);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      layoutHero();
      if (reduced) currents.renderOnce();
    }, 150);
  });
} else {
  root.classList.add('is-ready');
}

/* ---------- Scroll ---------- */
const lenis = createScroller(fullMotion);
initMenu(lenis);

if (currents) {
  const visible = { hero: true, contact: false };
  const sync = () => {
    if (reduced) return currents.renderOnce();
    if (visible.hero || visible.contact) currents.start();
    else currents.stop();
  };

  // Starts at 'top bottom' so the hero is already active at scroll 0 and
  // re-activates on the way back up; the sink itself tracks the hero's height.
  const hero = document.querySelector('.hero');
  const heroSink = (self) => {
    if (!reduced) currents.state.sink = Math.min(1, Math.max(0, self.scroll() / hero.offsetHeight));
  };
  ScrollTrigger.create({
    trigger: hero,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      if (scene === 'hero') heroSink(self);
    },
    onToggle: (self) => {
      visible.hero = self.isActive;
      if (self.isActive) {
        scene = 'hero';
        heroSink(self);
        currents.state.maskAmt = 1;
      }
      sync();
    },
  });

  // The liquid brightens back up behind the email. Once the contact section's
  // top is on screen we're in the contact scene until the hero returns.
  const enterContact = (self) => {
    if (scene === 'contact' || self.progress <= 0) return;
    scene = 'contact';
    currents.state.maskAmt = 0;
    sync();
  };

  // refreshPriority -1: measure after the work pin has added its spacer
  ScrollTrigger.create({
    trigger: '.contact',
    start: 'top bottom',
    end: 'bottom bottom',
    refreshPriority: -1,
    onRefresh: enterContact,
    onUpdate: (self) => {
      enterContact(self);
      if (scene === 'contact' && !reduced) currents.state.sink = 1 - self.progress;
    },
  });

  ScrollTrigger.create({
    trigger: '.contact',
    start: 'top bottom',
    end: 'bottom top',
    refreshPriority: -1,
    onToggle: (self) => {
      visible.contact = self.isActive;
      sync();
    },
  });

  if (lenis) {
    lenis.on('scroll', ({ velocity }) => {
      currents.state.vel = Math.max(-1, Math.min(1, velocity / 40));
    });
  }
}

if (reduced) {
  root.classList.add('reduced');
} else {
  let strip = null;
  if (fullMotion) {
    liquidWidth(lenis);
    strip = pinTicketStrip();
  }
  slamHeadings(slabs);
  slamTicketTitles(slabs, strip);
  drawStrokes();
  buildWall();
  tearOnClick();
}

// Images and fonts change heights; re-measure once everything has landed
document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());
