import React, { useRef, useEffect } from 'react';

const WorkApp = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  // Particle configuration
  const particles = useRef([]);
  const numParticles = 150;
  const colors = ['#333333', '#444444', '#555555', '#2a2a2a'];

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
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.baseX = this.x;
        this.baseY = this.y;
        this.drag = Math.random() * 0.03 + 0.02;
        this.maxDistance = 150 + Math.random() * 100;
      }

      update(mouse) {
        if (!mouse.active) {
          // Stillness - drift at rest
          this.x += this.vx;
          this.y += this.vy;

          // Gently return to center if drifted too far
          const dx = this.x - this.baseX;
          const dy = this.y - this.baseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 50) {
            this.x -= dx * 0.005;
            this.y -= dy * 0.005;
          }
        } else {
          // Interaction - respond to cursor
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const force = Math.min(1, distance / this.maxDistance);

          // Gently attract to cursor
          if (distance < this.maxDistance) {
            this.x += dx * force * this.drag;
            this.y += dy * force * this.drag;
          }

          // Return to base when cursor moves away
          if (!mouse.active || distance > 100) {
            this.x += (this.baseX - this.x) * 0.01;
            this.y += (this.baseY - this.y) * 0.01;
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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particles.current.forEach(particle => {
        particle.update(mouseRef.current);
        particle.draw(ctx);
      });

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
    <div className="mac-content-inner" data-component="work" style={{ margin: 0, padding: 0, width: '100%', height: '100%' }}>
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
