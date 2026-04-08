import React, { useEffect, useRef, useState } from 'react';

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 200;
const VIEWPORT_HEIGHT = 154;
const HUD_Y = VIEWPORT_HEIGHT;
const SCREEN_CENTER_X = VIEW_WIDTH / 2;

const ASSET_RECTS = {
  room: { src: '/doom-ref-room-2.png', x: 0, y: 0, w: 640, h: 320 },
  hud: { src: '/doom-ref-room-3.png', x: 0, y: 430, w: 1024, h: 147 }
};

const HUD_GLYPHS = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '%': ['11001', '11010', '00100', '01000', '10110', '00110', '00000']
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const normalizeAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

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

const drawHudText = (ctx, text, x, y, scale = 3) => {
  let cursorX = x;

  text.split('').forEach((character) => {
    const glyph = HUD_GLYPHS[character] || HUD_GLYPHS['0'];

    glyph.forEach((row, rowIndex) => {
      for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
        if (row[columnIndex] !== '1') continue;

        ctx.fillStyle = '#2a0200';
        ctx.fillRect(cursorX + columnIndex * scale + 1, y + rowIndex * scale + 1, scale, scale);

        ctx.fillStyle = '#d11c0f';
        ctx.fillRect(cursorX + columnIndex * scale, y + rowIndex * scale, scale, scale);

        ctx.fillStyle = '#ff8768';
        ctx.fillRect(cursorX + columnIndex * scale, y + rowIndex * scale, scale, 1);
      }
    });

    cursorX += glyph[0].length * scale + scale;
  });
};

const createSpriteCanvas = (width, height, draw) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  draw(ctx, width, height);
  return canvas;
};

const createImpSprite = (isHit = false) =>
  createSpriteCanvas(60, 78, (ctx) => {
    const skin = isHit ? '#cba690' : '#b38b67';
    const skinDark = isHit ? '#8f6257' : '#77563d';
    const skinLight = isHit ? '#f0d8cc' : '#d2b08c';
    const blood = isHit ? '#d31717' : '#8a0b0b';

    ctx.fillStyle = skinDark;
    ctx.fillRect(20, 54, 8, 18);
    ctx.fillRect(32, 54, 8, 18);
    ctx.fillRect(14, 34, 8, 22);
    ctx.fillRect(38, 34, 8, 22);

    ctx.fillStyle = skin;
    ctx.fillRect(18, 18, 24, 36);
    ctx.fillRect(16, 44, 12, 10);
    ctx.fillRect(32, 44, 12, 10);

    ctx.fillStyle = skinLight;
    ctx.fillRect(22, 22, 16, 10);
    ctx.fillRect(24, 34, 12, 14);

    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.moveTo(18, 18);
    ctx.lineTo(10, 8);
    ctx.lineTo(16, 6);
    ctx.lineTo(23, 16);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(42, 18);
    ctx.lineTo(50, 8);
    ctx.lineTo(44, 6);
    ctx.lineTo(37, 16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(30, 15, 12, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff2d1e';
    ctx.fillRect(22, 12, 5, 4);
    ctx.fillRect(33, 12, 5, 4);

    ctx.fillStyle = '#fff4d6';
    ctx.fillRect(23, 13, 2, 2);
    ctx.fillRect(34, 13, 2, 2);

    ctx.fillStyle = blood;
    ctx.fillRect(27, 19, 6, 6);
    ctx.fillRect(25, 23, 10, 2);

    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(10, 46, 4, 7);
    ctx.fillRect(46, 46, 4, 7);

    if (isHit) {
      ctx.fillStyle = '#ff3a2f';
      ctx.fillRect(40, 8, 5, 5);
      ctx.fillRect(43, 4, 3, 3);
      ctx.fillRect(18, 28, 4, 5);
      ctx.fillRect(14, 30, 3, 3);
    }

    ctx.strokeStyle = '#22170e';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 24, 36);
  });

const createWeaponSprite = (isFlash = false) =>
  createSpriteCanvas(108, 78, (ctx) => {
    const metal = '#5d6670';
    const metalLight = '#9aa3ad';
    const metalDark = '#151515';
    const hand = '#b28463';
    const handDark = '#704d37';

    ctx.fillStyle = handDark;
    ctx.fillRect(21, 46, 22, 26);
    ctx.fillRect(65, 46, 22, 26);

    ctx.fillStyle = hand;
    ctx.fillRect(24, 44, 18, 22);
    ctx.fillRect(67, 44, 18, 22);

    ctx.fillStyle = metalDark;
    ctx.fillRect(40, 30, 28, 40);
    ctx.fillRect(46, 20, 16, 14);
    ctx.fillRect(50, 9, 8, 12);

    ctx.fillStyle = metal;
    ctx.fillRect(42, 31, 10, 36);
    ctx.fillRect(56, 31, 10, 36);
    ctx.fillRect(48, 19, 12, 11);

    ctx.fillStyle = metalLight;
    ctx.fillRect(48, 25, 3, 34);
    ctx.fillRect(57, 25, 2, 34);
    ctx.fillRect(52, 11, 4, 9);

    ctx.fillStyle = '#2d211a';
    ctx.fillRect(45, 53, 18, 14);

    if (isFlash) {
      ctx.fillStyle = '#fff1a6';
      ctx.beginPath();
      ctx.moveTo(54, 0);
      ctx.lineTo(66, 13);
      ctx.lineTo(59, 18);
      ctx.lineTo(72, 24);
      ctx.lineTo(56, 28);
      ctx.lineTo(54, 42);
      ctx.lineTo(52, 28);
      ctx.lineTo(36, 24);
      ctx.lineTo(49, 18);
      ctx.lineTo(42, 13);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff8d1f';
      ctx.beginPath();
      ctx.moveTo(54, 6);
      ctx.lineTo(61, 15);
      ctx.lineTo(57, 19);
      ctx.lineTo(65, 23);
      ctx.lineTo(55, 25);
      ctx.lineTo(54, 34);
      ctx.lineTo(53, 25);
      ctx.lineTo(43, 23);
      ctx.lineTo(51, 19);
      ctx.lineTo(47, 15);
      ctx.closePath();
      ctx.fill();
    }
  });

const DoomApp = () => {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const rafRef = useRef(null);
  const [restartKey, setRestartKey] = useState(0);
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
      keysRef.current = {};
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
      const sx = SCREEN_CENTER_X + (rx / rz) * 172;
      const size = clamp(120 / rz, 30, 152);
      return { sx, size, depth: rz };
    };

    const tryShoot = (now) => {
      if (!game.running || now - game.lastShotAt < 145 || game.player.ammo <= 0) return;

      game.lastShotAt = now;
      game.player.weaponFlashUntil = now + 80;
      game.player.ammo = Math.max(0, game.player.ammo - 1);

      const target = game.enemies
        .filter((enemy) => enemy.alive)
        .map((enemy) => ({ enemy, projection: worldToScreen(enemy.x, enemy.y) }))
        .filter(({ projection }) => projection && Math.abs(projection.sx - SCREEN_CENTER_X) < 68)
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

      const moveSpeed = delta * 0.0022;
      const turnSpeed = delta * 0.0115;
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
          enemy.x += (dx / distance) * delta * 0.00048;
          enemy.y += (dy / distance) * delta * 0.00048;
        } else {
          game.player.hp = Math.max(0, game.player.hp - delta * 0.014);
          game.player.hurtAt = now;
        }
      });

      const aliveCount = game.enemies.filter((enemy) => enemy.alive).length;
      if (game.player.hp <= 0) {
        game.running = false;
        setStatus('Game over. Hit restart to try again.');
      } else if (aliveCount === 0) {
        game.running = false;
        setStatus('Room cleared. Hit restart to run it back.');
      }
    };

    const drawHudNumbers = () => {
      bctx.save();
      const ammoText = String(Math.round(game.player.ammo)).padStart(2, '0');
      const hpText = `${Math.round(game.player.hp)}%`;
      const armorText = `${Math.round(game.player.armor)}%`;

      drawHudText(bctx, ammoText, 14, 165, 3);
      drawHudText(bctx, hpText, 63, 165, 3);
      drawHudText(bctx, armorText, 201, 165, 3);
      bctx.restore();
    };

    const drawViewport = (now) => {
      const relativeViewAngle = normalizeAngle(game.player.angle + Math.PI / 2);
      const roomPan = clamp(relativeViewAngle * 18 + game.player.x * 6, -28, 28);

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
        const bob = Math.sin(now * 0.007 + enemy.bobSeed) * 2.2;
        const size = projection.size;
        const spriteImage = now - enemy.hitAt < 90 ? assets.enemyHit : assets.enemyAlive;
        const drawWidth = size * 0.9;
        const drawHeight = size * 1.14;
        const drawX = Math.round(projection.sx - drawWidth / 2);
        const drawY = Math.round(92 - drawHeight / 2 + bob + projection.depth * 3);

        bctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        bctx.beginPath();
        bctx.ellipse(projection.sx, drawY + drawHeight - 5, drawWidth * 0.34, drawHeight * 0.1, 0, 0, Math.PI * 2);
        bctx.fill();

        bctx.drawImage(spriteImage, drawX, drawY, drawWidth, drawHeight);
      });

      const gunBobX = Math.sin(now * 0.01) * 2.3;
      const gunBobY = Math.abs(Math.cos(now * 0.013)) * 2.3;
      const gunActive = now < game.player.weaponFlashUntil;
      const gunImage = gunActive ? assets.gunFlash : assets.gunIdle;
      const gunWidth = gunActive ? 124 : 112;
      const gunHeight = gunActive ? 90 : 78;

      bctx.drawImage(
        gunImage,
        Math.round(SCREEN_CENTER_X - gunWidth / 2 + gunBobX),
        Math.round(gunActive ? 88 + gunBobY : 94 + gunBobY),
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
        bctx.font = 'bold 18px Arial';
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
        gunIdle: createWeaponSprite(false),
        gunFlash: createWeaponSprite(true),
        enemyAlive: createImpSprite(false),
        enemyHit: createImpSprite(true)
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
  }, [restartKey]);

  return (
    <div className="mac-content-inner doom-app">
      <div className="doom-header">
        <img src="/doom-logo.png" alt="Doom logo" className="doom-logo-wide" />
        <p className="doom-note">Move with WASD or arrows. Shoot with Space. Restart anytime below.</p>
      </div>
      <canvas ref={canvasRef} className="doom-iframe" />
      <div className="doom-toolbar">
        <div className="doom-mobile-controls">
        <button
          type="button"
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
          type="button"
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
          type="button"
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
          type="button"
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
        <button type="button" className="retro-mac-btn doom-restart-btn" onClick={() => setRestartKey((value) => value + 1)}>
          Restart
        </button>
      </div>
      <p className="doom-status">{status}</p>
    </div>
  );
};

export default DoomApp;
