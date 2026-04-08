import React, { useRef, useEffect } from 'react';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (t) => t * t * (3 - 2 * t);
const fract = (x) => x - Math.floor(x);
const hash2 = (x, y) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return fract(h);
};
const valueNoise2D = (x, y) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const sx = smoothstep(x - x0);
  const sy = smoothstep(y - y0);
  const n00 = hash2(x0, y0);
  const n10 = hash2(x1, y0);
  const n01 = hash2(x0, y1);
  const n11 = hash2(x1, y1);
  const ix0 = lerp(n00, n10, sx);
  const ix1 = lerp(n01, n11, sx);
  return lerp(ix0, ix1, sy);
};
const fbm2D = (x, y, octaves = 5) => {
  let amp = 0.55;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i += 1) {
    sum += amp * valueNoise2D(x * freq, y * freq);
    norm += amp;
    amp *= 0.52;
    freq *= 2.03;
  }
  return sum / Math.max(1e-6, norm);
};

const CreativeCanvas = ({ mode }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(0);
  const entitiesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const metricsRef = useRef({ width: 0, height: 0, dpr: 1, mobile: false });
  const lastTimeRef = useRef(0);
  const cachesRef = useRef({
    grassSky: null,
    starsSky: null,
    waterSky: null,
    w: 0,
    h: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const randRange = (a, b) => a + Math.random() * (b - a);
    const buildStars = (count) => Array.from({ length: count }, () => {
      const z = Math.random();
      const temp = randRange(0, 1);
      // warmer stars less common
      const hue = temp < 0.18 ? randRange(28, 52) : randRange(200, 240);
      return {
        x: Math.random(),
        y: Math.random(),
        z,
        hue,
        tw: randRange(0, Math.PI * 2),
        // intrinsic magnitude
        mag: Math.pow(1 - z, 2.2) * randRange(0.4, 1.0)
      };
    });
    const buildGrassBlades = (count) => Array.from({ length: count }, () => ({
      x: Math.random(),
      // normalized depth: 0 far, 1 near
      d: Math.pow(Math.random(), 1.8),
      seed: Math.random() * 1000,
      twist: randRange(0, Math.PI * 2),
      tint: randRange(92, 135),
    }));
    const buildWaterSamples = (count) => Array.from({ length: count }, (_, i) => ({
      y: i / Math.max(1, count - 1),
      seed: Math.random() * 1000
    }));

    const populateScene = (width, height, mobile) => {
      cachesRef.current.w = width;
      cachesRef.current.h = height;
      cachesRef.current.grassSky = null;
      cachesRef.current.starsSky = null;
      cachesRef.current.waterSky = null;

      if (mode === 'stars') {
        entitiesRef.current = buildStars(mobile ? 650 : 1400);
      } else if (mode === 'grass') {
        entitiesRef.current = buildGrassBlades(mobile ? 520 : 1100);
      } else {
        entitiesRef.current = buildWaterSamples(mobile ? 40 : 64);
      }
    };

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const mobile = window.innerWidth <= 768;
      const dpr = clamp(window.devicePixelRatio || 1, 1, mobile ? 1.4 : 2);
      metricsRef.current = { width, height, dpr, mobile };
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      populateScene(width, height, mobile);
    };

    const updateMouse = (cx, cy) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = cx - rect.left;
      mouseRef.current.y = cy - rect.top;
      mouseRef.current.active = true;
    };

    const getCachedBackground = (key, draw) => {
      const { width, height } = metricsRef.current;
      const cache = cachesRef.current[key];
      if (cache && cache.w === width && cache.h === height) return cache.canvas;
      const off = document.createElement('canvas');
      off.width = Math.floor(width);
      off.height = Math.floor(height);
      const offCtx = off.getContext('2d');
      if (!offCtx) return null;
      draw(offCtx, width, height);
      cachesRef.current[key] = { canvas: off, w: width, h: height };
      return off;
    };

    const drawStarsBackground = (time) => {
      const bg = getCachedBackground('starsSky', (bctx, width, height) => {
        const g0 = bctx.createLinearGradient(0, 0, 0, height);
        g0.addColorStop(0, '#020109');
        g0.addColorStop(0.55, '#050817');
        g0.addColorStop(1, '#02030a');
        bctx.fillStyle = g0;
        bctx.fillRect(0, 0, width, height);

        // Milky way band via FBM noise + soft rotation
        const img = bctx.createImageData(width, height);
        const data = img.data;
        const cx = width * 0.5;
        const cy = height * 0.52;
        const angle = -0.35;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const invW = 1 / Math.max(1, width);
        const invH = 1 / Math.max(1, height);
        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const nx = (x - cx) * invW;
            const ny = (y - cy) * invH;
            const rx = nx * cos - ny * sin;
            const ry = nx * sin + ny * cos;
            const band = Math.exp(-Math.pow(ry * 2.2, 2));
            const n = fbm2D(rx * 3.4 + 10, ry * 3.4 + 20, 5);
            const dust = Math.pow(n, 2.7) * band;
            const idx = (y * width + x) * 4;
            const r = 4 + dust * 42;
            const g = 6 + dust * 28;
            const b = 14 + dust * 72;
            data[idx + 0] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = Math.floor(clamp(dust * 255 * 0.38, 0, 255));
          }
        }
        bctx.putImageData(img, 0, 0);

        // vignette
        const vg = bctx.createRadialGradient(width * 0.5, height * 0.55, height * 0.1, width * 0.5, height * 0.55, height * 0.85);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.78)');
        bctx.fillStyle = vg;
        bctx.fillRect(0, 0, width, height);
      });
      if (bg) ctx.drawImage(bg, 0, 0);
    };

    const drawGrassBackground = () => {
      const bg = getCachedBackground('grassSky', (bctx, width, height) => {
        const sky = bctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, '#cbe4b5');
        sky.addColorStop(0.4, '#7fb55e');
        sky.addColorStop(1, '#1c3b20');
        bctx.fillStyle = sky;
        bctx.fillRect(0, 0, width, height);

        const haze = bctx.createRadialGradient(width * 0.6, height * 0.22, 40, width * 0.6, height * 0.22, height * 0.55);
        haze.addColorStop(0, 'rgba(255,255,255,0.22)');
        haze.addColorStop(1, 'rgba(255,255,255,0)');
        bctx.fillStyle = haze;
        bctx.fillRect(0, 0, width, height);

        const hill = bctx.createRadialGradient(width * 0.35, height * 0.9, height * 0.14, width * 0.35, height * 0.9, height * 0.95);
        hill.addColorStop(0, 'rgba(190, 222, 140, 0.45)');
        hill.addColorStop(1, 'rgba(26, 63, 24, 0)');
        bctx.fillStyle = hill;
        bctx.fillRect(0, 0, width, height);
      });
      if (bg) ctx.drawImage(bg, 0, 0);
    };

    const drawWaterBackground = () => {
      const bg = getCachedBackground('waterSky', (bctx, width, height) => {
        // sky reflection gradient
        const sky = bctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, '#a7dbf2');
        sky.addColorStop(0.35, '#4a98c8');
        sky.addColorStop(1, '#0e2e4d');
        bctx.fillStyle = sky;
        bctx.fillRect(0, 0, width, height);

        const sun = bctx.createRadialGradient(width * 0.72, height * 0.18, 6, width * 0.72, height * 0.18, height * 0.55);
        sun.addColorStop(0, 'rgba(255,255,255,0.65)');
        sun.addColorStop(1, 'rgba(255,255,255,0)');
        bctx.fillStyle = sun;
        bctx.fillRect(0, 0, width, height);
      });
      if (bg) ctx.drawImage(bg, 0, 0);
    };

    const drawBackground = (time, dt) => {
      const { width, height, mobile } = metricsRef.current;
      if (mode === 'grass') drawGrassBackground();
      else if (mode === 'water') drawWaterBackground();
      else drawStarsBackground(time);
    };

    const render = (time) => {
      const { width, height, mobile } = metricsRef.current;
      const last = lastTimeRef.current || time;
      const dt = Math.min(40, time - last);
      lastTimeRef.current = time;
      drawBackground(time, dt);
      const entities = entitiesRef.current;

      if (mode === 'stars') {
        const t = time * 0.0006;
        const driftX = 0.000012 * dt;
        const lensR = mobile ? 110 : 150;
        const lensStrength = mobile ? 0.7 : 1.0;
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const mActive = mouseRef.current.active;

        // stars + bloom
        for (let i = 0; i < entities.length; i += 1) {
          const s = entities[i];
          s.tw += dt * (0.0009 + (1 - s.z) * 0.0018);
          s.x += driftX * (0.55 + (1 - s.z) * 3.2);
          if (s.x > 1.02) s.x = -0.02;

          const sx = s.x * width;
          const sy = s.y * height;
          const tw = 0.55 + (Math.sin(s.tw) + 1) * 0.45;
          let focus = 1;
          if (mActive) {
            const d = Math.hypot(mx - sx, my - sy);
            if (d < lensR) focus += (1 - d / lensR) * lensStrength;
          }

          const size = (0.3 + s.mag * 2.1) * tw * focus;
          const bloom = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 5.5);
          bloom.addColorStop(0, `hsla(${s.hue}, 90%, 88%, ${0.16 + s.mag * 0.12})`);
          bloom.addColorStop(0.25, `hsla(${s.hue}, 80%, 82%, ${0.08 + s.mag * 0.08})`);
          bloom.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = bloom;
          ctx.beginPath();
          ctx.arc(sx, sy, size * 5.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `hsla(${s.hue}, 100%, 93%, ${0.45 + s.mag * 0.25})`;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(0.35, size), 0, Math.PI * 2);
          ctx.fill();
        }

        // faint scintillation grain (cheap)
        if (!mobile) {
          ctx.globalAlpha = 0.08;
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 420; i += 1) {
            const gx = (hash2(i, Math.floor(t * 1000)) * width) | 0;
            const gy = (hash2(i + 17, Math.floor(t * 900)) * height) | 0;
            ctx.fillRect(gx, gy, 1, 1);
          }
          ctx.globalAlpha = 1;
        }
      } else if (mode === 'grass') {
        const t = time * 0.001;
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const mActive = mouseRef.current.active;
        const influenceR = mobile ? 170 : 220;

        // ground occlusion
        const oc = ctx.createLinearGradient(0, height * 0.65, 0, height);
        oc.addColorStop(0, 'rgba(0,0,0,0)');
        oc.addColorStop(1, 'rgba(0,0,0,0.32)');
        ctx.fillStyle = oc;
        ctx.fillRect(0, height * 0.65, width, height * 0.35);

        // draw blades back-to-front for depth
        const blades = entities.slice().sort((a, b) => a.d - b.d);
        for (let i = 0; i < blades.length; i += 1) {
          const b = blades[i];
          const depth = b.d; // 0 far, 1 near
          const px = b.x * width;
          const rootY = lerp(height * 0.6, height * 1.0, depth);
          const bladeLen = lerp(mobile ? 46 : 70, mobile ? 180 : 260, depth) * (0.7 + fbm2D(b.seed * 0.03, depth * 2, 3) * 0.5);
          const bladeW = lerp(0.35, mobile ? 1.4 : 1.8, depth);

          // wind field: low-frequency + gust noise
          const wx = fbm2D(px * 0.003 + t * 0.22, depth * 2 + 10, 4) * 2 - 1;
          const gust = fbm2D(px * 0.008 + t * 0.55, depth * 5 + 40, 3) * 2 - 1;
          let bend = (wx * 16 + gust * 10) * (0.2 + depth * 0.9);

          // mouse interaction
          if (mActive) {
            const dx = mx - px;
            const dy = my - (rootY - bladeLen * 0.5);
            const d = Math.hypot(dx, dy) || 1;
            if (d < influenceR) {
              const falloff = smoothstep(1 - d / influenceR);
              bend += falloff * 60 * Math.sign(dx);
            }
          }

          const tipX = px + bend;
          const tipY = rootY - bladeLen;

          // lighting: sun from upper-right
          const sunX = width * 0.82;
          const sunY = height * 0.15;
          const toSunX = (sunX - px) / width;
          const toSunY = (sunY - (rootY - bladeLen * 0.7)) / height;
          const light = clamp(0.65 + toSunX * 0.35 - toSunY * 0.25, 0.35, 1.15);

          const hue = b.tint + (gust * 6);
          const sat = lerp(34, 62, depth);
          const baseL = lerp(24, 52, depth) * light;

          ctx.lineWidth = bladeW;
          ctx.lineCap = 'round';

          // blade gradient (dark base -> bright tip)
          const grad = ctx.createLinearGradient(px, rootY, tipX, tipY);
          grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${clamp(baseL * 0.7, 8, 60)}%, 0.9)`);
          grad.addColorStop(0.65, `hsla(${hue + 10}, ${sat + 8}%, ${clamp(baseL, 14, 72)}%, 0.95)`);
          grad.addColorStop(1, `hsla(${hue + 18}, ${sat + 14}%, ${clamp(baseL * 1.25, 20, 82)}%, 0.95)`);
          ctx.strokeStyle = grad;

          // curved blade (two control points for s-curve)
          const c1x = lerp(px, tipX, 0.35) + Math.sin(b.twist + t * 0.6) * 6 * (0.2 + depth);
          const c1y = lerp(rootY, tipY, 0.35);
          const c2x = lerp(px, tipX, 0.72) + Math.cos(b.twist + t * 0.9) * 10 * (0.15 + depth);
          const c2y = lerp(rootY, tipY, 0.72);
          ctx.beginPath();
          ctx.moveTo(px, rootY);
          ctx.bezierCurveTo(c1x, c1y, c2x, c2y, tipX, tipY);
          ctx.stroke();

          // specular rim highlight for near blades
          if (depth > 0.68 && i % 6 === 0) {
            ctx.lineWidth = bladeW * 0.6;
            ctx.strokeStyle = `rgba(240, 255, 210, ${0.18 + (depth - 0.68) * 0.45})`;
            ctx.beginPath();
            ctx.moveTo(px + bladeW * 0.4, rootY);
            ctx.bezierCurveTo(c1x + bladeW * 0.4, c1y, c2x + bladeW * 0.4, c2y, tipX + bladeW * 0.2, tipY);
            ctx.stroke();
          }
        }
      } else {
        const t = time * 0.001;
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const mActive = mouseRef.current.active;
        const rippleR = mobile ? 140 : 180;

        // water surface: shaded field sampled as scanlines (fast, realistic enough)
        const horizon = height * 0.22;
        const rows = mobile ? 120 : 180;
        for (let r = 0; r < rows; r += 1) {
          const v = r / (rows - 1);
          const y = lerp(horizon, height, v);
          // perspective: fewer samples near horizon, more near camera
          const step = Math.floor(lerp(mobile ? 10 : 8, mobile ? 3 : 2, v));
          ctx.beginPath();
          for (let x = 0; x <= width; x += step) {
            const nx = x / width;
            const n = fbm2D(nx * 5 + t * 0.45, v * 2.6 + t * 0.18, 5);
            const m = fbm2D(nx * 10 - t * 0.85, v * 5 + 40 + t * 0.25, 4);
            // "height" of wave
            let h = (n * 2 - 1) * (6 + v * 24) + (m * 2 - 1) * (2 + v * 10);

            if (mActive) {
              const d = Math.hypot(x - mx, y - my);
              if (d < rippleR) h += Math.cos(d * 0.09 - t * 14) * (1 - d / rippleR) * (8 + v * 10);
            }

            const yy = y + h;
            if (x === 0) ctx.moveTo(x, yy);
            else ctx.lineTo(x, yy);
          }

          // Fresnel-ish shading: darker facing away, brighter near horizon + highlights
          const shade = clamp(0.18 + (1 - v) * 0.35, 0.08, 0.55);
          ctx.strokeStyle = `rgba(210, 245, 255, ${shade})`;
          ctx.lineWidth = lerp(0.6, 1.8, 1 - v);
          ctx.stroke();
        }

        // specular glints
        const glints = mobile ? 60 : 120;
        for (let i = 0; i < glints; i += 1) {
          const rx = hash2(i, Math.floor(t * 120)) * width;
          const rv = Math.pow(hash2(i + 33, Math.floor(t * 140)), 1.6);
          const ry = lerp(horizon, height, rv);
          const sparkle = fbm2D(rx * 0.02 + t * 2.4, ry * 0.02 + t * 1.2, 3);
          if (sparkle > 0.72) {
            const a = (sparkle - 0.72) * 1.8;
            ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.65})`;
            ctx.fillRect(rx, ry, 1.2, 1.2);
          }
        }

        // foam belt
        ctx.globalAlpha = 0.85;
        for (let i = 0; i < (mobile ? 110 : 180); i += 1) {
          const rx = hash2(i + 10, Math.floor(t * 70)) * width;
          const rv = 0.35 + hash2(i + 70, Math.floor(t * 60)) * 0.62;
          const ry = lerp(horizon, height, rv);
          const n = fbm2D(rx * 0.01, ry * 0.01 + t * 0.7, 4);
          if (n > 0.62) {
            const rad = 0.6 + (n - 0.62) * 4.5;
            ctx.fillStyle = 'rgba(235, 250, 255, 0.55)';
            ctx.beginPath();
            ctx.arc(rx, ry, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }

      requestRef.current = requestAnimationFrame(render);
    };

    resize();
    requestRef.current = requestAnimationFrame(render);
    const onMouseMove = (e) => updateMouse(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches[0]) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => { mouseRef.current.active = false; };

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('touchend', onLeave);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('touchend', onLeave);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="creative-canvas" />;
};

const WorkApp = () => (
  <div className="mac-content-inner work-app-scroll">
    <div className="work-section-copy">
      <h3>Creative Code Studies</h3>
      <p>Three physically-inspired interactive sketches: wind-driven prairie dynamics, deep-space volumetric star simulation, and layered ocean swell optics.</p>
    </div>
    <div className="work-sketch-card">
      <h4>Wind Through Tall Grass - Physically Inspired Blade Field</h4>
      <CreativeCanvas mode="grass" />
    </div>
    <div className="work-sketch-card">
      <h4>Night Stars - Depth-Mapped Nebula and Stellar Links</h4>
      <CreativeCanvas mode="stars" />
    </div>
    <div className="work-sketch-card">
      <h4>Ocean Current Drift - Multi-Frequency Wave Interference</h4>
      <CreativeCanvas mode="water" />
    </div>
  </div>
);

export default WorkApp;
