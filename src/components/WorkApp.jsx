import React, { useRef, useEffect } from 'react';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;

const CreativeCanvas = ({ mode }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(0);
  const entitiesRef = useRef([]);
  const extraRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const metricsRef = useRef({ width: 0, height: 0, dpr: 1, mobile: false });
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const populateScene = (width, height, mobile) => {
      if (mode === 'stars') {
        const count = mobile ? 130 : 260;
        const hazeCount = mobile ? 2 : 3;
        entitiesRef.current = Array.from({ length: count }, () => ({
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          twinkle: Math.random() * Math.PI * 2,
          hue: 210 + Math.random() * 40
        }));
        extraRef.current = Array.from({ length: hazeCount }, (_, i) => ({
          x: (i + 1) / (hazeCount + 1),
          y: 0.24 + Math.random() * 0.5,
          r: (mobile ? 120 : 180) + Math.random() * (mobile ? 90 : 160),
          alpha: 0.08 + Math.random() * 0.1
        }));
      } else if (mode === 'grass') {
        const bladeCount = mobile ? 180 : 340;
        entitiesRef.current = Array.from({ length: bladeCount }, (_, i) => ({
          x: i / bladeCount,
          rootY: 0.66 + Math.random() * 0.33,
          length: (mobile ? 32 : 44) + Math.random() * (mobile ? 56 : 88),
          width: 0.8 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2,
          stiffness: 0.65 + Math.random() * 1.1,
          tone: 90 + Math.random() * 40
        }));
        const fireflyCount = mobile ? 12 : 22;
        extraRef.current = Array.from({ length: fireflyCount }, () => ({
          x: Math.random() * width,
          y: height * (0.12 + Math.random() * 0.45),
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.09,
          phase: Math.random() * Math.PI * 2
        }));
      } else {
        const bandCount = mobile ? 34 : 58;
        entitiesRef.current = Array.from({ length: bandCount }, (_, i) => ({
          y: i / (bandCount - 1),
          ampA: 3 + Math.random() * 9,
          ampB: 2 + Math.random() * 6,
          freqA: 0.009 + Math.random() * 0.014,
          freqB: 0.015 + Math.random() * 0.02,
          phase: Math.random() * Math.PI * 2,
          speed: 0.35 + Math.random() * 0.65
        }));
        const foamCount = mobile ? 70 : 120;
        extraRef.current = Array.from({ length: foamCount }, () => ({
          x: Math.random() * width,
          y: height * (0.25 + Math.random() * 0.65),
          radius: 0.5 + Math.random() * 2.2,
          drift: 0.1 + Math.random() * 0.25,
          phase: Math.random() * Math.PI * 2
        }));
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

    const drawBackground = (time, dt) => {
      const { width, height, mobile } = metricsRef.current;
      if (mode === 'grass') {
        const sky = ctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, '#b6d4a0');
        sky.addColorStop(0.4, '#6aa250');
        sky.addColorStop(1, '#204a24');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height);

        const hill = ctx.createRadialGradient(width * 0.35, height * 0.88, height * 0.12, width * 0.35, height * 0.88, height * 0.92);
        hill.addColorStop(0, 'rgba(178, 209, 121, 0.4)');
        hill.addColorStop(1, 'rgba(26, 63, 24, 0)');
        ctx.fillStyle = hill;
        ctx.fillRect(0, 0, width, height);

        const flies = extraRef.current;
        flies.forEach((f) => {
          f.phase += dt * 0.0016;
          f.x += Math.cos(f.phase * 0.7) * 0.35 + f.vx;
          f.y += Math.sin(f.phase) * 0.2 + f.vy;
          if (f.x < -10) f.x = width + 10;
          if (f.x > width + 10) f.x = -10;
          if (f.y < height * 0.08) f.y = height * 0.62;
          if (f.y > height * 0.72) f.y = height * 0.12;
          const glow = 1.2 + (Math.sin(f.phase * 3) + 1) * 0.9;
          ctx.fillStyle = 'rgba(255, 244, 174, 0.2)';
          ctx.beginPath();
          ctx.arc(f.x, f.y, glow * 3.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 246, 190, 0.88)';
          ctx.beginPath();
          ctx.arc(f.x, f.y, glow, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (mode === 'water') {
        const g = ctx.createLinearGradient(0, 0, 0, height);
        g.addColorStop(0, '#92cde8');
        g.addColorStop(0.38, '#3f8ec0');
        g.addColorStop(1, '#123c60');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);

        const glow = ctx.createRadialGradient(width * 0.72, height * 0.2, 12, width * 0.72, height * 0.2, mobile ? 120 : 180);
        glow.addColorStop(0, 'rgba(255,255,255,0.6)');
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      } else {
        const g = ctx.createLinearGradient(0, 0, 0, height);
        g.addColorStop(0, '#03050f');
        g.addColorStop(1, '#0c1231');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);

        extraRef.current.forEach((cloud) => {
          const radius = cloud.r + Math.sin(time * 0.0003 + cloud.x * 8) * 10;
          const gradient = ctx.createRadialGradient(width * cloud.x, height * cloud.y, radius * 0.12, width * cloud.x, height * cloud.y, radius);
          gradient.addColorStop(0, `rgba(149, 130, 255, ${cloud.alpha})`);
          gradient.addColorStop(1, 'rgba(149, 130, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        });
      }
    };

    const render = (time) => {
      const { width, height, mobile } = metricsRef.current;
      const last = lastTimeRef.current || time;
      const dt = Math.min(40, time - last);
      lastTimeRef.current = time;
      drawBackground(time, dt);
      const entities = entitiesRef.current;

      if (mode === 'stars') {
        entities.forEach((p) => {
          p.twinkle += dt * (0.001 + p.z * 0.0018);
          p.x += dt * (0.000007 + (1 - p.z) * 0.00004);
          p.y += Math.sin(p.twinkle * 0.4 + p.z * 9) * 0.00008;
          if (p.x > 1.03) p.x = -0.03;

          const sx = p.x * width;
          const sy = p.y * height;
          const baseSize = lerp(0.6, 2.7, 1 - p.z);
          const twinkle = 0.55 + (Math.sin(p.twinkle) + 1) * 0.45;
          let influence = 1;
          if (mouseRef.current.active) {
            const dx = mouseRef.current.x - sx;
            const dy = mouseRef.current.y - sy;
            const d = Math.hypot(dx, dy) || 1;
            if (d < 140) {
              const lens = (1 - d / 140) * 0.65;
              influence += lens;
            }
          }

          const size = baseSize * twinkle * influence;
          const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 3.2);
          core.addColorStop(0, `hsla(${p.hue}, 88%, 90%, 0.95)`);
          core.addColorStop(1, `hsla(${p.hue}, 80%, 70%, 0)`);
          ctx.fillStyle = core;
          ctx.beginPath();
          ctx.arc(sx, sy, size * 3.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `hsla(${p.hue}, 100%, 96%, 0.85)`;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(0.35, size * 0.42), 0, Math.PI * 2);
          ctx.fill();
        });

        if (!mobile) {
          const linkLimit = 62;
          for (let i = 0; i < entities.length; i += 1) {
            const a = entities[i];
            const ax = a.x * width;
            const ay = a.y * height;
            for (let j = i + 1; j < entities.length; j += 1) {
              const b = entities[j];
              const bx = b.x * width;
              const by = b.y * height;
              const dist = Math.hypot(ax - bx, ay - by);
              if (dist < linkLimit) {
                const alpha = (1 - dist / linkLimit) * 0.16;
                ctx.strokeStyle = `rgba(170, 192, 255, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.stroke();
              }
            }
          }
        }
      } else if (mode === 'grass') {
        entities.forEach((b, i) => {
          const rootX = b.x * width;
          const rootY = b.rootY * height;
          const wind = Math.sin(time * 0.0012 + b.phase + rootX * 0.01) * (12 / b.stiffness);
          const gust = Math.cos(time * 0.0007 + rootY * 0.03) * (6 / b.stiffness);
          let localPush = 0;
          if (mouseRef.current.active) {
            const dx = mouseRef.current.x - rootX;
            const dy = mouseRef.current.y - (rootY - b.length * 0.5);
            const d = Math.hypot(dx, dy) || 1;
            if (d < 140) localPush = (1 - d / 140) * 26 * Math.sign(dx);
          }

          const tipX = rootX + wind + gust + localPush;
          const midX = rootX + (wind + localPush) * 0.45;
          const tipY = rootY - b.length;

          ctx.strokeStyle = `hsl(${b.tone}, 52%, ${i % 4 === 0 ? 62 : 41}%)`;
          ctx.lineWidth = b.width;
          ctx.beginPath();
          ctx.moveTo(rootX, rootY);
          ctx.quadraticCurveTo(midX, rootY - b.length * 0.5, tipX, tipY);
          ctx.stroke();

          if (i % 17 === 0) {
            ctx.fillStyle = 'rgba(234, 255, 187, 0.22)';
            ctx.beginPath();
            ctx.ellipse(tipX, tipY, 1.2, 2.7, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      } else {
        entities.forEach((band, i) => {
          const yBase = lerp(height * 0.2, height * 0.92, band.y);
          const alpha = 0.12 + (1 - band.y) * 0.22;
          ctx.strokeStyle = `rgba(205, 241, 255, ${alpha})`;
          ctx.lineWidth = 1 + (1 - band.y) * 0.7;
          ctx.beginPath();
          const step = mobile ? 12 : 8;
          for (let x = 0; x <= width; x += step) {
            const waveA = Math.sin(x * band.freqA + band.phase + time * 0.0016 * band.speed) * band.ampA;
            const waveB = Math.cos(x * band.freqB - band.phase + time * 0.0021 * band.speed) * band.ampB;
            let mouseRipple = 0;
            if (mouseRef.current.active) {
              const dx = x - mouseRef.current.x;
              const dy = yBase - mouseRef.current.y;
              const d = Math.hypot(dx, dy);
              if (d < 160) mouseRipple = Math.cos(d * 0.07 - time * 0.01) * (1 - d / 160) * 9;
            }
            const y = yBase + waveA + waveB + mouseRipple;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
        const foam = extraRef.current;
        foam.forEach((f) => {
          f.phase += dt * 0.0013;
          f.x += Math.sin(f.phase * 0.7) * f.drift;
          if (f.x < -10) f.x = width + 10;
          if (f.x > width + 10) f.x = -10;
          const y = f.y + Math.cos(f.phase) * 2.8;
          ctx.fillStyle = 'rgba(233, 250, 255, 0.5)';
          ctx.beginPath();
          ctx.arc(f.x, y, f.radius, 0, Math.PI * 2);
          ctx.fill();
        });
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
      <p>Each sketch is tuned for desktop and mobile with responsive sampling, density scaling, and interaction fields.</p>
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
