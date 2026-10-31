import { gsap } from 'gsap';

/**
 * Pins the work section and pans a tilted 3D table under the camera.
 * Returns the scrubbed timeline so other triggers can follow it horizontally.
 */
export function pinTicketStrip() {
  const section = document.querySelector('.work');
  const track = section.querySelector('.work__track');
  const plane = section.querySelector('.work__plane');
  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${distance() * 1.15}`,
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });

  tl.to(track, { x: () => -distance(), duration: 1 }, 0);
  // The camera drifts: tilted back at the start, leaning in mid-way, easing off at the end
  tl.fromTo(
    plane,
    { rotateX: 16, rotateY: -12, rotateZ: -3, scale: 0.86 },
    {
      keyframes: [
        { rotateX: 6, rotateY: 5, rotateZ: 1, scale: 1, duration: 0.5, ease: 'sine.inOut' },
        { rotateX: 11, rotateY: -4, rotateZ: -1.5, scale: 0.93, duration: 0.5, ease: 'sine.inOut' },
      ],
    },
    0,
  );

  // Keyboard focus on an off-screen ticket: scroll to where the pan shows it
  track.addEventListener('focusin', (e) => {
    const ticket = e.target.closest('.ticket');
    const st = tl.scrollTrigger;
    if (!ticket || !st || !distance()) return;
    const centre = ticket.offsetLeft + ticket.offsetWidth / 2 - window.innerWidth / 2;
    const progress = Math.min(1, Math.max(0, centre / distance()));
    window.scrollTo(0, st.start + progress * (st.end - st.start));
  });

  return tl;
}

/** Clicking a ticket's link tears the stub off along the perforation. */
export function tearOnClick() {
  document.querySelectorAll('.ticket__link').forEach((link) => {
    link.addEventListener('click', () => {
      const stub = link.closest('.ticket__stub');
      const art = stub.previousElementSibling;
      gsap.killTweensOf([stub, art]);
      gsap
        .timeline()
        .to(stub, { x: 70, y: 150, rotate: 22, opacity: 0, duration: 0.55, ease: 'power2.in' })
        .to(art, { rotate: -1.5, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0)
        .to(stub, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' }, '+=1.2')
        .set([stub, art], { clearProps: 'transform,opacity' });
    });
  });
}
