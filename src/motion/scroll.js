import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/** Smooth scroll on desktop, wired into ScrollTrigger. Returns null on touch. */
export function createScroller(enabled) {
  if (!enabled) return null;
  const lenis = new Lenis({ lerp: 0.1, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/** Section headings stretch narrower as you scroll fast, then spring back. */
export function liquidWidth(lenis) {
  const root = document.documentElement;
  let target = 0;
  let flex = 0;
  let shown = 0;
  lenis.on('scroll', ({ velocity }) => {
    target = gsap.utils.clamp(-24, 24, -velocity * 0.9);
  });
  gsap.ticker.add(() => {
    target *= 0.9;
    flex += (target - flex) * 0.14;
    if (Math.abs(flex - shown) > 0.25) {
      shown = flex;
      root.style.setProperty('--flex', `${flex.toFixed(1)}%`);
    }
  });
}

/** Letters slam in, then the marker title scrawls over them. */
export function slamHeadings(slabs) {
  slabs.forEach(({ el, chars }) => {
    if (el.closest('.ticket') || el.closest('.wall') || el.closest('.hero')) return;
    const heading = el.closest('.heading');
    const scribble = heading?.querySelector('.scribble');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: heading || el, start: 'top 82%', once: true },
    });
    tl.from(chars, {
      opacity: 0,
      scale: 1.9,
      yPercent: -35,
      rotate: () => gsap.utils.random(-16, 16),
      duration: 0.55,
      ease: 'back.out(2.4)',
      stagger: 0.04,
    });
    if (scribble) {
      tl.fromTo(
        scribble,
        { clipPath: 'inset(-30% 100% -30% -5%)' },
        { clipPath: 'inset(-30% -5% -30% -5%)', duration: 0.6, ease: 'power2.inOut' },
        '-=0.15',
      );
    }
  });
}

/** Ticket titles get a smaller slam when their ticket comes into view. */
export function slamTicketTitles(slabs, horizontalTween) {
  slabs.forEach(({ el, chars }) => {
    if (!el.closest('.ticket')) return;
    gsap.from(chars, {
      opacity: 0,
      y: 40,
      rotate: () => gsap.utils.random(-20, 20),
      duration: 0.5,
      ease: 'back.out(2)',
      stagger: 0.025,
      scrollTrigger: {
        trigger: el.closest('.ticket'),
        containerAnimation: horizontalTween || undefined,
        start: horizontalTween ? 'left 85%' : 'top 85%',
        once: true,
      },
    });
  });
}

/** Hand-drawn strokes: drawn once on enter, or scrubbed with scroll. */
export function drawStrokes() {
  document.querySelectorAll('svg').forEach((svg) => {
    if (svg.closest('.hero')) return; // the hero arrow draws itself in CSS after the load sequence
    const paths = [...svg.querySelectorAll('[data-draw]')];
    if (!paths.length) return;
    paths.forEach((p) => {
      p.setAttribute('pathLength', '1');
      p.style.strokeDasharray = '1';
      p.style.strokeDashoffset = '1';
    });
    const scrub = paths[0].hasAttribute('data-scrub');
    const tl = gsap.timeline({
      scrollTrigger: scrub
        ? { trigger: svg, start: 'top 85%', end: 'bottom 45%', scrub: 0.6 }
        : { trigger: svg, start: 'top 85%', once: true },
    });
    paths.forEach((p, i) => {
      tl.to(p, { strokeDashoffset: 0, duration: i === 0 ? 0.7 : 0.25, ease: scrub ? 'none' : 'power2.inOut' });
    });
  });
}

/** Tool words slam onto the wall, scrubbed, so scrolling back un-slams them. */
export function buildWall() {
  const words = gsap.utils.toArray('[data-wall]');
  if (!words.length) return;
  gsap.from(words, {
    opacity: 0,
    scale: 0.25,
    yPercent: 60,
    rotate: () => gsap.utils.random(-28, 28),
    ease: 'back.out(1.8)',
    stagger: 0.12,
    scrollTrigger: { trigger: '.wall', start: 'top 88%', end: 'bottom 60%', scrub: 0.8 },
  });
}

export { gsap, ScrollTrigger };
