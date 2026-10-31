// Draws the name into an offscreen canvas. The shader never shows this
// directly: it only shifts the stripes wherever the letters are.

const LINES = ['VENKATESH', 'RAJU'];

/**
 * @returns {{ canvas: HTMLCanvasElement, rest: {x:number,y:number}, radius: number }}
 * rest/radius tell the sphere where to sit so it doesn't cover the name.
 */
export async function drawNameMask() {
  try {
    await document.fonts.load('900 100px Anybody');
  } catch {
    /* fall back to whatever the browser has */
  }

  const W = window.innerWidth;
  const H = window.innerHeight;
  const aspect = W / H;
  const scale = 0.5;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'alphabetic';
  // Soft edges make the lines bend into the letters instead of snapping
  ctx.filter = `blur(${Math.max(2, H * 0.0035)}px)`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(H * 0.008)}px`;

  // font-stretch has to live in the shorthand: setting ctx.font resets it
  const setFont = (px) => { ctx.font = `900 condensed ${px}px Anybody, sans-serif`; };
  const portrait = H > W * 1.1;

  if (!portrait) {
    // Two lines across the upper left
    setFont(100);
    const fit = (W * 0.7) / ctx.measureText(LINES[0]).width;
    const size = Math.min(100 * fit, H * 0.3);
    setFont(size);
    const left = W * 0.055;
    const top = H * 0.2 + size * 0.72;
    ctx.fillText(LINES[0], left, top);
    ctx.fillText(LINES[1], left, top + size * 0.86);
    return { canvas, rest: { x: 0.24 * aspect, y: -0.2 }, radius: 0.115 };
  }

  // Phones: the name runs up the left edge, like a spine
  setFont(100);
  const fit = (H * 0.78) / ctx.measureText(LINES[0]).width;
  const size = Math.min(100 * fit, W * 0.34);
  setFont(size);
  ctx.save();
  ctx.translate(W * 0.05 + size * 0.72, H * 0.89);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(LINES[0], 0, 0);
  ctx.fillText(LINES[1], 0, size * 0.86);
  ctx.restore();
  return { canvas, rest: { x: 0.2 * aspect, y: -0.08 }, radius: 0.085 };
}
