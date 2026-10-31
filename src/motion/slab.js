// Splits slab text into letters, each in a palette colour with no two
// neighbours alike. Colours are seeded from the text so they never reshuffle.

const PALETTE = ['var(--violet)', 'var(--brick)', 'var(--mustard)'];

function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function splitSlabs(root = document) {
  const out = [];
  root.querySelectorAll('[data-slab], [data-wall]').forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    const label = el.textContent.trim();
    const rand = seeded(label);
    let prev = -1;
    const chars = [];

    [...el.childNodes].forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      node.textContent.trim().split(/\s+/).forEach((word, wi, words) => {
        const w = document.createElement('span');
        w.className = 'slab__word';
        w.setAttribute('aria-hidden', 'true');
        for (const ch of word) {
          const c = document.createElement('span');
          c.className = 'slab__ch';
          let idx = Math.floor(rand() * PALETTE.length);
          if (idx === prev) idx = (idx + 1 + Math.floor(rand() * 2)) % PALETTE.length;
          prev = idx;
          c.style.setProperty('--c', PALETTE[idx]);
          c.textContent = ch;
          w.appendChild(c);
          chars.push(c);
        }
        frag.appendChild(w);
        if (wi < words.length - 1) frag.appendChild(document.createTextNode(' '));
      });
      node.replaceWith(frag);
    });

    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = label;
    el.prepend(sr);
    out.push({ el, chars });
  });
  return out;
}
