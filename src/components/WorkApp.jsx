import React, { useRef, useEffect } from 'react';

const STAR_COLORS = ['#f2f4ff', '#c6d4ff', '#95a7ff', '#6277d8'];

const CreativeCanvas = ({ mode }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(0);
  const entitiesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    const isMobile = () => window.innerWidth <= 768;

    const resize = () => {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
      if (mode === 'stars') {
        const count = isMobile() ? 56 : 100;
        entitiesRef.current = Array.from({ length: count }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.09,
          size: Math.random() * 1.8 + 0.8,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          phase: Math.random() * Math.PI * 2
        }));
      } else {
        const count =
          mode === 'grass' ? (isMobile() ? 240 : 520) : isMobile() ? 24 : 36;
        entitiesRef.current = Array.from({ length: count }, (_, i) => ({
          x: (i / count) * width * 1.02 + (Math.random() - 0.5) * (width / count) * 2.4,
          baseY:
            mode === 'grass'
              ? height * (0.56 + Math.random() * 0.44)
              : height * (0.26 + (i % 12) * 0.052),
          length: mode === 'grass' ? 38 + Math.random() * 118 : 0,
          amp: mode === 'grass' ? 7 + Math.random() * 18 : 5 + Math.random() * 15,
          phase: Math.random() * Math.PI * 2,
          lw: mode === 'grass' ? 0.65 + Math.random() * 1.55 : 0,
          depth: mode === 'grass' ? Math.random() : 0
        }));
      }
    };

    const updateMouse = (cx, cy) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = cx - rect.left;
      mouseRef.current.y = cy - rect.top;
      mouseRef.current.active = true;
    };

    const drawBackground = (time) => {
      if (mode === 'grass') {
        const g = ctx.createLinearGradient(0, 0, 0, height);
        g.addColorStop(0, '#d4e4c8');
        g.addColorStop(0.22, '#9bc278');
        g.addColorStop(0.48, '#4a9838');
        g.addColorStop(0.78, '#2d6a28');
        g.addColorStop(1, '#143a1a');
        ctx.fillStyle = g;
      } else if (mode === 'water') {
        const g = ctx.createLinearGradient(0, 0, 0, height);
        g.addColorStop(0, '#8ec9e8');
        g.addColorStop(0.45, '#3d8cbc');
        g.addColorStop(1, '#143f64');
        ctx.fillStyle = g;
      } else {
        const g = ctx.createLinearGradient(0, 0, 0, height);
        g.addColorStop(0, '#03050f');
        g.addColorStop(1, '#0c1231');
        ctx.fillStyle = g;
      }
      ctx.fillRect(0, 0, width, height);

      if (mode === 'grass') {
        const haze = ctx.createLinearGradient(0, 0, 0, height * 0.62);
        haze.addColorStop(0, 'rgba(230, 236, 228, 0.35)');
        haze.addColorStop(0.35, 'rgba(180, 210, 170, 0.12)');
        haze.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, width, height * 0.62);
      }

      if (mode === 'water') {
        const layers = isMobile() ? 5 : 8;
        for (let layer = 0; layer < layers; layer++) {
          const baseline = height * (0.24 + layer * 0.1);
          ctx.strokeStyle = `rgba(185, 228, 255, ${0.35 - layer * 0.03})`;
          ctx.lineWidth = 1.4 + layer * 0.24;
          ctx.beginPath();
          const step = isMobile() ? 20 : 12;
          for (let x = 0; x <= width; x += step) {
            const current = Math.sin((x * 0.008) + time * 0.0015 + layer * 0.6) * (8 + layer * 2.4);
            const chop = Math.cos((x * 0.027) - time * 0.001 + layer * 0.37) * (2 + layer * 0.9);
            const y = baseline + current + chop;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    };

    let frameGate = 0;
    const render = (time) => {
      frameGate += 1;
      if (isMobile() && frameGate % 2 !== 0) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }
      drawBackground(time);
      const entities = entitiesRef.current;

      if (mode === 'stars') {
        entities.forEach((p) => {
          p.phase += 0.011;
          p.x += p.vx + Math.cos(p.phase) * 0.03;
          p.y += p.vy + Math.sin(p.phase) * 0.02;
          if (p.x < -8) p.x = width + 8;
          if (p.x > width + 8) p.x = -8;
          if (p.y < -8) p.y = height + 8;
          if (p.y > height + 8) p.y = -8;
          if (mouseRef.current.active) {
            const dx = mouseRef.current.x - p.x;
            const dy = mouseRef.current.y - p.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            if (d < 130) {
              const pull = (1 - d / 130) * 0.06;
              p.x += dx * pull;
              p.y += dy * pull;
            }
          }
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      } else if (mode === 'grass') {
        const blades = [...entities].sort((a, b) => a.baseY - b.baseY);
        blades.forEach((b, i) => {
          const baseX = b.x;
          const baseY = b.baseY;
          const len = b.length;
          const wind =
            Math.sin(baseX * 0.014 + time * 0.0014 + b.phase) * b.amp +
            Math.sin(baseX * 0.031 - time * 0.0009 + b.depth * 4) * (b.amp * 0.35);
          const localWave = Math.sin(baseY * 0.028 + time * 0.0011) * 5.5;
          let hoverBend = 0;
          if (mouseRef.current.active) {
            const hx = mouseRef.current.x;
            const hy = mouseRef.current.y;
            const dx = hx - baseX;
            const dy = hy - (baseY - len * 0.55);
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            if (d < 155) {
              const fall = (1 - d / 155) ** 1.35;
              hoverBend = fall * 42 * Math.sign(dx || 1) * (0.65 + b.depth * 0.35);
            }
          }
          const bend = wind + localWave + hoverBend;
          const depth = (baseY / height - 0.52) / 0.48;
          const g = 72 + depth * 95;
          const r = 22 + depth * 48;
          const bl = 28 + depth * 38;
          ctx.strokeStyle = `rgba(${r},${g},${bl},${0.55 + depth * 0.4})`;
          ctx.lineWidth = b.lw;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(baseX, baseY);
          ctx.bezierCurveTo(
            baseX + bend * 0.28,
            baseY - len * 0.34,
            baseX + bend * 0.62,
            baseY - len * 0.68,
            baseX + bend * 1.02,
            baseY - len
          );
          ctx.stroke();
          ctx.strokeStyle = `rgba(${Math.min(255, r + 40)},${Math.min(255, g + 50)},${bl + 20},${0.25 + depth * 0.25})`;
          ctx.lineWidth = Math.max(0.4, b.lw * 0.45);
          ctx.beginPath();
          ctx.moveTo(baseX + 1.2, baseY);
          ctx.bezierCurveTo(
            baseX + bend * 0.28 + 1.2,
            baseY - len * 0.34,
            baseX + bend * 0.62 + 0.8,
            baseY - len * 0.68,
            baseX + bend * 1.02,
            baseY - len * 0.98
          );
          ctx.stroke();
        });
      } else {
        entities.forEach((line, i) => {
          const yBase = line.baseY;
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(212,245,255,0.32)' : 'rgba(110,191,225,0.30)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let x = 0; x <= width; x += isMobile() ? 18 : 10) {
            const drift = Math.sin((x * 0.012) + time * 0.0018 + line.phase) * line.amp;
            const ripple = Math.cos((x * 0.034) - time * 0.0025 + i * 0.17) * (2.2 + (i % 5));
            let attract = 0;
            if (mouseRef.current.active) {
              const dx = x - mouseRef.current.x;
              const dy = yBase - mouseRef.current.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < 150) attract = Math.cos(d * 0.045 - time * 0.01) * (1 - d / 150) * 14;
            }
            const y = yBase + drift + ripple + attract;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      }

      if (mode === 'stars' && !isMobile()) {
        for (let i = 0; i < entities.length; i++) {
          for (let j = i + 1; j < entities.length; j++) {
            const a = entities[i];
            const b = entities[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 62) {
              const alpha = (1 - dist / 62) * 0.18;
              ctx.strokeStyle = `rgba(173, 190, 255, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
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
      <p>Three interactive sketches: flowing grass, a reactive starfield, and a realistic ocean current study.</p>
      <p>Move your cursor or finger across each sketch to influence the motion.</p>
    </div>
    <div className="work-sketch-card">
      <h4>Wind Through Tall Grass</h4>
      <CreativeCanvas mode="grass" />
    </div>
    <div className="work-sketch-card">
      <h4>Night Stars</h4>
      <CreativeCanvas mode="stars" />
    </div>
    <div className="work-sketch-card">
      <h4>Ocean Current Drift</h4>
      <CreativeCanvas mode="water" />
    </div>
  </div>
);

export default WorkApp;
