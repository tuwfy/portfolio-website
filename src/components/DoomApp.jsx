import React, { useEffect, useRef, useState } from 'react';

const DoomApp = () => {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const gameRef = useRef(null);
  const rafRef = useRef(null);
  const [status, setStatus] = useState('Clear the room.');
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let viewH = 0;
    let hudH = 0;

    const game = {
      player: { x: 0, y: 0, angle: -Math.PI / 2, hp: 100 },
      enemies: [],
      bullets: [],
      lastShotAt: 0,
      running: true,
      ammo: 50,
      armor: 0,
      weaponSlot: 2
    };
    gameRef.current = game;

    const spawnRoom = () => {
      w = canvas.width = canvas.clientWidth;
      h = canvas.height = canvas.clientHeight;
      hudH = Math.max(96, Math.floor(h * 0.31));
      viewH = h - hudH;
      game.player = { x: 0, y: 2.6, angle: -Math.PI / 2, hp: 100 };
      game.bullets = [];
      game.ammo = 50;
      game.armor = 0;
      game.weaponSlot = 2;
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
      const size = clamp(120 / rz, 10, 140);
      return { sx, size, z: rz };
    };

    const tryShoot = (now) => {
      if (now - game.lastShotAt < 220 || game.ammo <= 0) return;
      game.lastShotAt = now;
      game.ammo -= 1;
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

      game.bullets.forEach((b) => {
        b.age += 0.08;
      });
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
        setStatus('Game over. Press Restart.');
      } else if (alive === 0) {
        game.running = false;
        setStatus('Room cleared. Press Restart.');
      }
    };

    const drawHexFloor = () => {
      const horizon = viewH * 0.44;
      const bottom = viewH * 0.97;
      const rows = 11;
      for (let row = 0; row < rows; row++) {
        const f0 = row / rows;
        const f1 = (row + 1) / rows;
        const y0 = horizon + f0 * (bottom - horizon);
        const y1 = horizon + f1 * (bottom - horizon);
        const w0 = w * (0.1 + f0 * 0.9);
        const w1 = w * (0.1 + f1 * 0.9);
        const cx = w / 2;
        const cols = 16;
        for (let c = -cols; c <= cols; c++) {
          const x0l = cx + (c / cols) * w0;
          const x0r = cx + ((c + 1) / cols) * w0;
          const x1l = cx + (c / cols) * w1;
          const x1r = cx + ((c + 1) / cols) * w1;
          const shade = 34 + (row % 3) * 9 + (c % 2) * 7;
          ctx.fillStyle = `rgb(${shade},${shade},${shade + 5})`;
          ctx.strokeStyle = '#141414';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x0l, y0);
          ctx.lineTo(x0r, y0);
          ctx.lineTo(x1r, y1);
          ctx.lineTo(x1l, y1);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    };

    const drawWaterPool = () => {
      const horizon = viewH * 0.44;
      const mid = w / 2;
      const poolTop = horizon + (viewH - horizon) * 0.38;
      const poolBot = viewH * 0.92;
      ctx.fillStyle = '#1a4a9a';
      ctx.beginPath();
      ctx.moveTo(mid - w * 0.12, poolTop);
      ctx.lineTo(mid + w * 0.12, poolTop);
      ctx.lineTo(mid + w * 0.42, poolBot);
      ctx.lineTo(mid - w * 0.42, poolBot);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0a2a6a';
      ctx.stroke();
      // gore pile
      ctx.fillStyle = '#8a1010';
      ctx.beginPath();
      ctx.ellipse(mid, poolTop + (poolBot - poolTop) * 0.42, w * 0.06, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5a0808';
      ctx.beginPath();
      ctx.ellipse(mid - 8, poolTop + (poolBot - poolTop) * 0.4, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawPistol = () => {
      const bx = w * 0.5;
      const by = viewH * 0.97;
      ctx.save();
      ctx.translate(bx, by);
      // forearm + hand (tan)
      ctx.fillStyle = '#c49a6c';
      ctx.fillRect(-42, -18, 52, 22);
      ctx.fillRect(-8, -32, 36, 38);
      // pistol body
      ctx.fillStyle = '#2a2a2e';
      ctx.fillRect(-58, -48, 72, 28);
      ctx.fillRect(-62, -52, 24, 12);
      ctx.fillStyle = '#1a1a1c';
      ctx.fillRect(-58, -38, 68, 8);
      // barrel
      ctx.fillStyle = '#3a3a40';
      ctx.fillRect(-88, -44, 32, 16);
      ctx.restore();
    };

    const drawDoomFace = (cx, cy, box) => {
      const u = box / 14;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      // frame
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(cx - box / 2 - 4, cy - box / 2 - 4, box + 8, box + 8);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(cx - box / 2, cy - box / 2, box, box);
      const hp = game.player.hp;
      const grim = hp < 35;
      // hair
      ctx.fillStyle = '#4a3020';
      ctx.fillRect(cx - 5.5 * u, cy - 5 * u, 11 * u, 3.2 * u);
      // face
      ctx.fillStyle = grim ? '#a08068' : '#c8a080';
      ctx.fillRect(cx - 5 * u, cy - 2 * u, 10 * u, 8 * u);
      // eyes
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(cx - 3.5 * u, cy - 0.5 * u, 1.8 * u, 1.2 * u);
      ctx.fillRect(cx + 1.7 * u, cy - 0.5 * u, 1.8 * u, 1.2 * u);
      // nose shadow
      ctx.fillStyle = '#8a7060';
      ctx.fillRect(cx - 0.4 * u, cy + 0.8 * u, 0.8 * u, 1.5 * u);
      // mouth
      ctx.fillStyle = '#3a2a28';
      if (grim) {
        ctx.fillRect(cx - 2 * u, cy + 3 * u, 4 * u, 1.2 * u);
      } else {
        ctx.fillRect(cx - 2.2 * u, cy + 3 * u, 4.4 * u, 0.9 * u);
      }
      ctx.restore();
    };

    const drawStoneHud = (y0) => {
      for (let i = 0; i < 40; i++) {
        const rx = Math.random() * w;
        const ry = y0 + Math.random() * hudH;
        const rw = 8 + Math.random() * 24;
        const rh = 4 + Math.random() * 10;
        ctx.fillStyle = `rgba(${30 + Math.random() * 25},${30 + Math.random() * 25},${32 + Math.random() * 20},0.35)`;
        ctx.fillRect(rx, ry, rw, rh);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, y0, w, hudH);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 3;
      ctx.strokeRect(2, y0 + 2, w - 4, hudH - 4);
    };

    const drawHud = (y0) => {
      drawStoneHud(y0);
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 28px monospace';
      ctx.fillStyle = '#c02020';
      ctx.textAlign = 'center';
      ctx.fillText(String(game.ammo), w * 0.1, y0 + 38);
      ctx.font = '14px monospace';
      ctx.fillStyle = '#8a8a8a';
      ctx.fillText('AMMO', w * 0.1, y0 + 62);

      ctx.font = 'bold 28px monospace';
      ctx.fillStyle = '#c02020';
      ctx.fillText(`${Math.max(0, Math.round(game.player.hp))}%`, w * 0.24, y0 + 38);
      ctx.font = '14px monospace';
      ctx.fillStyle = '#8a8a8a';
      ctx.fillText('HEALTH', w * 0.24, y0 + 62);

      // Arms 1–7
      const armsX = w * 0.38;
      ctx.font = '12px monospace';
      ctx.fillStyle = '#8a8a8a';
      ctx.fillText('ARMS', armsX, y0 + 22);
      for (let n = 1; n <= 7; n++) {
        const ax = armsX - 52 + n * 15;
        const on = n === game.weaponSlot;
        ctx.fillStyle = on ? '#c8a820' : '#555';
        ctx.fillRect(ax - 5, y0 + 32, 14, 16);
        ctx.fillStyle = on ? '#1a1a1a' : '#aaa';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(n), ax + 2, y0 + 41);
      }

      const faceBox = 52;
      drawDoomFace(w / 2, y0 + hudH / 2 + 2, faceBox);

      ctx.textAlign = 'center';
      ctx.font = 'bold 28px monospace';
      ctx.fillStyle = '#c02020';
      ctx.fillText(`${game.armor}%`, w * 0.76, y0 + 38);
      ctx.font = '14px monospace';
      ctx.fillStyle = '#8a8a8a';
      ctx.fillText('ARMOR', w * 0.76, y0 + 62);

      const col = w * 0.88;
      const rows = [
        ['BULL', `${game.ammo} / 200`],
        ['SHEL', '0 / 50'],
        ['RCKT', '0 / 50'],
        ['CELL', '0 / 300']
      ];
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      rows.forEach(([label, val], i) => {
        ctx.fillStyle = '#c8a820';
        ctx.fillText(label, col - 38, y0 + 28 + i * 18);
        ctx.fillText(val, col + 8, y0 + 28 + i * 18);
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, viewH);
      ctx.clip();

      ctx.fillStyle = '#1a1c22';
      ctx.fillRect(0, 0, w, viewH * 0.42);
      ctx.fillStyle = '#2e3238';
      ctx.fillRect(0, viewH * 0.42, w, viewH * 0.58);

      // ceiling panels
      ctx.strokeStyle = '#3a3f48';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const px = (i / 8) * w;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px + w * 0.06, viewH * 0.42);
        ctx.stroke();
      }

      drawHexFloor();
      drawWaterPool();

      ctx.strokeStyle = '#5e5e5e';
      ctx.lineWidth = 2;
      for (let i = -4; i <= 4; i++) {
        const a = worldToScreen(i, -3.5);
        const b = worldToScreen(i, 3.5);
        if (a && b) {
          ctx.beginPath();
          ctx.moveTo(a.sx, viewH * 0.46 - a.size * 0.35);
          ctx.lineTo(a.sx, viewH * 0.82 + a.size * 0.08);
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
        const y = viewH * 0.67 - p.size;
        ctx.fillStyle = '#7e1f1f';
        ctx.fillRect(x, y, p.size, p.size);
        ctx.fillStyle = '#f3f0d0';
        ctx.fillRect(x + p.size * 0.2, y + p.size * 0.28, p.size * 0.2, p.size * 0.15);
        ctx.fillRect(x + p.size * 0.6, y + p.size * 0.28, p.size * 0.2, p.size * 0.15);
      });

      drawPistol();

      ctx.strokeStyle = '#d8d8d8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 10, viewH / 2);
      ctx.lineTo(w / 2 + 10, viewH / 2);
      ctx.moveTo(w / 2, viewH / 2 - 10);
      ctx.lineTo(w / 2, viewH / 2 + 10);
      ctx.stroke();

      game.bullets.forEach((b) => {
        ctx.strokeStyle = `rgba(255,220,140,${1 - b.age})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, viewH * 0.77);
        ctx.lineTo(w / 2, viewH / 2 - 16 - b.age * 80);
        ctx.stroke();
      });

      ctx.restore();

      drawHud(viewH);
    };

    const frame = (now) => {
      update(now);
      draw();
      rafRef.current = requestAnimationFrame(frame);
    };

    const keyDown = (e) => {
      keysRef.current[e.key] = true;
    };
    const keyUp = (e) => {
      keysRef.current[e.key] = false;
    };

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
  }, [restartKey]);

  return (
    <div className="mac-content-inner doom-app">
      <div className="doom-header">
        <div className="doom-logo-plate">
          <img src="/doom-logo.png" alt="Doom" className="doom-logo-wide" />
        </div>
        <p className="doom-note">One-room Doom shooter. Move: WASD/Arrows, turn: A/D or Left/Right, shoot: Space.</p>
        <div className="doom-restart-row">
          <button type="button" className="retro-mac-btn doom-restart-btn" onClick={() => setRestartKey((k) => k + 1)}>
            Restart
          </button>
          <span className="doom-status-inline">{status}</span>
        </div>
      </div>
      <canvas ref={canvasRef} className="doom-iframe" />
      <div className="doom-mobile-controls">
        <button className="retro-mac-btn" onMouseDown={() => (keysRef.current.ArrowUp = true)} onMouseUp={() => (keysRef.current.ArrowUp = false)} onTouchStart={() => (keysRef.current.ArrowUp = true)} onTouchEnd={() => (keysRef.current.ArrowUp = false)}>Forward</button>
        <button className="retro-mac-btn" onMouseDown={() => (keysRef.current.ArrowLeft = true)} onMouseUp={() => (keysRef.current.ArrowLeft = false)} onTouchStart={() => (keysRef.current.ArrowLeft = true)} onTouchEnd={() => (keysRef.current.ArrowLeft = false)}>Turn L</button>
        <button className="retro-mac-btn" onMouseDown={() => (keysRef.current[' '] = true)} onMouseUp={() => (keysRef.current[' '] = false)} onTouchStart={() => (keysRef.current[' '] = true)} onTouchEnd={() => (keysRef.current[' '] = false)}>Shoot</button>
        <button className="retro-mac-btn" onMouseDown={() => (keysRef.current.ArrowRight = true)} onMouseUp={() => (keysRef.current.ArrowRight = false)} onTouchStart={() => (keysRef.current.ArrowRight = true)} onTouchEnd={() => (keysRef.current.ArrowRight = false)}>Turn R</button>
      </div>
    </div>
  );
};

export default DoomApp;
