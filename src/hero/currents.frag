#version 300 es
// The Currents field: banded moiré that flows, parts around the cursor,
// and around the floating letters of the name.
// Coordinates: p is aspect-corrected, origin at screen centre, y up, |y| <= 0.5.
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uCursor;      // xy, and the radius the lines part around (0 = off)
uniform vec2 uFloodFrom;   // where the load sequence's flood starts
uniform float uSink;       // 0 bright, 1 dark (scrolling away)
uniform float uVel;        // scroll velocity, roughly -1..1
uniform float uIntro;      // seconds since load sequence began
uniform float uFreq;       // bands per unit of screen height
uniform float uMaskAmt;
uniform sampler2D uMask;

out vec4 outColor;

const vec3 INK = vec3(0.0);
const vec3 DEEP = vec3(36.0, 18.0, 63.0) / 255.0;
const vec3 VIOLET = vec3(123.0, 92.0, 196.0) / 255.0;
const vec3 LILAC = vec3(195.0, 168.0, 242.0) / 255.0;
const vec3 PINK = vec3(226.0, 160.0, 214.0) / 255.0;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 2.0 - 1.0;
}

float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}

vec2 toUv(vec2 p) {
  return vec2(p.x * uRes.y / uRes.x + 0.5, p.y + 0.5);
}

// Height of the "liquid"; its contour lines are the stripes.
float field(vec2 p, float flood) {
  float t = uTime;
  vec2 w = p;
  w += 0.16 * vec2(fbm(p * 1.25 + vec2(0.0, t * 0.035)), fbm(p * 1.25 + vec2(5.2, -t * 0.03)));
  float turb = smoothstep(0.15, -0.6, p.y);
  w += turb * 0.075 * vec2(fbm(p * 3.4 + t * 0.06), fbm(p * 3.4 + 3.1 - t * 0.05));
  float h = w.y + 0.2 * w.x * w.x - 0.12 * w.x;

  // Streamlines around a small cylinder at the cursor: the lines part and rejoin
  vec2 d = p - uCursor.xy;
  float R2 = uCursor.z * uCursor.z * 1.2;
  h -= d.y * R2 / max(dot(d, d), max(R2, 1e-6));

  // The floating letters push the liquid aside: lines ride up around their footprint
  h += uMaskAmt * texture(uMask, toUv(p)).r * 1.4 / uFreq;

  // Scroll smear and the load ripple
  h += uVel * 0.03 * sin(p.x * 5.0 + t * 0.7);
  float r = length(p - uFloodFrom);
  h += 0.05 * exp(-abs(r - flood) * 22.0) * step(0.0, flood);
  return h * uFreq;
}

vec3 bands(float f, vec2 p) {
  float s = fract(f);
  float aa = clamp(fwidth(f) * 1.1, 0.01, 0.5);
  float light = 1.0 - smoothstep(0.52 - aa, 0.52 + aa, abs(s - 0.5) * 2.0);
  float hue = 0.5 + 0.5 * noise(p * 1.6 + 4.0);
  vec3 lightCol = mix(LILAC, PINK, hue * smoothstep(0.3, -0.5, p.y));
  lightCol = mix(lightCol, VIOLET, 0.25 * smoothstep(0.0, 0.5, p.y));
  vec3 darkCol = mix(INK, DEEP, 0.85);
  // a little ridge shading so the bands feel like folded ribbon
  float ridge = 0.82 + 0.18 * sin(s * 6.2831);
  return mix(darkCol, lightCol * ridge, light);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - 0.5 * uRes) / uRes.y;
  float t = uTime;

  // Load sequence: the liquid floods out from one point
  float flood = uIntro < 3.0 ? max(uIntro - 0.15, 0.0) * 2.4 : -1.0;
  float r = length(p - uFloodFrom);

  float f = field(p, flood);
  vec3 col = bands(f, p);

  // each floating letter casts a soft shadow down-right onto the liquid
  if (uMaskAmt > 0.0) {
    float sh = texture(uMask, toUv(p + vec2(-0.012, 0.02))).r;
    col *= 1.0 - 0.55 * uMaskAmt * sh;
  }

  // depth: darker toward the top, like the cover
  col *= mix(1.0, 0.55, smoothstep(0.05, 0.55, p.y));

  // flood reveal
  if (flood >= 0.0) {
    float edge = flood + 0.05 * fbm(p * 5.0);
    float reveal = smoothstep(edge, edge - 0.06, r);
    col = mix(INK, col, reveal);
    col += LILAC * 0.5 * exp(-abs(r - edge) * 60.0) * (1.0 - smoothstep(1.2, 2.2, uIntro));
  }

  col *= 1.0 - uSink * 0.75;
  col += (hash(frag + fract(t) * 100.0) - 0.5) * 0.035;
  outColor = vec4(col, 1.0);
}
