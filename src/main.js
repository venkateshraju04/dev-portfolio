import 'lenis/dist/lenis.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/slab.css';
import './styles/ticket.css';
import './styles/sections.css';

import { createCurrents } from './hero/currents.js';
import { createSphere } from './hero/sphere.js';
import { drawNameMask } from './hero/nameMask.js';
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

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(pointer: coarse)').matches;
const mobile = touch || window.innerWidth < 768;
const fullMotion = !reduced && !mobile;
if (fullMotion) root.classList.add('motion');

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
const sphere = createSphere();
let scene = 'hero';
let heroRest = { x: 0.2, y: -0.15 };
let heroRadius = 0.115;

function contactRest() {
  const aspect = window.innerWidth / window.innerHeight;
  return aspect > 0.9 ? { x: 0.34 * aspect, y: 0.2 } : { x: 0.24 * aspect, y: 0.3 };
}

const currents = createCurrents(document.getElementById('currents'), {
  mobile,
  onFrame(state, dt) {
    if (state.intro < 10) state.intro += dt;
    if (state.intro > 1.1) sphere.unlock();
    sphere.update(dt, state.time);
    state.sphere = sphere.uniform;
    state.trail = sphere.trail;
  },
});

async function layoutHero(snap) {
  if (!currents) return;
  currents.resize();
  const { canvas, rest, radius } = await drawNameMask();
  currents.setMask(canvas);
  heroRest = rest;
  heroRadius = radius;
  sphere.setRadius(radius);
  sphere.setRest(...Object.values(scene === 'hero' ? heroRest : contactRest()), snap);
}

if (currents) {
  root.classList.add('webgl');
  const intro = !reduced && !seenIntro();
  currents.state.intro = intro ? 0 : 10;
  await layoutHero(true);

  if (reduced) {
    currents.renderOnce();
  } else {
    currents.start();
  }
  setTimeout(() => root.classList.add('is-ready'), intro ? 1300 : 50);

  window.addEventListener('pointermove', (e) => sphere.pointer(e.clientX, e.clientY), { passive: true });
  document.addEventListener('pointerleave', () => sphere.release());
  window.addEventListener('blur', () => sphere.release());

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      layoutHero(false);
      if (reduced) currents.renderOnce();
    }, 150);
  });
} else {
  root.classList.add('is-ready');
}

/* ---------- Scroll ---------- */
const lenis = createScroller(fullMotion);
const slabs = splitSlabs();
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
        sphere.setRadius(heroRadius);
        sphere.setRest(heroRest.x, heroRest.y, reduced);
      }
      sync();
    },
  });

  // The ball rises back out of the liquid beside the email. Once the contact
  // section's top is on screen we're in the contact scene until the hero returns.
  const enterContact = (self) => {
    if (scene === 'contact' || self.progress <= 0) return;
    scene = 'contact';
    currents.state.maskAmt = 0;
    const r = contactRest();
    sphere.setRadius(heroRadius * 0.9);
    sphere.setRest(r.x, r.y, true);
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
