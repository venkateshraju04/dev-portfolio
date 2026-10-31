# Currents portfolio: implementation plan

A rebuild of venkateshraju.in themed on Tame Impala's *Currents* (2015): the album
cover's liquid moiré and chrome sphere, plus the collage look of the reference lyric
video in `../resources` (ticket stubs, slammed block letters, marker scribbles,
halftone photos).

Content stays the same as the current site: the same projects, bio, experience,
links, SEO meta, JSON-LD, Vercel analytics and `/resume` redirects.

---

## 1. Concept

**The site is the album cover, and you are the sphere.**

The cover shows a chrome ball rolling through a field of purple lines. Its weight
bends the lines, and a red-to-yellow streak marks its path. That single image is the
signature of the site. It gets a full-screen WebGL treatment, and every other section
is a quieter, scroll-driven collage taken from the lyric video.

Three ideas carry it:

1. **Your name appears only as a bend in the current.** The hero has no headline
   text. The letters of "VENKATESH RAJU" are a hidden displacement field, and the
   moiré lines ripple around them like water around a rock. You see the name because
   the lines bend, never because it's filled in. This is the mind-bending moment.
2. **The sphere follows you.** The chrome ball tracks the cursor with some lag, as
   if it were heavy and gliding. It dents the lines as it moves and leaves the
   red/orange/yellow trail from the cover. It reflects the field it sits in.
3. **Scrolling is a camera moving over a collage table.** Below the hero, the lyric
   video's language takes over: chamfered ticket stubs at slight angles on a warm
   grey table, block letters slamming in with mixed colours, marker scribbles
   drawing themselves over words, brush arrows pointing at what matters.

---

## 2. Design tokens

### Colour (sampled from the cover and the references)

| Token            | Hex       | Source / role                                                    |
|------------------|-----------|------------------------------------------------------------------|
| `--violet`       | `#7B5CC4` | Lyric-video purple. Display letters, brush strokes               |
| `--lilac`        | `#C3A8F2` | The light bands of the cover moiré                               |
| `--deep-current` | `#24123F` | The dark bands of the moiré. Hero base                           |
| `--brick`        | `#C9402B` | Red letters, the laser line, ticket backgrounds                  |
| `--mustard`      | `#F0C443` | Cover type ("TAME IMPALA / CURRENTS"), trail tail, scribbles     |
| `--ink`          | `#000000` | True black under film grain, as in the lyric video               |
| `--bone`         | `#EDE7DC` | Ticket stubs and body text on black (supporting)                 |
| `--table`        | `#8F8B85` | Warm grey collage table behind the ticket strip (supporting)     |

The trail gradient runs `--brick → #E8702A → --mustard` along its length, as on the cover.

Contrast rules: body text is always `--bone` on `--ink` or `--ink` on `--bone`/`--mustard`.
`--violet` on black is about 4.2:1, so use it for display sizes only.

### Type

One family plus one hand:

- **Anybody** (Google Fonts, variable: `wdth` 50–150, `wght` 100–900). Used for all
  display and body text.
  - Display: `wght 900`, `wdth` ranging 60 (tall, condensed, like "IS THERE ONE") to
    150 (wide and blocky, like the "TAME IMPALA" stamp on the stubs).
  - Body: `wght 400`, `wdth 100`, 18px / 1.5, max 64ch.
  - The `wdth` axis is animated. Text squashes and stretches with scroll velocity, so
    type moves like liquid without extra fonts.
- **Permanent Marker**. Used only for scribble overlays (the "STARTING" over STARTING
  move in ref 3.31.36). Never for body text or headings.

Scale (after Bringhurst's classic scale, extended for display):
`14 · 18 · 24 · 36 · 60 · 96 · clamp(120px, 22vw, 360px)`.

Display treatment for the lyric-video "sticker" letter:
```css
.slab {
  font-variation-settings: "wght" 900, "wdth" 70;
  -webkit-text-stroke: 0.08em var(--ink);
  paint-order: stroke fill;              /* outline sits outside the fill */
  text-shadow: 0.04em 0.05em 0 var(--ink); /* the slight extrusion from "WILL I BE" */
  line-height: 0.86;
  letter-spacing: -0.01em;
}
```
Each letter gets a colour from `[violet, brick, mustard]`, with no two neighbours the
same, like "THAT TRUST" and "SOBER". This is decided once with a seeded random
function so letters don't shuffle on every reload.

### Shapes

- **Ticket**: `clip-path` polygon with 4 chamfered corners (about 4% of the shorter
  side). A perforation line made from a `radial-gradient` dot mask divides the
  *artwork* part (left) from the *stub* part (right). The structure carries meaning:
  the artwork is the project, the stub is where you get in (link, stack, year).
- **Brush strokes and arrows**: hand-drawn SVG paths (made in Figma/Illustrator by
  tracing the references), drawn in with `stroke-dashoffset`.
- **Halftone**: photos are converted offline to B&W halftone PNGs. Screenshots get a
  violet/brick/mustard gradient map plus halftone, so they read as printed collage
  pieces.
- **Grain**: one tiled 256px noise PNG over everything at 6% opacity with
  `mix-blend-mode: overlay`.

---

## 3. Page structure and wireframes

Nav: a fixed strip in the top corners, copying the cover's corner type. Top-left
shows `Venkatesh Raju` in mustard. Top-right shows the menu, set like the cover's
"CURRENTS" mark. The menu opens as a back-cover tracklist (Work, About, Experience,
Skills, Contact), with no numbers because the sections are not a sequence.

Each section has a **plain heading** as its big slab word, and an optional **track
title** scribbled over it in marker as an easter egg. The heading tells visitors
where they are; the scribble is for fans.

| Section    | Slab word   | Marker scribble          |
|------------|-------------|--------------------------|
| Hero       | (none)      | (none)                   |
| About      | ABOUT       | *yes I'm changing*       |
| Work       | WORK        | *reality in motion*      |
| Experience | NOW         | *the moment*             |
| Skills     | TOOLS       | *eventually*             |
| Contact    | SAY HI      | *let it happen*          |

### 3.1 Hero: the current (100vh, WebGL)

```
┌──────────────────────────────────────────────────────────┐
│ Venkatesh Raju                         Currently: Dscape │  ← cover-style corner type, mustard
│  ╲                                                        │
│   ╲  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈      │  ← red laser line from top-left
│    ╲ ≈≈≈≈≈≈≈ V E N K A T E S H ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈      │     (letters exist ONLY as
│     ╲≈≈≈≈≈≈≈≈≈≈≈≈ R A J U ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈      │      line displacement)
│      ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈  (◉)  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈      │  ← chrome sphere follows cursor
│      ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈╲≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈      │  ← brick→mustard trail
│      ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈╲≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈      │
│ I build full-stack apps and AI agents.                   │  ← one line, bone, bottom-left
└──────────────────────────────────────────────────────────┘
```
- Left-aligned corner type, no centred hero block, no CTA buttons.
- Real `<h1>Venkatesh Raju</h1>` is in the DOM (visually hidden) for SEO and screen
  readers. The shader shows the bent version.
- On scroll (0 → 100vh): the sphere sinks into the liquid, the lines close over it,
  the field darkens to `--ink`, and the camera tips forward onto the collage table.

### 3.2 About (collage frame, ref 3.30.01)

```
┌──────────────────────────────────────────────────────────┐
│   ┌───────────────────────╮                              │
│   │ ░ brick ticket ░      │╲   A B O U T   ← slab, mixed │
│   │  ▓▓ halftone cut-out ▓│ ╲    yes I'm changing        │
│   │  ▓▓ of you, breaking ▓│  ╲   (marker scribble)       │
│   │  ▓▓ out of the frame ▓│                              │
│   ╰───────────────────────┘    Final-year CS at RVITM…   │  ← body, 64ch max, left aligned
│      ~~~ mustard brush ~~~>    Agentic AI dev at Dscape… │
└──────────────────────────────────────────────────────────┘
```
- Your photo (`sources/20250507_180844.JPG`, the one in front of the stage) is cut
  out, halftoned, and placed so your head and shoulders break out of the top of a
  brick-red ticket. This is the "pop out of the card" move from the reference.
- Use the stats from the current site (projects built, 300+ DSA problems, 8.86 CGPA,
  research papers) as stamps on the ticket edge in Anybody `wdth 150`, not as a
  count-up stat row.

### 3.3 Work: the ticket strip (pinned horizontal scroll)

```
grey table ─────────────────────────────────────────────────────────────▶ scroll
 ┌──────────────────────┊────────╮   ┌──────────────────────┊────────╮
 │ duotone screenshot   ┊ 2025   │   │                      ┊ 2025   │
 │   AI TREND           ┊ n8n    │   │   SALES              ┊ Python │
 │   SCOUT   ← slab     ┊ AWS    │   │   FORECAST           ┊ 90.46% │
 │                      ┊ Visit  │   │                      ┊ Code   │
 ╰──────────────────────┊────────┘   ╰──────────────────────┊────────┘
   rotated -2°                          rotated +1.5°, slightly lower
```
- Six tickets: AI Trend Scout, Sales Forecasting, NeuroRAG-PD, Chat Sync, Blockchain
  Voting, Blog. Each has its own fixed tilt and vertical offset so the table looks
  hand-placed.
- Projects with screenshots (`aits.png`, `sales.jpg`, `chat-sync.png`, `blog.png`)
  get the gradient-map + halftone treatment. NeuroRAG and Blockchain are
  typography-only tickets: slab letters on a violet moiré swatch rendered from the
  same shader as a static PNG.
- **Interaction**: hovering the stub lifts it along the perforation. Clicking tears
  it off (a short tear animation along the dashed line) and then opens the link. The
  motion confirms the click. Keyboard focus shows the same lift.
- Camera: ScrollTrigger scrubs a GSAP timeline that pans *and* slightly rotates and
  zooms a CSS 3D plane (`perspective: 1400px`), like the lyric video's
  camera-over-collage moves, rather than a flat horizontal slide.

### 3.4 Experience: now (one tall frame, ref 3.30.58)

```
┌──────────────────────────────────────────────────────────┐
│                                         N               │
│   Agentic AI Developer                  O   ← slab stack,│
│   Dscape.AI, since Jan 2026             W     violet /   │
│   Building n8n pipelines, RAG, NLP…     the moment       │
│                                         ╲ purple brush   │
│   [n8n] [RAG] [NLP] [ML] [Python]        ╲ arrow drawn   │
└──────────────────────────────────────────────────────────┘
```
Tags are small bone stickers with chamfered corners, not pills.

### 3.5 Skills: the word wall (refs 3.31.21 / 3.33.07)

```
┌──────────────────────────────────────────────────────────┐
│  R E A C T    N O D E    P Y T H O N                     │  ← each word a slab, letters mixed colour
│      M O N G O D B   C + +   A W S                       │     words slam in with rotation + overshoot
│  D O C K E R    n 8 n    S U P A B A S E                 │     as you scroll; a mustard marker loop
│        G I T   V E R C E L   L I N U X                   │     draws around 3 favourites
└──────────────────────────────────────────────────────────┘
```
This replaces the current marquee and the "01 / 02 / 03 / 04" skill cards. The four
skill-area descriptions become short bone captions pinned to the wall.

### 3.6 Contact: let it happen

```
┌──────────────────────────────────────────────────────────┐
│  ≈≈≈≈≈≈≈≈ moiré returns (same shader, calmer) ≈≈≈≈≈≈≈≈≈   │
│                                                          │
│      S A Y   H I        ← slab                           │
│      me@venkateshraju.in   ← huge, mixed-colour letters, │
│                              mailto link                 │
│      GitHub   LinkedIn   Blog   Résumé                   │
│                                                          │
│  Inspired by Currents (Tame Impala, 2015). © 2026        │
└──────────────────────────────────────────────────────────┘
```
The sphere comes back up out of the liquid and rests beside the email, closing the
loop with the hero.

---

## 4. The hero shader (the one memorable thing)

One full-screen fragment shader (WebGL2, ~150 lines). No three.js needed.

```glsl
// uniforms: uTime, uRes, uSphere (xy, radius), uTrail[24] (vec2 history),
//           uNameSDF (sampler2D: blurred text mask), uScroll, uVelocity
float field(vec2 p) {
  vec2 q = p;
  q += 0.35 * vec2(fbm(p * 1.3 + uTime * 0.03), fbm(p * 1.3 - uTime * 0.025)); // slow current
  q += dentFromSphere(p, uSphere) ;            // lines pushed radially around the ball
  q.y += 0.06 * texture(uNameSDF, uv).r;       // letters exist only as a bump
  q.y += uVelocity * 0.15 * sin(p.x * 3.0);    // scroll smear
  return q.y * 60.0;                           // band frequency
}
vec3 bands(float f) {
  float l = smoothstep(0.45, 0.55, abs(fract(f) - 0.5) * 2.0);   // crisp stripes
  return mix(DEEP_CURRENT, LILAC, l);
}
// Sphere: analytic. Normal from screen-space position, reflect view ray, sample
// bands(field(reflectedCoord)), add fresnel + a hard white highlight → chrome
// that reflects the field it sits in, exactly like the cover.
// Trail: distance to the polyline uTrail[] → brick→orange→mustard by index, with a
// soft edge, drawn under the lines that wrap around it.
```

Building it:
1. Static stripes with fbm flow. Tune band frequency and colours against the cover
   image next to each other until they match.
2. Sphere dent and analytic chrome sphere at a fixed position.
3. Cursor following with a critically damped spring in JS (`k ≈ 40`, damping 2√k),
   so the ball feels heavy.
4. Trail: ring buffer of the last 24 sphere positions, sampled every 40ms.
5. Name SDF: render "VENKATESH RAJU" to an offscreen 2D canvas in Anybody 900, blur
   it (or run a jump-flood SDF), and upload it as a texture. Lines bend around it.
6. The laser line: a fixed thin brick-to-pink line from the top-left into the sphere,
   as on the cover.
7. Scroll uniforms: the sphere sinks, the field darkens, smear follows velocity.

Performance:
- Device pixel ratio capped at 1.5 on desktop and 1 on mobile. Adaptive: if frame
  time stays above 20ms for 30 frames, drop the render scale by 0.75.
- Pause the render loop when the hero is off-screen (IntersectionObserver) and when
  the tab is hidden.
- `prefers-reduced-motion`: render a single frame that matches the cover's
  composition (sphere lower-centre, trail going down-right) and stop there.
- Without WebGL: a pre-rendered PNG of that same frame.

---

## 5. Motion system

The brief asks for a lot of motion, so the motion budget goes to **scroll-driven**
choreography (which the visitor controls). Ambient motion that runs on its own is
limited to the hero current.

| Moment               | Trigger            | Technique                                                   |
|----------------------|--------------------|-------------------------------------------------------------|
| Page load (≤1.6s)    | load               | Red laser line draws diagonally → sphere drops onto it and splashes → moiré floods outward from the impact. Skipped on repeat visits within a session. |
| Hero exit            | scroll 0–100vh     | Shader uniforms: sink, darken, camera tip.                  |
| Slab words           | enter viewport     | SplitText chars slam in with random rotation (±8°), scale 1.4→1, `back.out(2)`, stagger 0.03s. |
| Marker scribbles     | after slab lands   | SVG path `stroke-dashoffset` draw (0.5s) + text fades in along it. |
| Brush arrows         | scroll scrub       | Drawn in proportion to scroll progress.                     |
| Liquid type          | scroll velocity    | `wdth` axis on all slabs follows velocity (fast scroll → narrower and taller), springs back. |
| Ticket strip         | pinned scrub       | 3D plane pan + rotate + zoom.                               |
| Ticket stub          | hover / click      | Lift, then tear along perforation, then navigate.           |
| Cursor               | pointer            | Small chrome bead with a 6-point brick trail (desktop only). The hero sphere replaces it inside the hero. |

Libraries: **GSAP 3** (core, ScrollTrigger, SplitText; all free since 2025) and
**Lenis** for smooth scrolling on desktop only. Mobile keeps native scrolling.

---

## 6. Tech and file structure

Recommendation: move to **Vite + vanilla JS** (no framework). It gives hot reload
while tuning the shader (where most of the time will go), `?raw` GLSL imports,
font and image hashing, and Vercel picks it up automatically. (A no-build version
with an import map from jsDelivr would also work if you'd rather keep the repo flat.)

```
index.html                 ← keep all meta, JSON-LD, analytics, noscript content
src/
  main.js                  ← boot, feature detection, reduced-motion switch
  hero/currents.js         ← WebGL setup, uniforms, render loop, adaptive DPR
  hero/currents.frag       ← the shader
  hero/nameMask.js         ← offscreen canvas text → SDF texture
  hero/sphere.js           ← spring follow + trail ring buffer
  motion/scroll.js         ← Lenis + ScrollTrigger wiring
  motion/slab.js           ← letter colouring (seeded), slam-in, wdth-velocity
  motion/scribble.js       ← SVG scribble/arrow drawing
  sections/tickets.js      ← pinned strip, tear interaction
  ui/cursor.js, ui/menu.js
  styles/tokens.css        ← palette, type scale, spacing
  styles/base.css, styles/slab.css, styles/ticket.css, styles/sections.css
public/
  sources/                 ← existing assets + processed versions
  textures/grain.png, art/*.svg (brushes, arrows, scribbles)
  robots.txt, sitemap.xml
vercel.json                ← unchanged (headers, /resume redirects)
```

The current `app.js` / `style.css` (loader, magnetic buttons, marquee, cursor) are
replaced, not extended.

---

## 7. Build phases

**Phase 0: Setup and assets (½ day)**
- Branch `currents`, add Vite, move static files to `public/`, confirm the Vercel
  preview deploys and `/resume` still redirects.
- Asset prep (a one-off `scripts/prep-assets.mjs` using `sharp`):
  - Portrait: remove the background (Photoshop or remove.bg), then grayscale,
    contrast, and halftone, exported as WebP and PNG.
  - Screenshots: 3-stop gradient map (deep-current → brick → mustard) plus halftone.
  - Grain tile, static hero fallback frame, OG image (the hero frame with your name).
- Draw 6–8 SVG strokes by tracing the references: 2 brush arrows, 1 loop, 3
  scribble underlines/strike-throughs, 1 heart-hands shape for the About ticket.

**Phase 1: Static build, no motion (1 day)**
- Every section in final HTML with real content and tokens applied, responsive down
  to 360px, keyboard-navigable, visible focus (3px mustard outline + 2px ink
  offset). This *is* the reduced-motion version, so it has to stand on its own.

**Phase 2: Hero shader (2–3 days, the bulk of the work)**
- Follow the build steps in §4. Check each step side by side with the album cover.

**Phase 3: Load sequence (½ day)**

**Phase 4: Scroll choreography (2 days)**
- Lenis + ScrollTrigger, slab slams, scribbles, arrows, wdth-velocity, ticket strip
  3D pan, contact sphere return.

**Phase 5: Interactions (1 day)**
- Ticket tear, cursor bead, tracklist menu (opens as a sliding back-cover panel,
  focus-trapped, Esc closes).

**Phase 6: Hardening (1 day)**
- Reduced motion: no Lenis, no pinning (tickets stack vertically), slabs appear
  without the slam, hero is a static frame.
- Mobile: the sphere follows touch-drag, otherwise it drifts slowly on a path. The
  ticket strip becomes a native horizontal scroll-snap row instead of pinned
  scrolling.
- Budgets: JS ≤ 120KB gzipped, LCP ≤ 2.5s on 4G (the hero text and fallback PNG are
  the LCP candidates, the shader fades in over them), CLS 0, 60fps on an M1, ≥30fps
  on a mid-range Android.
- Lighthouse a11y ≥ 95; check every text/background pair against the contrast rule.
- SEO: keep the title, description, OG/Twitter tags and JSON-LD; regenerate the OG
  image.

**Phase 7: Ship**
- Vercel preview → review on real phones → merge to `main`.

Estimated total: **8–10 working days**.

---

## 8. Design review: what I changed after checking against the brief

I ran the same brief ("psychedelic music-themed portfolio") as a generic first pass
and changed whatever matched it:

- **Generic hero**: a huge centred name over a purple-pink gradient with a "View
  projects" button. → **Changed** to cover-style corner type with the name existing
  only as distortion in the moiré. It's specific to *Currents*, whose whole image is
  something bending a field.
- **Generic project grid**: rounded glass cards with screenshots and hover lift. →
  **Changed** to chamfered ticket stubs with perforation, where the split has a
  meaning (artwork | admission), each at its own angle, with a tear-off click.
- **Generic skills**: an infinite marquee plus numbered 01–04 cards (the current site
  has both). → **Changed** to a slab word wall. Numbers dropped because skills aren't
  a sequence.
- **Generic psychedelic type**: one trippy display font with a gradient fill. →
  **Changed** to one variable family whose *width axis* reacts to scroll, plus
  mixed-colour outlined letters taken straight from the lyric-video references.
- **Track titles as section names**: tempting, but visitors wouldn't know where
  "Reality in Motion" leads. → **Changed** to plain headings with the track titles as
  marker scribbles on top.

---

## 9. Legal note

The cover image, band photos and lyrics are copyrighted. The site **recreates the
look procedurally** (shader, your own photo, your own words) and doesn't ship the
album art, the reference screenshots, or any audio. A one-line credit in the footer
("Inspired by Currents, Tame Impala, 2015") makes it read as homage.

---

## 10. Open questions

1. **Photos**: the stage photo works, but a second photo where you're wearing
   sunglasses or in profile would let the About collage use two cut-outs like the
   reference. Do you have one?
2. **Missing project art**: NeuroRAG-PD and Blockchain Voting have no screenshots.
   Typography-only tickets are the default; send screenshots if you'd rather use them.
3. **Sound**: an optional, off-by-default ambient phaser hum built with WebAudio (no
   samples) could make the sphere "sing" as it moves. Worth doing, or skip?
