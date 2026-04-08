import React, { useEffect, useRef, useState } from 'react';

const DoomApp = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const keysRef = useRef({});
  const [status, setStatus] = useState('Survive and clear all enemies.');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    const player = { x: 0, y: 0, angle: 0, health: 100, speed: 2.4 };
    const bullets = [];
    const enemies = [];

    const reset = () => {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
      player.x = width / 2;
      player.y = height - 50;
      player.health = 100;
      bullets.length = 0;
      enemies.length = 0;
      for (let i = 0; i < 8; i++) {
        enemies.push({
          x: 24 + Math.random() * (width - 48),
          y: 24 + Math.random() * (height * 0.45),
          hp: 2,
          vx: (Math.random() - 0.5) * 0.9
        });
      }
      setStatus('Survive and clear all enemies.');
    };

    const fire = () => {
      bullets.push({
        x: player.x,
        y: player.y - 8,
        vx: Math.sin(player.angle) * 4.5,
        vy: -4.8
      });
    };

    let lastFire = 0;
    const loop = (time) => {
      ctx.fillStyle = '#161616';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#242424';
      ctx.fillRect(0, height * 0.62, width, height * 0.38);

      if (keysRef.current.ArrowLeft || keysRef.current.a) player.x -= player.speed;
      if (keysRef.current.ArrowRight || keysRef.current.d) player.x += player.speed;
      if (keysRef.current.ArrowUp || keysRef.current.w) player.y -= player.speed;
      if (keysRef.current.ArrowDown || keysRef.current.s) player.y += player.speed;
      if (keysRef.current[' '] && time - lastFire > 170) {
        fire();
        lastFire = time;
      }

      player.x = Math.max(12, Math.min(width - 12, player.x));
      player.y = Math.max(18, Math.min(height - 12, player.y));

      bullets.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
      });

      enemies.forEach((e) => {
        e.x += e.vx;
        if (e.x < 12 || e.x > width - 12) e.vx *= -1;
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 18) {
          player.health = Math.max(0, player.health - 0.18);
        }
      });

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (b.y < -10 || b.x < -10 || b.x > width + 10) {
          bullets.splice(i, 1);
          continue;
        }
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          const dx = b.x - e.x;
          const dy = b.y - e.y;
          if (Math.sqrt(dx * dx + dy * dy) < 12) {
            e.hp -= 1;
            bullets.splice(i, 1);
            if (e.hp <= 0) enemies.splice(j, 1);
            break;
          }
        }
      }

      bullets.forEach((b) => {
        ctx.fillStyle = '#ffdd8f';
        ctx.fillRect(b.x - 1, b.y - 4, 2, 6);
      });

      enemies.forEach((e) => {
        ctx.fillStyle = '#8f1f1f';
        ctx.fillRect(e.x - 8, e.y - 8, 16, 16);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(e.x - 4, e.y - 2, 3, 3);
        ctx.fillRect(e.x + 1, e.y - 2, 3, 3);
      });

      ctx.fillStyle = '#d9d9d9';
      ctx.fillRect(player.x - 8, player.y - 8, 16, 16);
      ctx.fillStyle = '#111';
      ctx.fillRect(player.x - 2, player.y - 12, 4, 8);

      ctx.fillStyle = '#fff';
      ctx.font = '16px VT323';
      ctx.fillText(`HP: ${Math.round(player.health)}`, 10, 18);
      ctx.fillText(`Enemies: ${enemies.length}`, width - 92, 18);

      if (player.health <= 0) {
        setStatus('Game over. Tap Restart.');
      } else if (enemies.length === 0) {
        setStatus('Victory. Tap Restart for another run.');
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    const keyDown = (e) => {
      keysRef.current[e.key] = true;
    };
    const keyUp = (e) => {
      keysRef.current[e.key] = false;
    };

    reset();
    animationRef.current = requestAnimationFrame(loop);
    window.addEventListener('resize', reset);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', reset);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, []);

  return (
    <div className="mac-content-inner doom-app">
      <p className="doom-note">Mini retro shooter inspired by Doom-style gameplay. Move: WASD/Arrows, Fire: Space.</p>
      <canvas ref={canvasRef} className="doom-canvas" />
      <div className="doom-controls">
        <button className="retro-mac-btn" onMouseDown={() => (keysRef.current.w = true)} onMouseUp={() => (keysRef.current.w = false)} onTouchStart={() => (keysRef.current.w = true)} onTouchEnd={() => (keysRef.current.w = false)}>Up</button>
        <button className="retro-mac-btn" onMouseDown={() => (keysRef.current.a = true)} onMouseUp={() => (keysRef.current.a = false)} onTouchStart={() => (keysRef.current.a = true)} onTouchEnd={() => (keysRef.current.a = false)}>Left</button>
        <button className="retro-mac-btn" onMouseDown={() => (keysRef.current[' '] = true)} onMouseUp={() => (keysRef.current[' '] = false)} onTouchStart={() => (keysRef.current[' '] = true)} onTouchEnd={() => (keysRef.current[' '] = false)}>Fire</button>
        <button className="retro-mac-btn" onMouseDown={() => (keysRef.current.d = true)} onMouseUp={() => (keysRef.current.d = false)} onTouchStart={() => (keysRef.current.d = true)} onTouchEnd={() => (keysRef.current.d = false)}>Right</button>
        <button className="retro-mac-btn" onMouseDown={() => (keysRef.current.s = true)} onMouseUp={() => (keysRef.current.s = false)} onTouchStart={() => (keysRef.current.s = true)} onTouchEnd={() => (keysRef.current.s = false)}>Down</button>
      </div>
      <p className="doom-status">{status}</p>
    </div>
  );
};

export default DoomApp;
