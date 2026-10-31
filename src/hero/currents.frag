#version 300 es
// The Currents field: banded moiré that flows, wraps around a chrome sphere,
// and parts around the floating letters of the name.
// Coordinates: p is aspect-corrected, origin at screen centre, y up, |y| <= 0.5.
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uSphere;      // centre xy, radius z
uniform vec2 uTrail[24];   // lava stream, [0] = sphere centre
uniform float uSink;       // 0 resting in the liquid, 1 fully under
uniform float uVel;        // scroll velocity, roughly -1..1
uniform float uIntro;      // seconds since load sequence began
uniform float uFreq;       // bands per unit of screen height
uniform float uMaskAmt;
uniform sampler2D uMask;
uniform vec2 uLaserFrom;

out vec4 outColor;

const vec3 INK = vec3(0.0);
const vec3 DEEP = vec3(36.0, 18.0, 63.0) / 255.0;
const vec3 VIOLET = vec3(123.0, 92.0, 196.0) / 255.0;
const vec3 LILAC = vec3(195.0, 168.0, 242.0) / 255.0;
const vec3 PINK = vec3(226.0, 160.0, 214.0) / 255.0;
const vec3 BRICK = vec3(201.0, 64.0, 43.0) / 255.0;
const vec3 ORANGE = vec3(232.0, 112.0, 42.0) / 255.0;
const vec3 MUSTARD = vec3(240.0, 196.0, 67.0) / 255.0;

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

float easeOutBack(float x) {
  float c1 = 1.9, c3 = c1 + 1.0;
  return 1.0 + c3 * pow(x - 1.0, 3.0) + c1 * pow(x - 1.0, 2.0);
}

// Height of the "liquid"; its contour lines are the stripes.
float field(vec2 p, float sphereR, float flood) {
  float t = uTime;
  vec2 w = p;
  w += 0.16 * vec2(fbm(p * 1.25 + vec2(0.0, t * 0.035)), fbm(p * 1.25 + vec2(5.2, -t * 0.03)));
  float turb = smoothstep(0.15, -0.6, p.y);
  w += turb * 0.075 * vec2(fbm(p * 3.4 + t * 0.06), fbm(p * 3.4 + 3.1 - t * 0.05));
  float h = w.y + 0.2 * w.x * w.x - 0.12 * w.x;

  // Streamlines around a cylinder: lines part around the ball and rejoin
  vec2 d = p - uSphere.xy;
  float R2 = sphereR * sphereR * 1.2;
  h -= d.y * R2 / max(dot(d, d), R2);

  // The floating letters push the liquid aside: lines ride up around their footprint
  h += uMaskAmt * texture(uMask, toUv(p)).r * 1.4 / uFreq;

  // Scroll smear and the load ripple
  h += uVel * 0.03 * sin(p.x * 5.0 + t * 0.7);
  float r = length(d);
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

float segDist(vec2 p, vec2 a, vec2 b, out float h) {
  vec2 pa = p - a, ba = b - a;
  h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-7), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - 0.5 * uRes) / uRes.y;
  float px = 1.0 / uRes.y;
  float t = uTime;

  // Load sequence: laser draws, ball drops, the field floods out from the impact
  float laserProg = smoothstep(0.0, 0.55, uIntro);
  float drop = clamp((uIntro - 0.45) / 0.45, 0.0, 1.0);
  float ballScale = drop <= 0.0 ? 0.0 : easeOutBack(drop);
  float flood = uIntro < 3.0 ? max(uIntro - 0.75, 0.0) * 2.6 : -1.0;

  vec2 c = uSphere.xy;
  float R = uSphere.z * ballScale;
  float r = length(p - c);

  float f = field(p, max(R, 1e-4), flood);
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
    col += LILAC * 0.5 * exp(-abs(r - edge) * 60.0) * (1.0 - smoothstep(1.5, 2.6, uIntro));
  }

  // contact shadow
  if (R > 0.0) {
    float sh = exp(-max(length((p - c) - vec2(0.012, -0.02)) - R, 0.0) * 9.0 / (R * 4.0 + 0.01));
    col *= 1.0 - 0.6 * sh;
  }

  // Lava trail: brick -> orange -> mustard as it flows away
  float best = 1e3, bestT = 0.0;
  for (int i = 0; i < 23; i++) {
    float hh;
    float d = segDist(p, uTrail[i], uTrail[i + 1], hh);
    float tt = (float(i) + hh) / 23.0;
    float sd = d - mix(0.016, 0.003, tt) * (uSphere.z / 0.12) * ballScale;
    if (sd < best) { best = sd; bestT = tt; }
  }
  vec3 lava = bestT < 0.6 ? mix(BRICK, ORANGE, bestT / 0.6) : mix(ORANGE, MUSTARD, (bestT - 0.6) / 0.4);
  lava *= 0.9 + 0.1 * sin(bestT * 40.0 - t * 4.0);
  col = mix(col, DEEP * 0.4, smoothstep(px * 1.5, -px * 1.5, best - 0.004));
  col = mix(col, lava, smoothstep(px * 1.5, -px * 1.5, best));

  // Laser: a thin hot line from the top-left into the ball
  {
    float hh;
    vec2 end = mix(uLaserFrom, c, laserProg);
    float d = segDist(p, uLaserFrom, end, hh);
    float w = 0.0035 * (uSphere.z / 0.12);
    float core = smoothstep(w + px, w - px, d);
    col = mix(col, mix(BRICK, vec3(1.0, 0.62, 0.58), smoothstep(w, 0.0, d)), core);
    col += BRICK * 0.35 * exp(-d * 110.0) * laserProg;
  }

  // Chrome sphere, sitting in the liquid; the waterline rises with uSink
  if (R > 0.0) {
    vec2 q = (p - c) / R;
    float l2 = dot(q, q);
    float water = c.y - R * 0.72 + uSink * R * 2.1 + 0.005 * sin(p.x * 70.0 + t * 2.0);
    float inside = (1.0 - smoothstep(1.0 - 3.0 * px / R, 1.0, l2)) * smoothstep(water - px, water + px, p.y);
    if (inside > 0.0) {
      float z = sqrt(max(1.0 - l2, 0.0));
      vec3 n = vec3(q, z);
      vec3 rd = reflect(vec3(0.0, 0.0, -1.0), n);
      vec2 sp = c + rd.xy * R * 2.6 / (0.3 + abs(rd.z));
      float ff = field(sp, R, -1.0);
      // where the reflected stripes get finer than a pixel, fade to their average tone
      vec3 floorCol = mix(bands(ff, sp), mix(DEEP * 0.85, LILAC, 0.5), smoothstep(0.2, 0.6, fwidth(ff)));
      vec3 sky = mix(vec3(0.86, 0.85, 0.9), vec3(0.1, 0.08, 0.14), smoothstep(0.0, 0.9, rd.y));
      vec3 env = mix(floorCol, sky, smoothstep(-0.12, 0.12, rd.y));
      float g = dot(env, vec3(0.3, 0.5, 0.2));
      env = mix(env, vec3(g), 0.3);
      env = (env - 0.5) * 1.2 + 0.5;
      env = mix(env, sky * 0.7, pow(1.0 - z, 2.5) * 0.45);
      vec3 L = normalize(vec3(-0.5, 0.6, 0.65));
      env += pow(max(dot(rd, L), 0.0), 70.0) * 1.8;
      env *= 0.72 + 0.28 * z;
      col = mix(col, clamp(env, 0.0, 1.0), inside);
    }
    // a lilac meniscus where liquid meets metal
    float ring = exp(-abs(p.y - (c.y - R * 0.72 + uSink * R * 2.1)) * 300.0) * step(l2, 1.05);
    col = mix(col, LILAC, ring * 0.5 * (1.0 - uSink));
  }

  col *= 1.0 - uSink * 0.75;
  col += (hash(frag + fract(t) * 100.0) - 0.5) * 0.035;
  outColor = vec4(col, 1.0);
}
