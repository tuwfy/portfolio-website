import React, { useRef, useEffect } from 'react';

const WorkApp = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  // Particle configuration
  const particles = useRef([]);
  const numParticles = 120;
  const colors = ['#d6d8db', '#9fa5ac'];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;

    // Initialize canvas size
    const resize = () => {
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    // Particle class
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.size = Math.random() * 2.4 + 0.8;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.baseX = this.x;
        this.baseY = this.y;
        this.drag = Math.random() * 0.02 + 0.01;
        this.maxDistance = 120 + Math.random() * 90;
        this.pulse = Math.random() * Math.PI * 2;
      }

      update(mouse) {
        this.pulse += 0.01;
        this.size = Math.max(0.6, this.size + Math.sin(this.pulse) * 0.003);
        if (!mouse.active) {
          // Stillness - drift at rest
          this.x += this.vx;
          this.y += this.vy;

          // Gently return to center if drifted too far
          const dx = this.x - this.baseX;
          const dy = this.y - this.baseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 48) {
            this.x -= dx * 0.004;
            this.y -= dy * 0.004;
          }
        } else {
          // Interaction - respond to cursor
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const force = Math.max(0, 1 - distance / this.maxDistance);

          // Gently attract, then slightly swirl around cursor
          if (distance < this.maxDistance) {
            this.x += dx * force * this.drag;
            this.y += dy * force * this.drag;
            this.x += -dy * 0.0009 * this.maxDistance * force;
            this.y += dx * 0.0009 * this.maxDistance * force;
          }

          // Return to base when cursor moves away
          if (!mouse.active || distance > 90) {
            this.x += (this.baseX - this.x) * 0.012;
            this.y += (this.baseY - this.y) * 0.012;
          }
        }
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Initialize particles
    const initParticles = () => {
      particles.current = [];
      for (let i = 0; i < numParticles; i++) {
        particles.current.push(new Particle());
      }
    };

    // Animation loop
    const render = () => {
      // Clear canvas with subtle trail effect
      ctx.fillStyle = 'rgba(8, 8, 8, 0.11)';
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particles.current.forEach(particle => {
        particle.update(mouseRef.current);
        particle.draw(ctx);
      });

      // Draw gentle connective lines for an organic "processing" feel.
      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const a = particles.current[i];
          const b = particles.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 56) {
            const alpha = (1 - dist / 56) * 0.16;
            ctx.strokeStyle = `rgba(190, 194, 199, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      requestRef.current = requestAnimationFrame(render);
    };

    // Event listeners
    const updateMousePosition = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = clientX - rect.left;
      mouseRef.current.y = clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseMove = (e) => {
      updateMousePosition(e.clientX, e.clientY);
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    // Handle resize
    const handleResize = () => {
      resize();
      initParticles();
    };

    // Setup
    resize();
    initParticles();
    requestRef.current = requestAnimationFrame(render);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="mac-content-inner work-sketch-frame" data-component="work">
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: 'default'
        }}
      />
    </div>
  );
};

export default WorkApp;
