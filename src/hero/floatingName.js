// The name floats on the current. Each slab letter bobs with the flow, gets
// shoved aside by the chrome ball and springs back, and is redrawn every frame
// into a small mask so the shader can bend its lines and cast shadows around it.

const MASK_SCALE = 0.25;
const K = 42; // spring back to rest (1/s²)
const C = 2 * Math.sqrt(K) * 0.42; // under-damped, so letters wobble after a hit
const PUSH = 5200; // px/s² at full overlap
const TORQUE = 900; // deg/s² at full overlap

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function easeOutBack(x) {
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
}

export function createFloatingName(nameEl) {
  const letters = [...nameEl.querySelectorAll('.slab__ch')].map((el, i) => ({
    el, i, ch: el.textContent,
    cx: 0, cy: 0, rx: 0, ry: 0,           // resting centre (page px) and hit radii
    x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, // physics offset from rest
    ty: 0, rot: 0, sc: 1, vis: 1,          // what was last drawn
  }));
  const mask = document.createElement('canvas');
  const ctx = mask.getContext('2d');
  let fontPx = 100;

  /** Measure resting positions. Returns the end of the last letter (viewport px). */
  function measure() {
    letters.forEach((l) => { l.el.style.transform = 'none'; });
    const sy = window.scrollY;
    letters.forEach((l) => {
      const b = l.el.getBoundingClientRect();
      l.cx = b.left + b.width / 2;
      l.cy = b.top + b.height / 2 + sy;
      l.rx = b.width * 0.5;
      l.ry = b.height * 0.42;
    });
    fontPx = parseFloat(getComputedStyle(nameEl).fontSize);
    mask.width = Math.max(1, Math.round(window.innerWidth * MASK_SCALE));
    mask.height = Math.max(1, Math.round(window.innerHeight * MASK_SCALE));
    const last = letters[letters.length - 1];
    return { right: last.cx + last.rx, cy: last.cy - sy, fontPx };
  }

  /**
   * @param ball  {x, y, r} in viewport px
   * @param sink  0..1 as the hero scrolls away
   * @param intro seconds since the load sequence began (large when skipped)
   * @param live  false for reduced motion: no bobbing, no collisions
   */
  function update(dt, time, ball, sink, intro, live) {
    const sy = window.scrollY;
    for (const l of letters) {
      if (live && dt > 0) {
        const dx = l.cx + l.x - ball.x;
        const dy = l.cy - sy + l.y - ball.y;
        // overlap measured in an ellipse around the letter, grown by the ball radius
        const ex = dx / (l.rx + ball.r);
        const ey = dy / (l.ry + ball.r);
        const d = Math.hypot(ex, ey);
        if (d < 1 && d > 1e-4) {
          const o = 1 - d;
          l.vx += (ex / d) * o * PUSH * dt;
          l.vy += (ey / d) * o * PUSH * dt;
          l.vr += Math.sign(ex || 1) * o * TORQUE * dt;
        }
        l.vx += (-K * l.x - C * l.vx) * dt;
        l.vy += (-K * l.y - C * l.vy) * dt;
        l.vr += (-K * l.r - C * l.vr) * dt;
        l.x = clamp(l.x + l.vx * dt, -fontPx, fontPx);
        l.y = clamp(l.y + l.vy * dt, -fontPx, fontPx);
        l.r = clamp(l.r + l.vr * dt, -40, 40);
      }

      // surface one by one after the flood; sink one by one as you scroll
      const rise = clamp((intro - 1.05 - l.i * 0.05) / 0.55, 0, 1);
      const up = rise >= 1 ? 1 : easeOutBack(rise);
      const s = clamp(sink * 1.6 - l.i * 0.035, 0, 1);
      const bob = live ? Math.sin(time * 1.15 + l.i * 0.75) * fontPx * 0.02 : 0;
      const sway = live ? Math.sin(time * 0.8 + l.i * 1.3) * 1.6 : 0;

      l.ty = l.y + bob + s * fontPx * 0.5 + (1 - up) * fontPx * 0.4;
      l.rot = l.r + sway;
      l.sc = (0.55 + 0.45 * up) * (1 - s * 0.2);
      l.vis = Math.min(1, rise * 2.5) * (1 - s);
      l.el.style.transform = `translate3d(${l.x.toFixed(1)}px, ${l.ty.toFixed(1)}px, 0) rotate(${l.rot.toFixed(2)}deg) scale(${l.sc.toFixed(3)})`;
      l.el.style.opacity = l.vis.toFixed(3);
    }
  }

  /** Paint the letters, as they currently sit, into the low-res shader mask. */
  function drawMask() {
    const s = MASK_SCALE;
    const sy = window.scrollY;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = 'none';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, mask.width, mask.height);
    ctx.filter = `blur(${Math.max(1.5, fontPx * s * 0.06)}px)`;
    // font-stretch lives in the shorthand: setting ctx.font resets it
    ctx.font = `900 extra-condensed ${fontPx * s}px Anybody, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const l of letters) {
      if (l.vis < 0.02) continue;
      ctx.fillStyle = `rgba(255,255,255,${l.vis})`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate((l.cx + l.x) * s, (l.cy - sy + l.ty) * s);
      ctx.rotate((l.rot * Math.PI) / 180);
      ctx.scale(l.sc, l.sc);
      ctx.fillText(l.ch, 0, fontPx * s * 0.05);
    }
    return mask;
  }

  return { measure, update, drawMask };
}
