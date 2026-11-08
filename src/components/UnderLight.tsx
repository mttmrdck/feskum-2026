"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * The light beneath the glass. A single-pass fragment shader draws a
 * white-hot core just under a card's bottom edge and a soft fan of coloured
 * light spreading down into darkness, the way light leaks from beneath a
 * slab of glass sitting on a lamp.
 *
 * Everything it needs comes from `read()` once per frame (no React renders
 * while animating). Pauses offscreen; under reduced motion it still follows
 * colour changes but stops breathing. Falls back to CSS gradients without WebGL.
 */
export interface LightState {
  /** Light colour, 0..1. */
  rgb: [number, number, number];
  /** 0..1.2, overall brightness. */
  intensity: number;
  /** Horizontal centre of the light, CSS px from the canvas left. */
  cx: number;
  /** Card bottom edge, CSS px from the canvas top. */
  edge: number;
  /** Half the card width, CSS px. */
  half: number;
  /** Signed movement of the source (e.g. slider velocity), -1..1. Optional. */
  flow?: number;
}

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 u_res;      // CSS px
uniform float u_dpr;
uniform float u_time;
uniform vec3 u_col;
uniform float u_int;
uniform vec3 u_geo;      // cx, edge, half-width (CSS px)
uniform float u_flow;    // smoothed slosh, -1..1

// Smooth value noise (quintic fade): soft, liquid gradients with no grain.
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){ return noise(p) * 0.6 + noise(p * 2.03 + 7.1) * 0.4; }

void main(){
  vec2 p = vec2(gl_FragCoord.x, u_res.y * u_dpr - gl_FragCoord.y) / u_dpr; // CSS px, top-down
  float hw = max(u_geo.z, 1.0);
  float dx = (p.x - u_geo.x) / hw;
  float dy = (p.y - u_geo.y) / hw;
  float t = u_time;

  // Meniscus: the lit liquid surface, bowed slightly, rippling slowly,
  // tilting with the slosh when the track moves.
  float surf = 0.05 * (1.0 - dx * dx) + u_flow * dx * 0.07 + 0.012 * sin(dx * 3.1 + t * 0.9) + 0.008 * sin(dx * 7.3 - t * 1.3);
  float s = dy - surf;                    // depth below the surface
  float under = smoothstep(-0.006, 0.006, s);

  // Coordinates that follow the fan: x is normalised by the fan's width at
  // this depth, so the flow runs along the rays, not across them.
  float w = 1.0 + max(s, 0.0) * 1.3;
  float qx = dx / w - u_flow * max(s, 0.0) * 0.18;
  vec2 q = vec2(qx, max(s, 0.0));

  // Domain-warped flow, moving downward: smooth ribbons of brighter liquid.
  vec2 warp = vec2(fbm(q * vec2(2.2, 1.2) + vec2(0.0, -t * 0.22)), fbm(q * vec2(1.6, 0.9) + vec2(4.0, -t * 0.17)));
  float ribbons = fbm(vec2(q.x * 3.4 + warp.x * 1.6, q.y * 1.3 - t * 0.35 + warp.y * 1.2));
  ribbons = smoothstep(0.15, 0.95, ribbons);

  float shoulder = smoothstep(1.06, 0.25, abs(qx));
  float fall = exp(-q.y * 0.78);
  float body = under * shoulder * fall * (0.75 + 0.85 * ribbons);

  // The surface line itself: a crisp, bright band where light meets glass.
  float lip = exp(-pow(s / 0.03, 2.0)) * smoothstep(1.04, 0.55, abs(dx));
  // Hot core just beneath the surface, burning towards white.
  float core = under * exp(-q.y * 3.4) * smoothstep(0.85, 0.05, abs(qx)) * (0.85 + 0.3 * ribbons);
  // A little light escaping upward into the glass above the surface.
  float leak = (1.0 - under) * exp(s * 12.0) * smoothstep(1.0, 0.6, abs(dx)) * 0.45;

  float e = body * 1.05 * u_int;
  float c = (core * 1.05 + lip * 1.1 + leak) * u_int;

  // Saturated hue carries the body; only the lip and core burn toward white.
  vec3 col = u_col * e * 1.25 + mix(u_col, vec3(1.0), 0.62) * c;
  col = 1.0 - exp(-col * 1.45);           // soft highlight roll-off
  col += u_col * 0.022;                   // faint tint in the darkness

  col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) / 255.0; // dither only, invisible
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  // createShader returns null on a lost context; never pass that on.
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) return s;
  if (process.env.NODE_ENV !== "production") console.warn("UnderLight shader:", gl.getShaderInfoLog(s));
  return null;
}

export function UnderLight({ read, className, fallbackColor }: { read: () => LightState; className?: string; fallbackColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readRef = useRef(read);
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);
  // Bumped when the browser restores a lost context, to rebuild the program.
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    readRef.current = read;
  }, [read]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power", premultipliedAlpha: false });
    // A lost context (GPU reset, too many contexts) waits for the restore
    // event below rather than failing permanently.
    const lost = !!gl && gl.isContextLost();
    const vs = gl && !lost ? compile(gl, gl.VERTEX_SHADER, VERT) : null;
    const fs = gl && !lost ? compile(gl, gl.FRAGMENT_SHADER, FRAG) : null;
    const prog = gl && vs && fs ? gl.createProgram() : null;
    if (!gl || !vs || !fs || !prog) {
      if (!lost) queueMicrotask(() => setFailed(true));
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = {
      res: gl.getUniformLocation(prog, "u_res"),
      dpr: gl.getUniformLocation(prog, "u_dpr"),
      time: gl.getUniformLocation(prog, "u_time"),
      col: gl.getUniformLocation(prog, "u_col"),
      int: gl.getUniformLocation(prog, "u_int"),
      geo: gl.getUniformLocation(prog, "u_geo"),
      flow: gl.getUniformLocation(prog, "u_flow"),
    };

    // Cap the pixel ratio: the light is soft, extra pixels buy nothing.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    let w = 0;
    let h = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) loop();
    });
    io.observe(canvas);

    let raf = 0;
    const t0 = performance.now();
    // Slosh is a damped spring toward the source's movement: the liquid
    // leans when the track moves, overshoots a touch, then settles flat.
    let slosh = 0;
    let sloshV = 0;
    let last = performance.now();
    const draw = () => {
      const s = readRef.current();
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = reduce ? 0 : Math.max(-1, Math.min(1, s.flow ?? 0));
      sloshV += ((target - slosh) * 38 - sloshV * 7.5) * dt;
      slosh += sloshV * dt;
      gl.uniform2f(u.res, w, h);
      gl.uniform1f(u.dpr, dpr);
      gl.uniform1f(u.time, reduce ? 0 : (performance.now() - t0) / 1000);
      gl.uniform3f(u.col, s.rgb[0], s.rgb[1], s.rgb[2]);
      gl.uniform1f(u.int, s.intensity);
      gl.uniform3f(u.geo, s.cx, s.edge, s.half);
      gl.uniform1f(u.flow, slosh);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = () => {
      cancelAnimationFrame(raf);
      if (!visible) return;
      draw();
      raf = requestAnimationFrame(loop);
    };
    loop();

    // Objects from a lost context are already gone; never delete them later.
    let owned = true;
    const onLost = (e: Event) => {
      e.preventDefault(); // allow the browser to restore it
      cancelAnimationFrame(raf);
      visible = false;
      owned = false;
    };
    const onRestored = () => setEpoch((n) => n + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      ro.disconnect();
      io.disconnect();
      // Free our resources but keep the context alive: React (Strict Mode in
      // dev, or a remount) may reuse this canvas, and a deliberately lost
      // context would hand the next mount a dead one.
      if (owned && !gl.isContextLost()) {
        gl.deleteBuffer(buf);
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      }
    };
  }, [reduce, epoch]);

  if (failed) {
    return (
      <div
        aria-hidden
        className={className}
        style={{
          background: `radial-gradient(45% 40% at 50% 78%, ${fallbackColor}, transparent 70%), radial-gradient(25% 14% at 50% 70%, #ffffffcc, transparent 70%), #05060a`,
          transition: "background 0.8s",
        }}
      />
    );
  }
  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
