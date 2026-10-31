# Personal Portfolio

[venkateshraju.in](https://venkateshraju.in), themed on Tame Impala's *Currents*. The hero
is a WebGL shader of the album cover's moiré: a chrome ball follows your cursor, and my
name shows up only as a bend in the lines.

The [older version](https://dev.venkateshraju.in) is still up if you're curious.

## Run it

```sh
npm install
npm run dev      # local dev server
npm run build    # production build into dist/ (Vercel runs this)
```

## Where things live

- `src/hero/` holds the Currents shader (`currents.frag`), the sphere physics, and the hidden-name mask
- `src/motion/` holds the slab letters, scroll choreography and hand-drawn strokes (GSAP + Lenis)
- `src/sections/tickets.js` holds the pinned 3D ticket strip and the tear-off links
- `public/art/` holds the processed collage pieces. Rebuild them with `python3 scripts/prep-assets.py`
  (needs Pillow + numpy). The portrait cut-out in `art-src/` was made with macOS subject lifting.
