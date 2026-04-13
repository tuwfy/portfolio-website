import React, { useEffect, useRef, useState } from 'react';

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 200;
const VIEWPORT_HEIGHT = 154;
const HUD_Y = VIEWPORT_HEIGHT;
const SCREEN_CENTER_X = VIEW_WIDTH / 2;
const FOV = Math.PI / 3;
const MAX_VIEW_DISTANCE = 18;
const COLLISION_RADIUS = 0.18;
const PLAYER_SPAWN = { x: 1.5, y: 1.5, angle: 0 };
const MAP = [
  '111111111111',
  '100000000001',
  '100000000001',
  '100020000001',
  '100000000001',
  '100003300001',
  '100000000001',
  '100022000001',
  '100000000001',
  '100000000001',
  '100000000001',
  '111111111111'
];
const SPAWN_POINTS = [
  { x: 4.5, y: 2.5 },
  { x: 8.5, y: 2.5 },
  { x: 9.5, y: 5.5 },
  { x: 8.5, y: 8.5 },
  { x: 5.5, y: 9.5 },
  { x: 2.5, y: 8.5 },
  { x: 2.5, y: 5.5 },
  { x: 6.5, y: 6.5 }
];
const ASSET_RECTS = {
  hud: { src: '/doom-ref-room-3.png', x: 0, y: 430, w: 1024, h: 147 }
};

/** SFX in `public/` — volume kept low. */
const DOOM_SFX_VOLUME = 0.14;
const DOOM_AUDIO = {
  pistol: '/dspistol.wav',
  punch: '/dspunch.wav',
  playerDeath: '/ddeath.wav',
  monsterDeath: '/ddeathmonster.wav'
};

const MELEE_RANGE = 1.38;
const MELEE_SCREEN_HALF_WIDTH = 64;

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
    const skin = isHit ? '#d5a594' : '#b68b66';
    const skinDark = isHit ? '#92655d' : '#76533d';
    const skinLight = isHit ? '#f0d3c8' : '#d7b28a';
    const blood = isHit ? '#e81e1e' : '#8f0c0c';

    ctx.fillStyle = skinDark;
    ctx.fillRect(19, 55, 9, 18);
    ctx.fillRect(32, 55, 9, 18);
    ctx.fillRect(13, 35, 9, 22);
    ctx.fillRect(38, 35, 9, 22);

    ctx.fillStyle = skin;
    ctx.fillRect(18, 18, 24, 37);
    ctx.fillRect(15, 44, 12, 10);
    ctx.fillRect(33, 44, 12, 10);

    ctx.fillStyle = skinLight;
    ctx.fillRect(22, 22, 16, 10);
    ctx.fillRect(24, 33, 12, 15);

    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.moveTo(18, 18);
    ctx.lineTo(10, 8);
    ctx.lineTo(16, 5);
    ctx.lineTo(23, 16);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(42, 18);
    ctx.lineTo(50, 8);
    ctx.lineTo(44, 5);
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

    ctx.fillStyle = '#fff5da';
    ctx.fillRect(23, 13, 2, 2);
    ctx.fillRect(34, 13, 2, 2);

    ctx.fillStyle = blood;
    ctx.fillRect(27, 20, 6, 6);
    ctx.fillRect(25, 24, 10, 2);

    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(10, 47, 4, 7);
    ctx.fillRect(46, 47, 4, 7);

    if (isHit) {
      ctx.fillStyle = '#ff4033';
      ctx.fillRect(39, 8, 6, 6);
      ctx.fillRect(42, 4, 3, 3);
      ctx.fillRect(17, 28, 4, 5);
      ctx.fillRect(14, 30, 3, 3);
    }

    ctx.strokeStyle = '#22170e';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 24, 37);
  });

const createImpWalkSprite = (phase = 0) =>
  createSpriteCanvas(60, 78, (ctx) => {
    const legShift = phase === 0 ? -2 : 2;
    const armShift = phase === 0 ? 2 : -2;
    const skin = '#b68b66';
    const skinDark = '#76533d';
    const skinLight = '#d7b28a';

    ctx.fillStyle = skinDark;
    ctx.fillRect(18 + legShift, 55, 9, 18);
    ctx.fillRect(33 - legShift, 55, 9, 18);
    ctx.fillRect(12 + armShift, 35, 9, 22);
    ctx.fillRect(39 - armShift, 35, 9, 22);

    ctx.fillStyle = skin;
    ctx.fillRect(18, 18, 24, 37);
    ctx.fillRect(15 + armShift, 44, 12, 10);
    ctx.fillRect(33 - armShift, 44, 12, 10);

    ctx.fillStyle = skinLight;
    ctx.fillRect(22, 22, 16, 10);
    ctx.fillRect(24, 33, 12, 15);

    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.moveTo(18, 18);
    ctx.lineTo(10, 8);
    ctx.lineTo(16, 5);
    ctx.lineTo(23, 16);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(42, 18);
    ctx.lineTo(50, 8);
    ctx.lineTo(44, 5);
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

    ctx.fillStyle = '#fff5da';
    ctx.fillRect(23, 13, 2, 2);
    ctx.fillRect(34, 13, 2, 2);

    ctx.fillStyle = '#8f0c0c';
    ctx.fillRect(27, 20, 6, 6);
    ctx.fillRect(25, 24, 10, 2);

    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(10 + armShift, 47, 4, 7);
    ctx.fillRect(46 - armShift, 47, 4, 7);

    ctx.strokeStyle = '#22170e';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 24, 37);
  });

const createImpAttackSprite = () =>
  createSpriteCanvas(60, 78, (ctx) => {
    const skin = '#c59a72';
    const skinDark = '#795740';
    const skinLight = '#e2bf96';

    ctx.fillStyle = skinDark;
    ctx.fillRect(18, 55, 9, 18);
    ctx.fillRect(33, 55, 9, 18);
    ctx.fillRect(9, 30, 12, 28);
    ctx.fillRect(39, 30, 12, 28);

    ctx.fillStyle = skin;
    ctx.fillRect(18, 18, 24, 37);
    ctx.fillRect(12, 42, 14, 10);
    ctx.fillRect(34, 42, 14, 10);

    ctx.fillStyle = skinLight;
    ctx.fillRect(22, 22, 16, 10);
    ctx.fillRect(24, 33, 12, 15);
    ctx.fillRect(9, 37, 8, 7);
    ctx.fillRect(43, 37, 8, 7);

    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.moveTo(18, 18);
    ctx.lineTo(10, 8);
    ctx.lineTo(16, 5);
    ctx.lineTo(23, 16);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(42, 18);
    ctx.lineTo(50, 8);
    ctx.lineTo(44, 5);
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

    ctx.fillStyle = '#fff5da';
    ctx.fillRect(23, 13, 2, 2);
    ctx.fillRect(34, 13, 2, 2);

    ctx.fillStyle = '#8f0c0c';
    ctx.fillRect(27, 20, 6, 7);
    ctx.fillRect(25, 25, 10, 2);

    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(8, 35, 5, 8);
    ctx.fillRect(47, 35, 5, 8);

    ctx.strokeStyle = '#22170e';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 24, 37);
  });

const createFistSprite = (punching = false) =>
  createSpriteCanvas(108, 88, (ctx) => {
    const hand = '#b18361';
    const handDark = '#5c3d2e';
    const knuckle = '#8f6048';

    if (!punching) {
      ctx.fillStyle = handDark;
      ctx.fillRect(14, 58, 26, 24);
      ctx.fillRect(68, 58, 26, 24);
      ctx.fillStyle = hand;
      ctx.fillRect(16, 56, 22, 20);
      ctx.fillRect(70, 56, 22, 20);
      ctx.fillStyle = knuckle;
      ctx.fillRect(20, 62, 8, 6);
      ctx.fillRect(80, 62, 8, 6);
      return;
    }

    ctx.fillStyle = handDark;
    ctx.fillRect(36, 38, 40, 42);
    ctx.fillStyle = hand;
    ctx.fillRect(38, 34, 36, 38);
    ctx.fillStyle = knuckle;
    ctx.fillRect(42, 40, 28, 14);
    ctx.fillStyle = '#f0d0b8';
    ctx.fillRect(44, 52, 24, 8);
    ctx.strokeStyle = '#3a2418';
    ctx.lineWidth = 2;
    ctx.strokeRect(38, 34, 36, 38);
  });

const createWeaponSprite = (isFlash = false) =>
  createSpriteCanvas(108, 78, (ctx) => {
    const metal = '#5c6672';
    const metalLight = '#a3acb4';
    const metalDark = '#121212';
    const hand = '#b18361';
    const handDark = '#714e38';

    ctx.fillStyle = handDark;
    ctx.fillRect(21, 46, 22, 26);
    ctx.fillRect(65, 46, 22, 26);

    ctx.fillStyle = hand;
    ctx.fillRect(24, 44, 18, 22);
    ctx.fillRect(67, 44, 18, 22);

    ctx.fillStyle = metalDark;
    ctx.fillRect(40, 30, 28, 40);
    ctx.fillRect(46, 20, 16, 14);
    ctx.fillRect(50, 8, 8, 13);

    ctx.fillStyle = metal;
    ctx.fillRect(42, 31, 10, 36);
    ctx.fillRect(56, 31, 10, 36);
    ctx.fillRect(48, 19, 12, 12);

    ctx.fillStyle = metalLight;
    ctx.fillRect(48, 25, 3, 34);
    ctx.fillRect(57, 25, 2, 34);
    ctx.fillRect(52, 11, 4, 9);

    ctx.fillStyle = '#2d211a';
    ctx.fillRect(45, 54, 18, 14);

    if (isFlash) {
      ctx.fillStyle = '#fff2a9';
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

      ctx.fillStyle = '#ff8d20';
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

const createFloorTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    for (let y = 0; y < 64; y += 1) {
      for (let x = 0; x < 64; x += 1) {
        const tile = ((Math.floor(x / 16) + Math.floor(y / 16)) % 2) === 0;
        const noise = ((x * 17 + y * 11) % 19) / 19;
        const base = tile ? 88 : 76;
        const r = base + noise * 18;
        const g = base - 8 + noise * 14;
        const b = base - 18 + noise * 8;
        ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = 1;
    for (let step = 0; step <= 64; step += 16) {
      ctx.beginPath();
      ctx.moveTo(step + 0.5, 0);
      ctx.lineTo(step + 0.5, 64);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, step + 0.5);
      ctx.lineTo(64, step + 0.5);
      ctx.stroke();
    }
  });

const createCeilingTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#5f5543';
    ctx.fillRect(0, 0, 64, 64);

    for (let y = 0; y < 64; y += 1) {
      for (let x = 0; x < 64; x += 1) {
        const grain = ((x * 9 + y * 13) % 23) / 23;
        const shade = 92 + grain * 28;
        ctx.fillStyle = `rgb(${Math.round(shade)}, ${Math.round(shade - 10)}, ${Math.round(shade - 22)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    ctx.strokeStyle = 'rgba(24, 14, 8, 0.35)';
    ctx.lineWidth = 1;
    for (let row = 8; row < 64; row += 16) {
      ctx.beginPath();
      ctx.moveTo(0, row + 0.5);
      ctx.lineTo(64, row + 0.5);
      ctx.stroke();
    }
    for (let col = 8; col < 64; col += 16) {
      ctx.beginPath();
      ctx.moveTo(col + 0.5, 0);
      ctx.lineTo(col + 0.5, 64);
      ctx.stroke();
    }
  });

const isWall = (x, y) => {
  const cellX = Math.floor(x);
  const cellY = Math.floor(y);
  if (cellX < 0 || cellY < 0 || cellY >= MAP.length || cellX >= MAP[0].length) return true;
  return MAP[cellY][cellX] !== '0';
};

const tryMove = (entity, nextX, nextY, radius = COLLISION_RADIUS) => {
  let resolvedX = entity.x;
  let resolvedY = entity.y;
  const xClear =
    !isWall(nextX - radius, entity.y - radius) &&
    !isWall(nextX + radius, entity.y - radius) &&
    !isWall(nextX - radius, entity.y + radius) &&
    !isWall(nextX + radius, entity.y + radius);
  if (xClear) resolvedX = nextX;

  const yClear =
    !isWall(resolvedX - radius, nextY - radius) &&
    !isWall(resolvedX + radius, nextY - radius) &&
    !isWall(resolvedX - radius, nextY + radius) &&
    !isWall(resolvedX + radius, nextY + radius);
  if (yClear) resolvedY = nextY;

  return { x: resolvedX, y: resolvedY };
};

const castRay = (originX, originY, angle) => {
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);
  let mapX = Math.floor(originX);
  let mapY = Math.floor(originY);

  const deltaDistX = dirX === 0 ? 1e30 : Math.abs(1 / dirX);
  const deltaDistY = dirY === 0 ? 1e30 : Math.abs(1 / dirY);

  let stepX = 0;
  let stepY = 0;
  let sideDistX = 0;
  let sideDistY = 0;

  if (dirX < 0) {
    stepX = -1;
    sideDistX = (originX - mapX) * deltaDistX;
  } else {
    stepX = 1;
    sideDistX = (mapX + 1 - originX) * deltaDistX;
  }

  if (dirY < 0) {
    stepY = -1;
    sideDistY = (originY - mapY) * deltaDistY;
  } else {
    stepY = 1;
    sideDistY = (mapY + 1 - originY) * deltaDistY;
  }

  let side = 0;
  let cell = '1';

  while (true) {
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      mapX += stepX;
      side = 0;
    } else {
      sideDistY += deltaDistY;
      mapY += stepY;
      side = 1;
    }

    if (mapX < 0 || mapY < 0 || mapY >= MAP.length || mapX >= MAP[0].length) break;
    cell = MAP[mapY][mapX];
    if (cell !== '0') break;
  }

  let distance;
  if (side === 0) {
    distance = (mapX - originX + (1 - stepX) / 2) / (dirX || 1e-6);
  } else {
    distance = (mapY - originY + (1 - stepY) / 2) / (dirY || 1e-6);
  }

  distance = Math.max(0.01, Math.min(MAX_VIEW_DISTANCE, Math.abs(distance)));
  const impact = side === 0 ? originY + distance * dirY : originX + distance * dirX;
  const textureU = impact - Math.floor(impact);

  return { distance, side, cell, textureU };
};

const DoomApp = () => {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const gameRef = useRef(null);
  const rafRef = useRef(null);
  const [restartKey, setRestartKey] = useState(0);
  const [status, setStatus] = useState('Loading round 1.');

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
    const zBuffer = new Array(VIEW_WIDTH).fill(MAX_VIEW_DISTANCE);

    const playSfx = (key) => {
      const url = DOOM_AUDIO[key];
      if (!url) return;
      const audio = new Audio(url);
      audio.volume = DOOM_SFX_VOLUME;
      audio.play().catch(() => {});
    };

    const game = {
      player: {
        x: PLAYER_SPAWN.x,
        y: PLAYER_SPAWN.y,
        angle: PLAYER_SPAWN.angle,
        hp: 100,
        armor: 0,
        ammo: 50,
        hurtAt: -999,
        weaponFlashUntil: 0,
        weapon: 'pistol'
      },
      enemies: [],
      round: 1,
      lastShotAt: 0,
      lastPunchAt: 0,
      lastFrameAt: 0,
      nextRoundAt: 0,
      running: true,
      deathSoundPlayed: false
    };

    gameRef.current = game;

    const spawnRound = (roundNumber, resetPlayer = false) => {
      const enemyCount = Math.min(SPAWN_POINTS.length, 2 + roundNumber);
      const enemyHp = 2 + Math.floor((roundNumber - 1) / 2);
      const shotsNeeded = enemyCount * enemyHp;
      const spareMag = 18 + roundNumber * 4;
      const ammoGrant = Math.ceil(shotsNeeded * 1.5) + spareMag;
      let ammoStatus = '';

      if (resetPlayer) {
        game.player = {
          x: PLAYER_SPAWN.x,
          y: PLAYER_SPAWN.y,
          angle: PLAYER_SPAWN.angle,
          hp: 100,
          armor: 0,
          ammo: ammoGrant,
          hurtAt: -999,
          weaponFlashUntil: 0,
          weapon: 'pistol'
        };
        ammoStatus = `Ammo ~${ammoGrant}.`;
      } else {
        const refill = Math.ceil(shotsNeeded * 0.55) + 16 + roundNumber * 3;
        game.player.ammo += refill;
        game.player.armor = clamp(game.player.armor + 5, 0, 200);
        ammoStatus = `+${refill} ammo.`;
      }
      game.deathSoundPlayed = false;
      const enemySpeed = 0.00042 + roundNumber * 0.00008;
      const spawnOffset = ((roundNumber - 1) * 2) % SPAWN_POINTS.length;

      game.enemies = Array.from({ length: enemyCount }, (_, index) => {
        const spawn = SPAWN_POINTS[(spawnOffset + index) % SPAWN_POINTS.length];
        return {
          x: spawn.x,
          y: spawn.y,
          hp: enemyHp,
          speed: enemySpeed,
          alive: true,
          hitAt: -999,
          bobSeed: 0.4 + index * 0.72
        };
      });

      game.round = roundNumber;
      game.lastShotAt = 0;
      game.lastFrameAt = 0;
      game.nextRoundAt = 0;
      game.running = true;
      keysRef.current = {};
      setStatus(
        `Round ${roundNumber}. ${enemyCount} monsters. ${ammoStatus} Keys 1/2 pistol or fist (Space). Fist = unlimited.`
      );
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      frameWidth = canvas.clientWidth;
      frameHeight = canvas.clientHeight;
      canvas.width = Math.round(frameWidth * dpr);
      canvas.height = Math.round(frameHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };

    const worldToCamera = (wx, wy) => {
      const dx = wx - game.player.x;
      const dy = wy - game.player.y;
      const dirX = Math.cos(game.player.angle);
      const dirY = Math.sin(game.player.angle);
      const side = dx * -dirY + dy * dirX;
      const depth = dx * dirX + dy * dirY;
      if (depth <= 0.08) return null;

      const projectionScale = SCREEN_CENTER_X / Math.tan(FOV / 2);
      const screenX = SCREEN_CENTER_X + (side / depth) * projectionScale;
      const size = clamp(112 / depth, 18, 160);
      return { screenX, depth, size };
    };

    const hasLineOfSight = (targetX, targetY) => {
      const dx = targetX - game.player.x;
      const dy = targetY - game.player.y;
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const hit = castRay(game.player.x, game.player.y, angle);
      return hit.distance >= distance - 0.18;
    };

    const applyDamage = (amount, now) => {
      const armorAbsorb = Math.min(game.player.armor, amount * 0.45);
      game.player.armor = Math.max(0, game.player.armor - armorAbsorb);
      game.player.hp = Math.max(0, game.player.hp - (amount - armorAbsorb));
      game.player.hurtAt = now;
    };

    const pickCenterTarget = (maxWorldDistance = Infinity) =>
      game.enemies
        .filter((enemy) => enemy.alive && hasLineOfSight(enemy.x, enemy.y))
        .map((enemy) => ({
          enemy,
          dist: Math.hypot(enemy.x - game.player.x, enemy.y - game.player.y),
          projection: worldToCamera(enemy.x, enemy.y)
        }))
        .filter(
          ({ dist, projection }) =>
            projection &&
            dist <= maxWorldDistance &&
            Math.abs(projection.screenX - SCREEN_CENTER_X) < MELEE_SCREEN_HALF_WIDTH
        )
        .sort((a, b) => a.projection.depth - b.projection.depth)[0];

    const tryShoot = (now) => {
      if (!game.running || game.player.weapon !== 'pistol') return;
      if (now - game.lastShotAt < 180 || game.player.ammo <= 0) return;

      game.lastShotAt = now;
      game.player.weaponFlashUntil = now + 90;
      game.player.ammo = Math.max(0, game.player.ammo - 1);
      playSfx('pistol');

      const target = pickCenterTarget(Infinity);
      if (!target) return;

      target.enemy.hp -= 1;
      target.enemy.hitAt = now;
      if (target.enemy.hp <= 0) {
        target.enemy.alive = false;
        playSfx('monsterDeath');
      }
    };

    const tryPunch = (now) => {
      if (!game.running || game.player.weapon !== 'fist') return;
      if (now - game.lastPunchAt < 210) return;

      game.lastPunchAt = now;
      game.player.weaponFlashUntil = now + 110;

      const target = pickCenterTarget(MELEE_RANGE);
      if (!target) return;

      target.enemy.hp -= 2;
      target.enemy.hitAt = now;
      playSfx('punch');
      if (target.enemy.hp <= 0) {
        target.enemy.alive = false;
        playSfx('monsterDeath');
      }
    };

    const update = (now) => {
      const delta = game.lastFrameAt ? Math.min(40, now - game.lastFrameAt) : 16;
      game.lastFrameAt = now;

      if (!game.running) return;

      if (game.nextRoundAt && now >= game.nextRoundAt) {
        spawnRound(game.round + 1, false);
      }

      const moveSpeed = delta * 0.002;
      const turnSpeed = delta * 0.0046;
      const dirX = Math.cos(game.player.angle);
      const dirY = Math.sin(game.player.angle);

      if (keysRef.current.a || keysRef.current.arrowleft) game.player.angle -= turnSpeed;
      if (keysRef.current.d || keysRef.current.arrowright) game.player.angle += turnSpeed;

      if (keysRef.current.w || keysRef.current.arrowup) {
        const moved = tryMove(game.player, game.player.x + dirX * moveSpeed, game.player.y + dirY * moveSpeed);
        game.player.x = moved.x;
        game.player.y = moved.y;
      }

      if (keysRef.current.s || keysRef.current.arrowdown) {
        const moved = tryMove(game.player, game.player.x - dirX * moveSpeed, game.player.y - dirY * moveSpeed);
        game.player.x = moved.x;
        game.player.y = moved.y;
      }

      if (keysRef.current[' ']) {
        if (game.player.weapon === 'pistol') tryShoot(now);
        else tryPunch(now);
      }

      game.enemies.forEach((enemy) => {
        if (!enemy.alive) return;
        const dx = game.player.x - enemy.x;
        const dy = game.player.y - enemy.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 0.8) {
          const next = tryMove(
            enemy,
            enemy.x + (dx / distance) * delta * enemy.speed,
            enemy.y + (dy / distance) * delta * enemy.speed,
            0.16
          );
          enemy.x = next.x;
          enemy.y = next.y;
        } else if (now - enemy.hitAt > 180) {
          applyDamage(delta * (0.009 + game.round * 0.0006), now);
        }
      });

      const aliveCount = game.enemies.filter((enemy) => enemy.alive).length;
      if (game.player.hp <= 0) {
        if (!game.deathSoundPlayed) {
          game.deathSoundPlayed = true;
          playSfx('playerDeath');
        }
        game.running = false;
        setStatus(`Game over on round ${game.round}. Hit restart to try again.`);
      } else if (aliveCount === 0 && !game.nextRoundAt) {
        game.nextRoundAt = now + 1200;
        setStatus(`Round ${game.round} cleared. Round ${game.round + 1} incoming...`);
      }
    };

    const drawHudNumbers = () => {
      bctx.save();
      drawHudText(bctx, String(Math.round(game.player.ammo)).padStart(2, '0'), 14, 165, 3);
      drawHudText(bctx, `${Math.round(game.player.hp)}%`, 63, 165, 3);
      drawHudText(bctx, `${Math.round(game.player.armor)}%`, 201, 165, 3);
      bctx.restore();
    };

    const drawPlane = (texture, isFloor) => {
      const textureCtx = texture.getContext('2d');
      const dirX = Math.cos(game.player.angle);
      const dirY = Math.sin(game.player.angle);
      const planeX = -dirY * Math.tan(FOV / 2);
      const planeY = dirX * Math.tan(FOV / 2);

      const rowStart = isFloor ? Math.floor(VIEWPORT_HEIGHT / 2) : 0;
      const rowEnd = isFloor ? VIEWPORT_HEIGHT : Math.floor(VIEWPORT_HEIGHT / 2);

      for (let y = rowStart; y < rowEnd; y += 1) {
        const p = isFloor ? y - VIEWPORT_HEIGHT / 2 : VIEWPORT_HEIGHT / 2 - y;
        if (p === 0) continue;

        const rowDistance = (VIEWPORT_HEIGHT * 0.5) / p;
        const leftRayX = dirX - planeX;
        const leftRayY = dirY - planeY;
        const rightRayX = dirX + planeX;
        const rightRayY = dirY + planeY;

        const stepX = (rowDistance * (rightRayX - leftRayX)) / VIEW_WIDTH;
        const stepY = (rowDistance * (rightRayY - leftRayY)) / VIEW_WIDTH;

        let worldX = game.player.x + rowDistance * leftRayX;
        let worldY = game.player.y + rowDistance * leftRayY;

        for (let x = 0; x < VIEW_WIDTH; x += 1) {
          const tx = ((Math.floor(worldX * 8) % 64) + 64) % 64;
          const ty = ((Math.floor(worldY * 8) % 64) + 64) % 64;
          const sample = textureCtx.getImageData(tx, ty, 1, 1).data;
          const shade = clamp(1 - rowDistance / MAX_VIEW_DISTANCE, isFloor ? 0.18 : 0.22, 1);
          const pixelY = isFloor ? y : VIEWPORT_HEIGHT - y - 1;

          bctx.fillStyle = `rgb(${Math.round(sample[0] * shade)}, ${Math.round(sample[1] * shade)}, ${Math.round(sample[2] * shade)})`;
          bctx.fillRect(x, pixelY, 1, 1);

          worldX += stepX;
          worldY += stepY;
        }
      }
    };

    const wallColorFor = (cell, distance, side, textureU) => {
      const palette = {
        '1': [102, 104, 111],
        '2': [118, 96, 86],
        '3': [86, 100, 126]
      };

      const [r, g, b] = palette[cell] || palette['1'];
      const depthShade = clamp(1 - distance / MAX_VIEW_DISTANCE, 0.18, 1);
      const sideShade = side === 1 ? 0.72 : 1;
      const textureShade = 0.82 + textureU * 0.18;
      const shade = depthShade * sideShade * textureShade;

      return `rgb(${Math.round(r * shade)}, ${Math.round(g * shade)}, ${Math.round(b * shade)})`;
    };

    const wallDetailColorFor = (cell, distance, side, textureU, yRatio) => {
      const depthShade = clamp(1 - distance / MAX_VIEW_DISTANCE, 0.18, 1);
      const sideShade = side === 1 ? 0.72 : 1;
      const pattern =
        cell === '1'
          ? (Math.floor(textureU * 8) % 2 === 0 ? 1.1 : 0.85) * (Math.floor(yRatio * 7) % 2 === 0 ? 1.04 : 0.92)
          : cell === '2'
            ? (Math.floor(textureU * 6) % 3 === 0 ? 1.16 : 0.88)
            : (Math.floor(textureU * 10) % 4 === 0 ? 1.18 : 0.9);

      const palette = {
        '1': [140, 144, 150],
        '2': [144, 120, 102],
        '3': [105, 124, 154]
      };

      const [r, g, b] = palette[cell] || palette['1'];
      const shade = depthShade * sideShade * pattern;
      return `rgb(${Math.round(r * shade)}, ${Math.round(g * shade)}, ${Math.round(b * shade)})`;
    };

    const drawViewport = (now) => {
      bctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
      drawPlane(assets.ceiling, false);
      drawPlane(assets.floor, true);

      for (let x = 0; x < VIEW_WIDTH; x += 1) {
        const rayAngle = game.player.angle + ((x / VIEW_WIDTH) - 0.5) * FOV;
        const hit = castRay(game.player.x, game.player.y, rayAngle);
        const perpendicularDistance = hit.distance * Math.cos(rayAngle - game.player.angle);
        zBuffer[x] = perpendicularDistance;

        const wallHeight = clamp(Math.floor(VIEWPORT_HEIGHT / perpendicularDistance), 8, VIEWPORT_HEIGHT * 1.6);
        const wallTop = Math.floor((VIEWPORT_HEIGHT - wallHeight) / 2);

        bctx.fillStyle = wallColorFor(hit.cell, perpendicularDistance, hit.side, hit.textureU);
        bctx.fillRect(x, wallTop, 1, wallHeight);

        for (let y = 0; y < wallHeight; y += 2) {
          const yRatio = y / Math.max(1, wallHeight);
          bctx.fillStyle = wallDetailColorFor(hit.cell, perpendicularDistance, hit.side, hit.textureU, yRatio);
          bctx.fillRect(x, wallTop + y, 1, Math.min(2, wallHeight - y));
        }
      }

      const enemies = game.enemies
        .filter((enemy) => enemy.alive)
        .map((enemy) => ({ enemy, projection: worldToCamera(enemy.x, enemy.y) }))
        .filter(({ projection }) => projection)
        .sort((a, b) => b.projection.depth - a.projection.depth);

      enemies.forEach(({ enemy, projection }) => {
        const bob = Math.sin(now * 0.007 + enemy.bobSeed) * 2.2;
        const attackFrame = Math.sin(now * 0.018 + enemy.bobSeed) > 0.45;
        const spriteImage =
          now - enemy.hitAt < 100
            ? assets.enemyHit
            : projection.depth < 1.55 || attackFrame
              ? assets.enemyAttack
              : Math.sin(now * 0.012 + enemy.bobSeed) > 0
                ? assets.enemyWalkA
                : assets.enemyWalkB;
        const drawWidth = projection.size * 0.9;
        const drawHeight = projection.size * 1.14;
        const drawX = Math.round(projection.screenX - drawWidth / 2);
        const drawY = Math.round(92 - drawHeight / 2 + bob);
        const centerColumn = clamp(Math.round(projection.screenX), 0, VIEW_WIDTH - 1);

        if (projection.depth > zBuffer[centerColumn] + 0.1) return;

        bctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        bctx.beginPath();
        bctx.ellipse(projection.screenX, drawY + drawHeight - 5, drawWidth * 0.34, drawHeight * 0.1, 0, 0, Math.PI * 2);
        bctx.fill();

        bctx.drawImage(spriteImage, drawX, drawY, drawWidth, drawHeight);
      });

      const gunBobX = (keysRef.current.w || keysRef.current.s || keysRef.current.arrowup || keysRef.current.arrowdown) ? Math.sin(now * 0.012) * 3 : 0;
      const gunBobY = (keysRef.current.w || keysRef.current.s || keysRef.current.arrowup || keysRef.current.arrowdown) ? Math.abs(Math.cos(now * 0.015)) * 3 : 0;
      const actionActive = now < game.player.weaponFlashUntil;

      if (game.player.weapon === 'pistol') {
        const gunImage = actionActive ? assets.gunFlash : assets.gunIdle;
        const gunWidth = actionActive ? 124 : 112;
        const gunHeight = actionActive ? 90 : 78;
        bctx.drawImage(
          gunImage,
          Math.round(SCREEN_CENTER_X - gunWidth / 2 + gunBobX),
          Math.round(actionActive ? 88 + gunBobY : 94 + gunBobY),
          gunWidth,
          gunHeight
        );
      } else {
        const fistImage = actionActive ? assets.fistPunch : assets.fistIdle;
        const fw = actionActive ? 118 : 108;
        const fh = actionActive ? 96 : 88;
        bctx.drawImage(
          fistImage,
          Math.round(SCREEN_CENTER_X - fw / 2 + gunBobX * 1.2),
          Math.round(actionActive ? 84 + gunBobY : 90 + gunBobY),
          fw,
          fh
        );
      }

      drawSprite(bctx, assets.hud, ASSET_RECTS.hud, 0, HUD_Y, VIEW_WIDTH, VIEW_HEIGHT - HUD_Y);
      drawHudNumbers();

      bctx.save();
      bctx.font = 'bold 10px Monaco, Menlo, monospace';
      bctx.fillStyle = 'rgba(0,0,0,0.55)';
      bctx.fillText(game.player.weapon === 'fist' ? 'WEAPON 2 — FIST' : 'WEAPON 1 — PISTOL', 7, 12);
      bctx.fillStyle = '#e8dcc8';
      bctx.fillText(game.player.weapon === 'fist' ? 'WEAPON 2 — FIST' : 'WEAPON 1 — PISTOL', 6, 11);
      bctx.restore();

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
        bctx.fillText('GAME OVER', SCREEN_CENTER_X, 58);
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
      if (key === '1' && isPressed && gameRef.current) {
        gameRef.current.player.weapon = 'pistol';
        event.preventDefault();
        return;
      }
      if (key === '2' && isPressed && gameRef.current) {
        gameRef.current.player.weapon = 'fist';
        event.preventDefault();
        return;
      }
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault();
      }
      keysRef.current[key] = isPressed;
    };

    const handleKeyDown = (event) => setKey(event, true);
    const handleKeyUp = (event) => setKey(event, false);

    const boot = async () => {
      const hud = await loadImage(ASSET_RECTS.hud.src);
      if (disposed) return;

      assets = {
        hud,
        gunIdle: createWeaponSprite(false),
        gunFlash: createWeaponSprite(true),
        fistIdle: createFistSprite(false),
        fistPunch: createFistSprite(true),
        enemyAlive: createImpSprite(false),
        enemyHit: createImpSprite(true),
        enemyWalkA: createImpWalkSprite(0),
        enemyWalkB: createImpWalkSprite(1),
        enemyAttack: createImpAttackSprite(),
        floor: createFloorTexture(),
        ceiling: createCeilingTexture()
      };

      resizeCanvas();
      spawnRound(1, true);
      window.addEventListener('keydown', handleKeyDown, { passive: false });
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('resize', resizeCanvas);
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
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [restartKey]);

  const bindControl = (key) => ({
    onPointerDown: (event) => {
      event.preventDefault();
      keysRef.current[key] = true;
    },
    onPointerUp: (event) => {
      event.preventDefault();
      keysRef.current[key] = false;
    },
    onPointerCancel: () => {
      keysRef.current[key] = false;
    },
    onPointerLeave: () => {
      keysRef.current[key] = false;
    },
    onContextMenu: (event) => {
      event.preventDefault();
    }
  });

  return (
    <div className="mac-content-inner doom-app">
      <div className="doom-header">
        <img src="/doom-logo.png" alt="Doom logo" className="doom-logo-wide" />
        <p className="doom-note">
          W/S move, A/D turn. <strong>1</strong> pistol, <strong>2</strong> fist (Space shoots or punches in range). Extra ammo each round; fist never runs out.
          SFX: <code>dspistol.wav</code>, <code>dspunch.wav</code>, <code>ddeath.wav</code>, <code>ddeathmonster.wav</code> in <code>public/</code>.
        </p>
      </div>
      <canvas ref={canvasRef} className="doom-iframe" />
      <div className="doom-toolbar">
        <div className="doom-mobile-controls">
          <button
            type="button"
            className="retro-mac-btn"
            {...bindControl('w')}
          >
            Forward
          </button>
          <button
            type="button"
            className="retro-mac-btn"
            {...bindControl('a')}
          >
            Turn L
          </button>
          <button
            type="button"
            className="retro-mac-btn"
            {...bindControl(' ')}
          >
            Fire
          </button>
          <button
            type="button"
            className="retro-mac-btn"
            onClick={() => {
              if (gameRef.current) gameRef.current.player.weapon = 'pistol';
            }}
          >
            1 Gun
          </button>
          <button
            type="button"
            className="retro-mac-btn"
            onClick={() => {
              if (gameRef.current) gameRef.current.player.weapon = 'fist';
            }}
          >
            2 Fist
          </button>
          <button
            type="button"
            className="retro-mac-btn"
            {...bindControl('d')}
          >
            Turn R
          </button>
          <button
            type="button"
            className="retro-mac-btn"
            {...bindControl('s')}
          >
            Back
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
