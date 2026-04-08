import React, { useEffect, useRef, useState } from 'react';

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 200;
const VIEWPORT_HEIGHT = 154;
const HUD_Y = VIEWPORT_HEIGHT;
const SCREEN_CENTER_X = VIEW_WIDTH / 2;

const ASSET_RECTS = {
  room: { src: '/doom-ref-room-2.png', x: 0, y: 0, w: 640, h: 320 },
  hud: { src: '/doom-ref-room-3.png', x: 0, y: 430, w: 1024, h: 147 },
  gunIdle: { src: '/doom-ref-room-1.png', x: 155, y: 114, w: 152, h: 78 },
  gunFlash: { src: '/doom-ref-room-3.png', x: 332, y: 126, w: 178, h: 132 },
  enemyAlive: { src: '/doom-ref-room-1.png', x: 324, y: 22, w: 118, h: 164 },
  enemyHit: { src: '/doom-ref-room-3.png', x: 263, y: 15, w: 209, h: 266 }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const drawSprite = (ctx, image, rect, dx, dy, dw, dh, alpha = 1) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h, dx, dy, dw, dh);
  ctx.restore();
};

const DoomApp = () => {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const rafRef = useRef(null);
  const [status, setStatus] = useState('Clear the room.');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    const buffer = document.createElement('canvas');
    buffer.width = VIEW_WIDTH;
    buffer.height = VIEW_HEIGHT;
    const bctx = buffer.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    bctx.imageSmoothingEnabled = false;

    let disposed = false;
    let frameWidth = 0;
    let frameHeight = 0;
    let assets = null;

    const game = {
      player: {
        x: 0,
        y: 2.45,
        angle: -Math.PI / 2,
        hp: 100,
        armor: 0,
        ammo: 50,
        hurtAt: -999,
        weaponFlashUntil: 0
      },
      enemies: [],
      lastShotAt: 0,
      running: true,
      lastFrameAt: 0
    };

    const spawnRoom = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      frameWidth = canvas.clientWidth;
      frameHeight = canvas.clientHeight;
      canvas.width = Math.round(frameWidth * dpr);
      canvas.height = Math.round(frameHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      game.player = {
        x: 0,
        y: 2.45,
        angle: -Math.PI / 2,
        hp: 100,
        armor: 0,
        ammo: 50,
        hurtAt: -999,
        weaponFlashUntil: 0
      };
      game.enemies = [
        { x: -1.65, y: -2.1, hp: 3, alive: true, hitAt: -999, bobSeed: 0.1 },
        { x: 0.18, y: -2.55, hp: 3, alive: true, hitAt: -999, bobSeed: 0.9 },
        { x: 1.55, y: -1.95, hp: 3, alive: true, hitAt: -999, bobSeed: 1.6 }
      ];
      game.lastShotAt = 0;
      game.running = true;
      game.lastFrameAt = 0;
      setStatus('Clear the room.');
    };

    const worldToScreen = (wx, wy) => {
      const dx = wx - game.player.x;
      const dy = wy - game.player.y;
      const sin = Math.sin(-game.player.angle);
      const cos = Math.cos(-game.player.angle);
      const rx = dx * cos - dy * sin;
      const rz = dx * sin + dy * cos;
      if (rz <= 0.08) return null;
      const sx = SCREEN_CENTER_X + (rx / rz) * 165;
      const size = clamp(108 / rz, 28, 150);
      return { sx, size, depth: rz };
    };

    const tryShoot = (now) => {
      if (!game.running || now - game.lastShotAt < 260 || game.player.ammo <= 0) return;

      game.lastShotAt = now;
      game.player.weaponFlashUntil = now + 90;
      game.player.ammo = Math.max(0, game.player.ammo - 1);

      const target = game.enemies
        .filter((enemy) => enemy.alive)
        .map((enemy) => ({ enemy, projection: worldToScreen(enemy.x, enemy.y) }))
        .filter(({ projection }) => projection && Math.abs(projection.sx - SCREEN_CENTER_X) < 28)
        .sort((a, b) => a.projection.depth - b.projection.depth)[0];

      if (!target) return;

      target.enemy.hp -= 1;
      target.enemy.hitAt = now;
      if (target.enemy.hp <= 0) {
        target.enemy.alive = false;
      }
    };

    const update = (now) => {
      if (!game.running) return;

      const delta = game.lastFrameAt ? Math.min(40, now - game.lastFrameAt) : 16;
      game.lastFrameAt = now;

      const moveSpeed = delta * 0.0021;
      const turnSpeed = delta * 0.0023;
      const forwardX = Math.cos(game.player.angle);
      const forwardY = Math.sin(game.player.angle);

      if (keysRef.current.arrowleft || keysRef.current.a) game.player.angle -= turnSpeed;
      if (keysRef.current.arrowright || keysRef.current.d) game.player.angle += turnSpeed;

      if (keysRef.current.arrowup || keysRef.current.w) {
        game.player.x += forwardX * moveSpeed;
        game.player.y += forwardY * moveSpeed;
      }

      if (keysRef.current.arrowdown || keysRef.current.s) {
        game.player.x -= forwardX * moveSpeed;
        game.player.y -= forwardY * moveSpeed;
      }

      game.player.x = clamp(game.player.x, -2.8, 2.8);
      game.player.y = clamp(game.player.y, -2.8, 2.9);

      if (keysRef.current[' ']) {
        tryShoot(now);
      }

      game.enemies.forEach((enemy) => {
        if (!enemy.alive) return;
        const dx = game.player.x - enemy.x;
        const dy = game.player.y - enemy.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 0.78) {
          enemy.x += (dx / distance) * delta * 0.00055;
          enemy.y += (dy / distance) * delta * 0.00055;
        } else {
          game.player.hp = Math.max(0, game.player.hp - delta * 0.014);
          game.player.hurtAt = now;
        }
      });

      const aliveCount = game.enemies.filter((enemy) => enemy.alive).length;
      if (game.player.hp <= 0) {
        game.running = false;
        setStatus('Game over. Refresh Doom app to restart.');
      } else if (aliveCount === 0) {
        game.running = false;
        setStatus('Room cleared. Refresh Doom app to restart.');
      }
    };

    const drawHudNumbers = () => {
      bctx.save();
      bctx.textBaseline = 'top';
      bctx.fillStyle = '#bf1408';
      bctx.font = 'bold 18px VT323';
      bctx.fillText(String(Math.round(game.player.ammo)).padStart(2, '0'), 20, 166);
      bctx.fillText(`${Math.round(game.player.hp)}%`, 69, 166);
      bctx.fillText(`${Math.round(game.player.armor)}%`, 211, 166);
      bctx.restore();
    };

    const drawViewport = (now) => {
      const roomPan = Math.sin(game.player.angle) * 8 + game.player.x * 6;

      bctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
      bctx.fillStyle = '#101010';
      bctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

      drawSprite(
        bctx,
        assets.room,
        ASSET_RECTS.room,
        Math.round(roomPan),
        0,
        VIEW_WIDTH,
        VIEWPORT_HEIGHT
      );

      const vignette = bctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0.18)');
      vignette.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.24)');
      bctx.fillStyle = vignette;
      bctx.fillRect(0, 0, VIEW_WIDTH, VIEWPORT_HEIGHT);

      const enemies = game.enemies
        .filter((enemy) => enemy.alive)
        .map((enemy) => ({ enemy, projection: worldToScreen(enemy.x, enemy.y) }))
        .filter(({ projection }) => projection)
        .sort((a, b) => b.projection.depth - a.projection.depth);

      enemies.forEach(({ enemy, projection }) => {
        const bob = Math.sin(now * 0.006 + enemy.bobSeed) * 2;
        const size = projection.size;
        const spriteRect = now - enemy.hitAt < 90 ? ASSET_RECTS.enemyHit : ASSET_RECTS.enemyAlive;
        const spriteImage = now - enemy.hitAt < 90 ? assets.enemyHit : assets.enemyAlive;
        const drawWidth = size * (spriteRect.w / spriteRect.h);
        const drawHeight = size * 1.1;
        const drawX = Math.round(projection.sx - drawWidth / 2);
        const drawY = Math.round(92 - drawHeight / 2 + bob + projection.depth * 3);

        bctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        bctx.beginPath();
        bctx.ellipse(projection.sx, drawY + drawHeight - 5, drawWidth * 0.34, drawHeight * 0.1, 0, 0, Math.PI * 2);
        bctx.fill();

        drawSprite(bctx, spriteImage, spriteRect, drawX, drawY, drawWidth, drawHeight);
      });

      const gunBobX = Math.sin(now * 0.008) * 2;
      const gunBobY = Math.abs(Math.cos(now * 0.01)) * 2;
      const gunActive = now < game.player.weaponFlashUntil;
      const gunRect = gunActive ? ASSET_RECTS.gunFlash : ASSET_RECTS.gunIdle;
      const gunImage = gunActive ? assets.gunFlash : assets.gunIdle;
      const gunWidth = gunActive ? 140 : 122;
      const gunHeight = gunActive ? 104 : 72;

      drawSprite(
        bctx,
        gunImage,
        gunRect,
        Math.round(SCREEN_CENTER_X - gunWidth / 2 + gunBobX),
        Math.round(98 + gunBobY),
        gunWidth,
        gunHeight
      );

      drawSprite(bctx, assets.hud, ASSET_RECTS.hud, 0, HUD_Y, VIEW_WIDTH, VIEW_HEIGHT - HUD_Y);
      drawHudNumbers();

      if (now - game.player.hurtAt < 110) {
        bctx.fillStyle = 'rgba(186, 0, 0, 0.18)';
        bctx.fillRect(0, 0, VIEW_WIDTH, VIEWPORT_HEIGHT);
      }

      if (!game.running) {
        bctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        bctx.fillRect(0, 50, VIEW_WIDTH, 32);
        bctx.fillStyle = '#fff4da';
        bctx.font = '18px VT323';
        bctx.textAlign = 'center';
        bctx.fillText(game.player.hp <= 0 ? 'GAME OVER' : 'ROOM CLEARED', SCREEN_CENTER_X, 58);
        bctx.textAlign = 'left';
      }
    };

    const frame = (now) => {
      update(now);
      drawViewport(now);

      ctx.clearRect(0, 0, frameWidth, frameHeight);
      ctx.drawImage(buffer, 0, 0, frameWidth, frameHeight);
      rafRef.current = requestAnimationFrame(frame);
    };

    const setKey = (event, isPressed) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault();
      }
      keysRef.current[key] = isPressed;
    };

    const handleKeyDown = (event) => setKey(event, true);
    const handleKeyUp = (event) => setKey(event, false);

    const boot = async () => {
      const uniqueSources = [...new Set(Object.values(ASSET_RECTS).map((entry) => entry.src))];
      const loaded = await Promise.all(uniqueSources.map((src) => loadImage(src)));
      if (disposed) return;

      assets = uniqueSources.reduce((accumulator, src, index) => {
        accumulator[src] = loaded[index];
        return accumulator;
      }, {});

      assets = {
        room: assets[ASSET_RECTS.room.src],
        hud: assets[ASSET_RECTS.hud.src],
        gunIdle: assets[ASSET_RECTS.gunIdle.src],
        gunFlash: assets[ASSET_RECTS.gunFlash.src],
        enemyAlive: assets[ASSET_RECTS.enemyAlive.src],
        enemyHit: assets[ASSET_RECTS.enemyHit.src]
      };

      spawnRoom();
      window.addEventListener('keydown', handleKeyDown, { passive: false });
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('resize', spawnRoom);
      rafRef.current = requestAnimationFrame(frame);
    };

    boot().catch(() => {
      setStatus('Could not load Doom assets.');
    });

    return () => {
      disposed = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', spawnRoom);
    };
  }, []);

  return (
    <div className="mac-content-inner doom-app">
      <div className="doom-header">
        <img src="/doom-logo.png" alt="Doom logo" className="doom-logo-wide" />
        <p className="doom-note">Classic-style Doom mockup. Move: WASD or arrows. Shoot: Space.</p>
      </div>
      <canvas ref={canvasRef} className="doom-iframe" />
      <div className="doom-mobile-controls">
        <button
          className="retro-mac-btn"
          onMouseDown={() => (keysRef.current.arrowup = true)}
          onMouseUp={() => (keysRef.current.arrowup = false)}
          onMouseLeave={() => (keysRef.current.arrowup = false)}
          onTouchStart={() => (keysRef.current.arrowup = true)}
          onTouchEnd={() => (keysRef.current.arrowup = false)}
        >
          Forward
        </button>
        <button
          className="retro-mac-btn"
          onMouseDown={() => (keysRef.current.arrowleft = true)}
          onMouseUp={() => (keysRef.current.arrowleft = false)}
          onMouseLeave={() => (keysRef.current.arrowleft = false)}
          onTouchStart={() => (keysRef.current.arrowleft = true)}
          onTouchEnd={() => (keysRef.current.arrowleft = false)}
        >
          Turn L
        </button>
        <button
          className="retro-mac-btn"
          onMouseDown={() => (keysRef.current[' '] = true)}
          onMouseUp={() => (keysRef.current[' '] = false)}
          onMouseLeave={() => (keysRef.current[' '] = false)}
          onTouchStart={() => (keysRef.current[' '] = true)}
          onTouchEnd={() => (keysRef.current[' '] = false)}
        >
          Shoot
        </button>
        <button
          className="retro-mac-btn"
          onMouseDown={() => (keysRef.current.arrowright = true)}
          onMouseUp={() => (keysRef.current.arrowright = false)}
          onMouseLeave={() => (keysRef.current.arrowright = false)}
          onTouchStart={() => (keysRef.current.arrowright = true)}
          onTouchEnd={() => (keysRef.current.arrowright = false)}
        >
          Turn R
        </button>
      </div>
      <p className="doom-status">{status}</p>
    </div>
  );
};

export default DoomApp;
