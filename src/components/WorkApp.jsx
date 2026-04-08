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
        const count = mode === 'grass' ? (isMobile() ? 120 : 180) : (isMobile() ? 24 : 36);
        entitiesRef.current = Array.from({ length: count }, (_, i) => ({
          x: (i / count) * width,
          baseY: mode === 'grass' ? height * (0.64 + Math.random() * 0.34) : height * (0.26 + (i % 12) * 0.052),
          length: mode === 'grass' ? 55 + Math.random() * 92 : 0,
          amp: mode === 'grass' ? 6 + Math.random() * 14 : 5 + Math.random() * 15,
          phase: Math.random() * Math.PI * 2
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
        g.addColorStop(0, '#b3cf9b');
        g.addColorStop(0.55, '#5e9d3f');
        g.addColorStop(1, '#245228');
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
        entities.forEach((b, i) => {
          const baseX = b.x;
          const baseY = b.baseY;
          const wind = Math.sin((i * 0.14) + time * 0.0017 + b.phase) * b.amp;
          const localWave = Math.sin((baseY * 0.03) + time * 0.0012) * 6;
          let hoverBend = 0;
          if (mouseRef.current.active) {
            const dx = mouseRef.current.x - baseX;
            const dy = mouseRef.current.y - (baseY - b.length * 0.6);
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            if (d < 120) hoverBend = (1 - d / 120) * 30 * Math.sign(dx);
          }
          const bend = wind + localWave + hoverBend;
          ctx.strokeStyle = i % 3 === 0 ? '#b4d47f' : '#4d7f38';
          ctx.lineWidth = 1 + (i % 2);
          ctx.beginPath();
          ctx.moveTo(baseX, baseY);
          ctx.quadraticCurveTo(baseX + bend * 0.45, baseY - b.length * 0.52, baseX + bend, baseY - b.length);
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
