import { useEffect, useRef, useState } from 'react';

/**
 * Site-wide living contour map (after React Bits "Topography"), drawn on a raw
 * WebGL2 full-screen triangle. Line colours come from --topo-low/mid/high so
 * both themes get their own palette; the ground swells gently under the
 * pointer. Pauses while the tab is hidden. Visitors with reduced motion, a
 * touch screen, or no WebGL2 get the static grid underneath instead.
 */

const VERT = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 iResolution; uniform float iTime;
uniform float uBands, uThickness, uScale, uGlow, uContrast, uOpacity, uMorphAmount;
uniform vec3 uLow, uMid, uHigh;
uniform vec2 uMouse; uniform float uMouseRadius, uMouseStrength, uMouseActive, uGrain;
uniform vec4 uCtrlA, uCtrlB, uCtrlC, uCtrlD;
out vec4 fragColor;
float bez(float t, vec4 c){ float w = 6.2831853 * t; return 0.5 * (c.x * sin(w) + c.y * cos(w) + c.z * sin(2.0 * w) + c.w * cos(2.0 * w)); }
float field(vec2 uv){ vec2 a = vec2(bez(uv.x, uCtrlA), bez(uv.x, uCtrlB)); vec2 b = vec2(bez(uv.y, uCtrlC), bez(uv.y, uCtrlD)); return distance(a, b); }
vec3 elevationColor(float e){ vec3 c = mix(uLow, uMid, smoothstep(0.0, 0.5, e)); return mix(c, uHigh, smoothstep(0.5, 1.0, e)); }
void main(){
  vec2 res = iResolution.xy; vec2 uv = gl_FragCoord.xy / res;
  vec2 suv = (uv - 0.5) / uScale + 0.5;
  float fv = field(suv);
  vec2 d = uv - uMouse; d.x *= res.x / max(res.y, 1.0);
  fv += exp(-dot(d, d) / (uMouseRadius * uMouseRadius)) * uMouseStrength * uMouseActive;
  float f = fv * uBands; float fr = fract(f); float lineDist = min(fr, 1.0 - fr);
  float aa = fwidth(f) + 0.0001;
  float mask = 1.0 - smoothstep(uThickness - aa, uThickness + aa, lineDist);
  float glow = 1.0 - smoothstep(uThickness, uThickness + uGlow * 0.5 + aa, lineDist);
  float elev = clamp(fv / (uMorphAmount * 2.5 + 0.001), 0.0, 1.0);
  vec3 col = elevationColor(elev);
  float a = pow(clamp(mask + glow * 0.55, 0.0, 1.0), uContrast);
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453);
  a = clamp(a + (g - 0.5) * uGrain, 0.0, 1.0) * uOpacity;
  fragColor = vec4(col * a, a);
}`;

const P = {
  speed: 0.22, morphAmount: 3, morphSpeed: 0.05, bands: 2, thickness: 0.006, scale: 1.7,
  glow: 0.3, contrast: 2.6, mouseRadius: 0.3, mouseStrength: 0.4, grain: 0.035,
};
const CTRL = [[1, -2, 3, -4], [9, -8, 7, -6], [5, 2, 5, -5], [-1, -3, 8, 9]];

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return [0.24, 0.88, 0.54];
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
}

export default function TopoBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canvas || reduce || !fine) return;
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    // One triangle that covers the clip space.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    gl.uniform1f(u('uBands'), P.bands);
    gl.uniform1f(u('uThickness'), P.thickness);
    gl.uniform1f(u('uScale'), P.scale);
    gl.uniform1f(u('uGlow'), P.glow);
    gl.uniform1f(u('uContrast'), P.contrast);
    gl.uniform1f(u('uMorphAmount'), P.morphAmount);
    gl.uniform1f(u('uMouseRadius'), P.mouseRadius);
    gl.uniform1f(u('uMouseStrength'), P.mouseStrength);
    gl.uniform1f(u('uGrain'), P.grain);

    const root = document.documentElement;
    const applyTheme = () => {
      const css = getComputedStyle(root);
      gl.uniform3fv(u('uLow'), hexToRgb(css.getPropertyValue('--topo-low')));
      gl.uniform3fv(u('uMid'), hexToRgb(css.getPropertyValue('--topo-mid')));
      gl.uniform3fv(u('uHigh'), hexToRgb(css.getPropertyValue('--topo-high')));
      gl.uniform1f(u('uOpacity'), parseFloat(css.getPropertyValue('--topo-opacity')) || 0.5);
    };
    applyTheme();
    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] });

    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const resize = () => {
      const w = Math.max(1, Math.floor(innerWidth * dpr));
      const h = Math.max(1, Math.floor(innerHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u('iResolution'), w, h);
    };
    resize();
    addEventListener('resize', resize, { passive: true });

    const mouse = [0.5, 0.5], target = [0.5, 0.5];
    let active = 0, activeTarget = 0;
    const onMove = (e: PointerEvent) => {
      target[0] = e.clientX / innerWidth;
      target[1] = 1 - e.clientY / innerHeight;
      activeTarget = 1;
    };
    const onLeave = () => { activeTarget = 0; };
    addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    const ctrlU = [u('uCtrlA'), u('uCtrlB'), u('uCtrlC'), u('uCtrlD')];
    const ctrl = CTRL.map(() => new Float32Array(4));
    const t0 = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const time = (t - t0) * 0.001;
      gl.uniform1f(u('iTime'), time);
      CTRL.forEach((row, g) => {
        row.forEach((i, j) => {
          ctrl[g][j] = P.morphAmount * Math.sin(time * P.speed * Math.sin(i * P.morphSpeed) + i);
        });
        gl.uniform4fv(ctrlU[g], ctrl[g]);
      });
      mouse[0] += 0.05 * (target[0] - mouse[0]);
      mouse[1] += 0.05 * (target[1] - mouse[1]);
      active += 0.05 * (activeTarget - active);
      gl.uniform2f(u('uMouse'), mouse[0], mouse[1]);
      gl.uniform1f(u('uMouseActive'), active);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);
    start();
    setLive(true);

    return () => {
      stop();
      themeObserver.disconnect();
      removeEventListener('resize', resize);
      removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      {/* Static fallback, faded out once the live scene is running. */}
      <div
        className={`bg-grid absolute inset-0 transition-opacity duration-1000 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,black,transparent)] ${live ? 'opacity-0' : 'opacity-40'}`}
      />
      <canvas ref={ref} className={`absolute inset-0 size-full transition-opacity duration-1000 ${live ? 'opacity-100' : 'opacity-0'}`} />
      {/* Soft accent glows, like light pooling on the map. */}
      <div className="absolute -top-40 -left-40 size-[36rem] rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute top-1/3 -right-40 size-[30rem] rounded-full bg-accent-2/10 blur-3xl" />
    </div>
  );
}
