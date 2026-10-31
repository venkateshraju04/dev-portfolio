import frag from './currents.frag?raw';

const vert = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const UNIFORMS = ['uRes', 'uTime', 'uSphere', 'uTrail', 'uSink', 'uVel', 'uIntro', 'uFreq', 'uMaskAmt', 'uMask', 'uLaserFrom'];

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s));
  }
  return s;
}

/**
 * Full-screen Currents field. The caller owns the sphere/trail state and pushes
 * it in through `state` every frame via the `onFrame` hook.
 */
export function createCurrents(canvas, { onFrame, mobile }) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;

  const prog = gl.createProgram();
  try {
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn('Currents shader failed, using the still image instead.', err);
    return null;
  }
  gl.useProgram(prog);

  // One oversized triangle covers the screen
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = Object.fromEntries(UNIFORMS.map((n) => [n, gl.getUniformLocation(prog, n)]));

  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array([0]));
  gl.uniform1i(u.uMask, 0);

  const state = {
    time: 0,
    intro: 10,
    sink: 0,
    vel: 0,
    maskAmt: 1,
    sphere: [0, 0, 0.12],
    trail: new Float32Array(48),
    laserFrom: [-1, 0.62],
  };

  // phones get 2x so the finer portrait bands stay crisp; adaptive scaling backs off if slow
  const maxDpr = mobile ? 2 : 1.5;
  let scale = 1;
  let running = false;
  let raf = 0;
  let last = 0;
  let slowFrames = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr) * scale;
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function draw() {
    const aspect = window.innerWidth / window.innerHeight;
    state.laserFrom = [-0.5 * aspect - 0.05, 0.56];
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uTime, state.time);
    gl.uniform3f(u.uSphere, ...state.sphere);
    gl.uniform2fv(u.uTrail, state.trail);
    gl.uniform1f(u.uSink, state.sink);
    gl.uniform1f(u.uVel, state.vel);
    gl.uniform1f(u.uIntro, state.intro);
    // ~one band per 12 CSS px (9 in portrait, so the narrower name still spans a few
    // bands), clamped so big screens don't go flat
    const bandPx = aspect < 0.9 ? 9 : 12;
    gl.uniform1f(u.uFreq, Math.min(100, Math.max(38, window.innerHeight / bandPx)));
    gl.uniform1f(u.uMaskAmt, state.maskAmt);
    gl.uniform2f(u.uLaserFrom, ...state.laserFrom);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    // Adaptive quality: if frames stay slow, render fewer pixels
    if (last && now - last > 22) {
      if (++slowFrames > 40 && scale > 0.5) {
        scale *= 0.8;
        slowFrames = 0;
        resize();
      }
    } else {
      slowFrames = Math.max(0, slowFrames - 1);
    }
    last = now;
    state.time += dt;
    onFrame(state, dt);
    draw();
  }

  return {
    state,
    resize,
    setMask(source) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    },
    start() {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    renderOnce() {
      onFrame(state, 0);
      draw();
    },
  };
}
