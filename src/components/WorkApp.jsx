import React, { useRef, useEffect } from 'react';

const RIDGE_COLORS = ['#c3b190', '#9f8467', '#6e7f5f', '#3c4b3a'];
const STAR_COLORS = ['#f2f4ff', '#c6d4ff', '#95a7ff', '#6277d8'];

const CreativeCanvas = ({ mode }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const pointsRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
      pointsRef.current = Array.from({ length: mode === 'topography' ? 40 : 140 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (mode === 'topography' ? 0.08 : 0.16),
        vy: (Math.random() - 0.5) * (mode === 'topography' ? 0.06 : 0.14),
        size: Math.random() * (mode === 'topography' ? 2.2 : 2.4) + 0.8,
        phase: Math.random() * Math.PI * 2,
        color: (mode === 'topography' ? RIDGE_COLORS : STAR_COLORS)[Math.floor(Math.random() * 4)]
      }));
    };

    const updateMouse = (cx, cy) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = cx - rect.left;
      mouseRef.current.y = cy - rect.top;
      mouseRef.current.active = true;
    };

    const drawBackground = (time) => {
      if (mode === 'topography') {
        const g = ctx.createLinearGradient(0, 0, 0, height);
        g.addColorStop(0, '#dad1bf');
        g.addColorStop(0.5, '#b49a7b');
        g.addColorStop(1, '#435445');
        ctx.fillStyle = g;
      } else {
        const g = ctx.createLinearGradient(0, 0, 0, height);
        g.addColorStop(0, '#03050f');
        g.addColorStop(1, '#0c1231');
        ctx.fillStyle = g;
      }
      ctx.fillRect(0, 0, width, height);
      if (mode === 'topography') {
        for (let layer = 0; layer < 9; layer++) {
          const baseline = height * (0.18 + layer * 0.095);
          ctx.strokeStyle = RIDGE_COLORS[layer % RIDGE_COLORS.length];
          ctx.lineWidth = 1.5 + layer * 0.25;
          ctx.beginPath();
          for (let x = 0; x <= width; x += 10) {
            const curve = Math.sin((x * 0.01) + time * 0.0007 + layer) * (8 + layer * 2.4);
            const breeze = Math.cos((x * 0.02) - time * 0.0004 + layer * 0.5) * (3 + layer);
            const y = baseline + curve + breeze;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    };

    const render = (time) => {
      drawBackground(time);
      const points = pointsRef.current;

      points.forEach((p) => {
        p.phase += mode === 'topography' ? 0.015 : 0.012;
        p.x += p.vx + Math.cos(p.phase) * (mode === 'topography' ? 0.025 : 0.03);
        p.y += p.vy + Math.sin(p.phase) * (mode === 'topography' ? 0.015 : 0.02);
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;
        if (p.y < -8) p.y = height + 8;
        if (p.y > height + 8) p.y = -8;

        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const radius = mode === 'topography' ? 150 : 160;
          if (d < radius) {
            const pull = (1 - d / radius) * (mode === 'topography' ? 0.035 : 0.08);
            p.x += dx * pull;
            p.y += dy * pull;
          }
        }

        if (mode === 'topography') {
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.sin(p.phase) * 10, p.y + Math.cos(p.phase) * 10);
          ctx.stroke();
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      if (mode === 'stars') {
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            const a = points[i];
            const b = points[j];
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
    const onLeave = () => {
      mouseRef.current.active = false;
    };
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
      <p>Two interactive sketches: an analog topographic flow on top, and a polished reactive starfield below.</p>
      <p>Move your cursor or finger across each sketch to gently influence the motion.</p>
    </div>
    <div className="work-sketch-card">
      <h4>Analog Topographic Drift</h4>
      <CreativeCanvas mode="topography" />
    </div>
    <div className="work-sketch-card">
      <h4>Night Stars</h4>
      <CreativeCanvas mode="stars" />
    </div>
  </div>
);

export default WorkApp;
