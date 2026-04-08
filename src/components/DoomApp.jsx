import React, { useEffect, useRef, useState } from 'react';

const DoomApp = () => {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const gameRef = useRef(null);
  const rafRef = useRef(null);
  const [status, setStatus] = useState('Clear the room.');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;

    const game = {
      player: { x: 0, y: 0, angle: -Math.PI / 2, hp: 100 },
      enemies: [],
      bullets: [],
      lastShotAt: 0,
      running: true
    };
    gameRef.current = game;

    const spawnRoom = () => {
      w = canvas.width = canvas.clientWidth;
      h = canvas.height = canvas.clientHeight;
      game.player = { x: 0, y: 2.6, angle: -Math.PI / 2, hp: 100 };
      game.bullets = [];
      game.enemies = [
        { x: -2.5, y: -2.2, hp: 3, alive: true },
        { x: 0.2, y: -2.7, hp: 3, alive: true },
        { x: 2.3, y: -2.1, hp: 3, alive: true }
      ];
      game.running = true;
      setStatus('Clear the room.');
    };

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const worldToScreen = (wx, wy) => {
      const dx = wx - game.player.x;
      const dy = wy - game.player.y;
      const sin = Math.sin(-game.player.angle);
      const cos = Math.cos(-game.player.angle);
      const rx = dx * cos - dy * sin;
      const rz = dx * sin + dy * cos;
      if (rz <= 0.05) return null;
      const fov = 220;
      const sx = w / 2 + (rx / rz) * fov;
      const size = clamp((120 / rz), 10, 140);
      return { sx, size, z: rz };
    };

    const tryShoot = (now) => {
      if (now - game.lastShotAt < 220) return;
      game.lastShotAt = now;
      game.bullets.push({ age: 0 });
      const target = game.enemies
        .filter((e) => e.alive)
        .map((e) => ({ e, proj: worldToScreen(e.x, e.y) }))
        .filter((v) => v.proj && Math.abs(v.proj.sx - w / 2) < 42)
        .sort((a, b) => a.proj.z - b.proj.z)[0];
      if (target) {
        target.e.hp -= 1;
        if (target.e.hp <= 0) target.e.alive = false;
      }
    };

    const update = (now) => {
      if (!game.running) return;
      const moveSpeed = 0.06;
      const rotSpeed = 0.045;
      if (keysRef.current.ArrowLeft || keysRef.current.a) game.player.angle -= rotSpeed;
      if (keysRef.current.ArrowRight || keysRef.current.d) game.player.angle += rotSpeed;
      const fx = Math.cos(game.player.angle);
      const fy = Math.sin(game.player.angle);
      if (keysRef.current.ArrowUp || keysRef.current.w) {
        game.player.x += fx * moveSpeed;
        game.player.y += fy * moveSpeed;
      }
      if (keysRef.current.ArrowDown || keysRef.current.s) {
        game.player.x -= fx * moveSpeed;
        game.player.y -= fy * moveSpeed;
      }
      game.player.x = clamp(game.player.x, -3.2, 3.2);
      game.player.y = clamp(game.player.y, -3.2, 3.2);
      if (keysRef.current[' ']) tryShoot(now);

      game.bullets.forEach((b) => { b.age += 0.08; });
      game.bullets = game.bullets.filter((b) => b.age < 0.9);

      game.enemies.forEach((e) => {
        if (!e.alive) return;
        const dx = game.player.x - e.x;
        const dy = game.player.y - e.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 0.5) {
          e.x += (dx / d) * 0.01;
          e.y += (dy / d) * 0.01;
        } else {
          game.player.hp = Math.max(0, game.player.hp - 0.12);
        }
      });

      const alive = game.enemies.filter((e) => e.alive).length;
      if (game.player.hp <= 0) {
        game.running = false;
        setStatus('Game over. Refresh Doom app to restart.');
      } else if (alive === 0) {
        game.running = false;
        setStatus('Room cleared. Refresh Doom app to restart.');
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#262d3d';
      ctx.fillRect(0, 0, w, h * 0.42);
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(0, h * 0.42, w, h * 0.58);

      // Room walls
      ctx.strokeStyle = '#5e5e5e';
      ctx.lineWidth = 2;
      for (let i = -4; i <= 4; i++) {
        const a = worldToScreen(i, -3.5);
        const b = worldToScreen(i, 3.5);
        if (a && b) {
          ctx.beginPath();
          ctx.moveTo(a.sx, h * 0.46 - a.size * 0.35);
          ctx.lineTo(a.sx, h * 0.82 + a.size * 0.08);
          ctx.stroke();
        }
      }

      const sprites = game.enemies
        .filter((e) => e.alive)
        .map((e) => ({ e, p: worldToScreen(e.x, e.y) }))
        .filter((v) => v.p)
        .sort((a, b) => b.p.z - a.p.z);

      sprites.forEach(({ p }) => {
        const x = p.sx - p.size / 2;
        const y = h * 0.67 - p.size;
        ctx.fillStyle = '#7e1f1f';
        ctx.fillRect(x, y, p.size, p.size);
        ctx.fillStyle = '#f3f0d0';
        ctx.fillRect(x + p.size * 0.2, y + p.size * 0.28, p.size * 0.2, p.size * 0.15);
        ctx.fillRect(x + p.size * 0.6, y + p.size * 0.28, p.size * 0.2, p.size * 0.15);
      });

      // weapon + crosshair
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(w * 0.45, h * 0.79, w * 0.1, h * 0.18);
      ctx.strokeStyle = '#d8d8d8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 10, h / 2);
      ctx.lineTo(w / 2 + 10, h / 2);
      ctx.moveTo(w / 2, h / 2 - 10);
      ctx.lineTo(w / 2, h / 2 + 10);
      ctx.stroke();

      game.bullets.forEach((b) => {
        ctx.strokeStyle = `rgba(255,220,140,${1 - b.age})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.77);
        ctx.lineTo(w / 2, h / 2 - 16 - b.age * 80);
        ctx.stroke();
      });

      const alive = game.enemies.filter((e) => e.alive).length;
      ctx.fillStyle = '#fff';
      ctx.font = '18px VT323';
      ctx.fillText(`HP ${Math.round(game.player.hp)}`, 12, 22);
      ctx.fillText(`MONSTERS ${alive}`, w - 128, 22);
    };

    const frame = (now) => {
      update(now);
      draw();
      rafRef.current = requestAnimationFrame(frame);
    };

    const keyDown = (e) => { keysRef.current[e.key] = true; };
    const keyUp = (e) => { keysRef.current[e.key] = false; };

    spawnRoom();
    rafRef.current = requestAnimationFrame(frame);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('resize', spawnRoom);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('resize', spawnRoom);
    };
  }, []);

  return (
    <div className="mac-content-inner doom-app">
      <div className="doom-header">
        <img src="/doom-icon.png" alt="Doom icon" className="doom-badge" />
        <p className="doom-note">Mini Doom-style one-room shooter. Move: WASD/Arrows. Shoot: Space.</p>
      </div>
      <canvas ref={canvasRef} className="doom-iframe" />
      <p className="doom-status">{status}</p>
    </div>
  );
};

export default DoomApp;
