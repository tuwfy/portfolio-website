import React, { useRef, useEffect } from 'react';

const WAVE_COLORS = ['#74b6d8', '#4e92bb', '#2f6f97', '#1e4f71'];
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
      const isMobile = window.innerWidth <= 768;
      const pointCount = mode === 'waves' ? (isMobile ? 18 : 26) : (isMobile ? 70 : 110);
      pointsRef.current = Array.from({ length: pointCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (mode === 'waves' ? 0.07 : 0.13),
        vy: (Math.random() - 0.5) * (mode === 'waves' ? 0.05 : 0.11),
        size: Math.random() * (mode === 'waves' ? 2.0 : 2.1) + 0.8,
        phase: Math.random() * Math.PI * 2,
        color: (mode === 'waves' ? WAVE_COLORS : STAR_COLORS)[Math.floor(Math.random() * 4)]
      }));
    };

    const updateMouse = (cx, cy) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = cx - rect.left;
      mouseRef.current.y = cy - rect.top;
      mouseRef.current.active = true;
    };

    const drawBackground = (time) => {
      if (mode === 'waves') {
        const g = ctx.createLinearGradient(0, 0, 0, height);
        g.addColorStop(0, '#95d2ee');
        g.addColorStop(0.45, '#4d9ccc');
        g.addColorStop(1, '#19486c');
        ctx.fillStyle = g;
      } else {
        const g = ctx.createLinearGradient(0, 0, 0, height);
        g.addColorStop(0, '#03050f');
        g.addColorStop(1, '#0c1231');
        ctx.fillStyle = g;
      }
      ctx.fillRect(0, 0, width, height);
      if (mode === 'waves') {
        const isMobile = window.innerWidth <= 768;
        const layers = isMobile ? 6 : 9;
        for (let layer = 0; layer < layers; layer++) {
          const baseline = height * (0.25 + layer * 0.095);
          ctx.strokeStyle = WAVE_COLORS[layer % WAVE_COLORS.length];
          ctx.lineWidth = 1.2 + layer * 0.22;
          ctx.beginPath();
          const step = isMobile ? 16 : 10;
          for (let x = 0; x <= width; x += step) {
            const swell = Math.sin((x * 0.011) + time * 0.0011 + layer * 0.65) * (6 + layer * 2.1);
            const chop = Math.cos((x * 0.026) - time * 0.0009 + layer * 0.41) * (2 + layer * 0.7);
            const y = baseline + swell + chop;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    };

    let frameGate = 0;
    const render = (time) => {
      const isMobile = window.innerWidth <= 768;
      frameGate += 1;
      if (isMobile && frameGate % 2 !== 0) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }
      drawBackground(time);
      const points = pointsRef.current;

      points.forEach((p) => {
        p.phase += mode === 'waves' ? 0.013 : 0.011;
        p.x += p.vx + Math.cos(p.phase) * (mode === 'waves' ? 0.02 : 0.03);
        p.y += p.vy + Math.sin(p.phase) * (mode === 'waves' ? 0.014 : 0.02);
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;
        if (p.y < -8) p.y = height + 8;
        if (p.y > height + 8) p.y = -8;

        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const radius = mode === 'waves' ? 140 : 140;
          if (d < radius) {
            const pull = (1 - d / radius) * (mode === 'waves' ? 0.03 : 0.07);
            p.x += dx * pull;
            p.y += dy * pull;
          }
        }

        if (mode === 'waves') {
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.sin(p.phase) * 8, p.y + Math.cos(p.phase) * 8);
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
        const isMobile = window.innerWidth <= 768;
        if (!isMobile) {
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
      <p>Two interactive sketches: an ocean wave study on top, and a polished reactive starfield below.</p>
      <p>Move your cursor or finger across each sketch to gently influence the motion.</p>
    </div>
    <div className="work-sketch-card">
      <h4>Ocean Wave Drift</h4>
      <CreativeCanvas mode="waves" />
    </div>
    <div className="work-sketch-card">
      <h4>Night Stars</h4>
      <CreativeCanvas mode="stars" />
    </div>
  </div>
);

export default WorkApp;
