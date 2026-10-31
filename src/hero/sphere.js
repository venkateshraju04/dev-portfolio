// The chrome ball: a heavy spring that chases the pointer, and the lava stream
// it sheds. Positions are in shader space (aspect-corrected, y up, centre origin).

const TRAIL = 24;
const EMIT_EVERY = 0.06; // seconds between trail points
const IDLE_AFTER = 4000; // ms without input before the ball drifts home

export function createSphere() {
  const pos = { x: 0.2, y: -0.15 };
  const vel = { x: 0, y: 0 };
  const target = { x: pos.x, y: pos.y };
  const rest = { x: pos.x, y: pos.y };
  const pts = Array.from({ length: TRAIL }, () => ({ x: pos.x, y: pos.y }));
  const trail = new Float32Array(TRAIL * 2);
  let radius = 0.115;
  let lastInput = -Infinity;
  let emitAcc = 0;
  let locked = true;

  function toShader(clientX, clientY) {
    const h = window.innerHeight;
    return { x: (clientX - window.innerWidth / 2) / h, y: (h / 2 - clientY) / h };
  }

  return {
    trail,
    get uniform() {
      return [pos.x, pos.y, radius];
    },
    setRadius(r) {
      radius = r;
    },
    setRest(x, y, snap = false) {
      rest.x = x;
      rest.y = y;
      if (snap) {
        pos.x = target.x = x;
        pos.y = target.y = y;
        pts.forEach((p) => { p.x = x; p.y = y; });
      }
    },
    unlock() {
      locked = false;
    },
    pointer(clientX, clientY) {
      if (locked) return;
      const p = toShader(clientX, clientY);
      target.x = p.x;
      target.y = p.y;
      lastInput = performance.now();
    },
    release() {
      lastInput = -Infinity;
    },
    update(dt, time) {
      if (performance.now() - lastInput > IDLE_AFTER) {
        // drift around the resting spot so the scene never freezes
        target.x = rest.x + Math.sin(time * 0.31) * 0.03;
        target.y = rest.y + Math.sin(time * 0.23 + 1.3) * 0.018;
      }
      // slightly under-damped: it overshoots a touch, like something with mass
      const k = 34;
      const d = 2 * Math.sqrt(k) * 0.78;
      vel.x += (k * (target.x - pos.x) - d * vel.x) * dt;
      vel.y += (k * (target.y - pos.y) - d * vel.y) * dt;
      pos.x += vel.x * dt;
      pos.y += vel.y * dt;

      // the stream flows down-right like the cover; each point rides its own patch of current
      for (let i = 1; i < TRAIL; i++) {
        const p = pts[i];
        p.x += (0.12 + 0.11 * Math.sin(p.y * 9 + time * 0.5)) * dt;
        p.y += (-0.11 + 0.09 * Math.cos(p.x * 8 - time * 0.4)) * dt;
      }
      emitAcc += dt;
      if (emitAcc >= EMIT_EVERY) {
        emitAcc = 0;
        const tail = pts.pop();
        tail.x = pos.x;
        tail.y = pos.y;
        pts.splice(1, 0, tail);
      }
      pts[0].x = pos.x;
      pts[0].y = pos.y;
      for (let i = 0; i < TRAIL; i++) {
        trail[i * 2] = pts[i].x;
        trail[i * 2 + 1] = pts[i].y;
      }
    },
  };
}
