"""Turn source photos and screenshots into the collage pieces used on the site.

Run from the repo root:  python3 scripts/prep-assets.py
Needs Pillow and numpy. Writes to public/art/.

- portrait: art-src/portrait-cutout.png (subject already cut out with macOS
  Vision) -> high-contrast B&W with a fine halftone screen and film grain.
- screenshots: public/sources/*.png|jpg -> gradient-mapped to the Currents
  palette with a halftone screen on top.
- moire swatches: procedural stripes for projects without a screenshot.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "art"
OUT.mkdir(parents=True, exist_ok=True)

INK = (0, 0, 0)
DEEP = (36, 18, 63)
VIOLET = (123, 92, 196)
LILAC = (195, 168, 242)
BRICK = (201, 64, 43)
ORANGE = (232, 112, 42)
MUSTARD = (240, 196, 67)
BONE = (237, 231, 220)

rng = np.random.default_rng(15)


def halftone(lum, cell=6, angle=45):
    """Return 0..1 ink coverage for a rotated dot screen driven by luminance."""
    h, w = lum.shape
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.deg2rad(angle)
    u = (x * np.cos(a) + y * np.sin(a)) / cell
    v = (-x * np.sin(a) + y * np.cos(a)) / cell
    du = u - np.floor(u) - 0.5
    dv = v - np.floor(v) - 0.5
    dist = np.sqrt(du * du + dv * dv)
    radius = np.sqrt(np.clip(1.0 - lum, 0, 1)) * 0.62
    return np.clip((radius - dist) * cell * 0.9 + 0.5, 0, 1)


def gradient_map(t, stops):
    t = np.clip(t, 0, 1)[..., None]
    n = len(stops) - 1
    stops = np.array(stops, dtype=np.float32)
    idx = np.minimum((t * n).astype(int), n - 1)
    f = t * n - idx
    lo = stops[idx[..., 0]]
    hi = stops[idx[..., 0] + 1]
    return lo + (hi - lo) * f


def save(arr, name, alpha=None, quality=82):
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")
    if alpha is not None:
        img.putalpha(Image.fromarray(alpha.astype(np.uint8), "L"))
    img.save(OUT / name, "WEBP", quality=quality, method=6)
    print("wrote", name, img.size)


def portrait():
    src = Image.open(ROOT / "art-src" / "portrait-cutout.png").convert("RGBA")
    src = src.crop(src.getchannel("A").getbbox())
    src.thumbnail((900, 1200), Image.LANCZOS)
    alpha = np.asarray(src.getchannel("A"), dtype=np.float32)
    gray = ImageOps.autocontrast(src.convert("L"), cutoff=1)
    lum = np.asarray(gray, dtype=np.float32) / 255.0
    lum = np.clip((lum - 0.5) * 1.35 + 0.52, 0, 1)  # punchier, like a photocopy
    ink = halftone(np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1)), dtype=np.float32) / 255.0, cell=4.2)
    tone = lum * 0.55 + (1 - ink) * 0.45
    tone += rng.normal(0, 0.05, tone.shape)
    rgb = np.stack([tone * 238, tone * 232, tone * 222], -1)
    save(rgb, "portrait.webp", alpha)


def screenshot(name, stops, out_name, width=1200):
    src = Image.open(ROOT / "public" / "sources" / name).convert("RGB")
    src.thumbnail((width, width), Image.LANCZOS)
    lum = np.asarray(ImageOps.autocontrast(src.convert("L"), cutoff=2), dtype=np.float32) / 255.0
    soft = np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32) / 255.0
    ink = halftone(soft, cell=5)
    base = gradient_map(lum, stops)
    dark = np.array(stops[0], dtype=np.float32)
    rgb = base * (1 - ink[..., None] * 0.55) + dark * ink[..., None] * 0.55
    rgb += rng.normal(0, 6, rgb.shape)
    save(rgb, out_name)


def moire(out_name, dark, light, w=1200, h=800, freq=46, seed=3):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    p = np.stack([x / h, y / h], -1)
    r = np.random.default_rng(seed)
    warp = np.zeros((h, w), np.float32)
    for octave in range(4):  # cheap sum of sines in place of fbm
        k = 1.5 * 2 ** octave
        ph = r.uniform(0, 6.28, 3)
        warp += (np.sin(p[..., 0] * k * 2.3 + ph[0]) * np.cos(p[..., 1] * k * 1.7 + ph[1])
                 + np.sin((p[..., 0] + p[..., 1]) * k * 1.3 + ph[2])) * (0.06 / 2 ** octave)
    hgt = p[..., 1] + warp + 0.12 * np.sin(p[..., 0] * 2.0)
    s = (hgt * freq) % 1.0
    band = np.clip((np.abs(s - 0.5) * 2 - 0.42) * 8, 0, 1)
    rgb = np.array(dark, np.float32) * (1 - band[..., None]) + np.array(light, np.float32) * band[..., None]
    rgb += rng.normal(0, 5, rgb.shape)
    save(rgb, out_name)


if __name__ == "__main__":
    portrait()
    screenshot("aits.png", [DEEP, VIOLET, LILAC], "work-trend-scout.webp")
    screenshot("sales.jpg", [INK, BRICK, ORANGE, MUSTARD], "work-sales.webp")
    screenshot("chat-sync.png", [DEEP, BRICK, MUSTARD], "work-chat-sync.webp")
    screenshot("blog.png", [INK, VIOLET, MUSTARD, BONE], "work-blog.webp")
    moire("work-neurorag.webp", DEEP, LILAC, seed=3)
