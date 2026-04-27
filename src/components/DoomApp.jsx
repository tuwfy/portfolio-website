import React, { startTransition, useEffect, useRef, useState } from 'react';

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 200;
const VIEWPORT_HEIGHT = 154;
const HUD_Y = VIEWPORT_HEIGHT;
const SCREEN_CENTER_X = VIEW_WIDTH / 2;
const FOV = Math.PI / 3;
const MAX_VIEW_DISTANCE = 22;
const FIXED_TIMESTEP = 1000 / 60;
const PLAYER_RADIUS = 0.18;
const ENEMY_RADIUS = 0.2;
const PROJECTILE_RADIUS = 0.14;
const MELEE_RANGE = 1.28;
const AIM_HALF_WIDTH = 58;
const TWO_PI = Math.PI * 2;
const PLAYER_WALK_SPEED = 0.00425;
const PLAYER_RUN_MULTIPLIER = 1.42;
const PLAYER_BACKPEDAL_MULTIPLIER = 0.78;
const PLAYER_ACCEL_BLEND = 0.36;
const PLAYER_DECEL_BLEND = 0.24;
const PLAYER_STOP_FRICTION = 0.58;
const KEYBOARD_TURN_SPEED = 0.00445;
const POINTER_LOOK_SPEED = 0.0085;
const PLAYER_SPAWN = { x: 7.5, y: 5.5, angle: 1.45 };
const MAP = [
  '1111111111111111',
  '1000000000000001',
  '1044440000222201',
  '1000010000000001',
  '1000010001100001',
  '1030000001100001',
  '1030000000000001',
  '1000005500000001',
  '1000005500000001',
  '1000010000003301',
  '1000010001100001',
  '1000000001100001',
  '1022200000444401',
  '1000000000000001',
  '1000000000000001',
  '1111111111111111'
];
const SPAWN_POINTS = [
  { x: 11.5, y: 1.5 },
  { x: 13.5, y: 3.5 },
  { x: 13.5, y: 8.5 },
  { x: 11.5, y: 10.5 },
  { x: 8.5, y: 11.5 },
  { x: 6.5, y: 12.5 },
  { x: 3.5, y: 6.5 },
  { x: 8.5, y: 8.5 }
];
const ASSET_RECTS = {
  hud: { src: '/doom-ref-room-3.png', x: 0, y: 430, w: 1024, h: 147 }
};

const DOOM_SFX_VOLUME = 0.14;
const DOOM_AUDIO = {
  pistol: '/dspistol.wav',
  punch: '/dspunch.wav',
  playerDeath: '/ddeath.wav',
  monsterDeath: '/ddeathmonster.wav'
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
const lerp = (from, to, amount) => from + (to - from) * amount;
const pointInRect = (x, y, left, top, right, bottom) => x >= left && x < right && y >= top && y < bottom;
const normalizeAngle = (angle) => ((angle % TWO_PI) + TWO_PI) % TWO_PI;

const getRoundTuning = (roundNumber) => {
  const ramp = Math.max(0, roundNumber - 1);

  return {
    enemyCount: Math.min(SPAWN_POINTS.length, 2 + Math.floor(ramp * 0.75)),
    enemyHp: 1 + Math.floor(Math.max(0, roundNumber - 3) / 2),
    enemySpeed: 0.00082 + Math.min(0.00105, ramp * 0.00011),
    projectileSpeed: 0.0037 + Math.min(0.00155, ramp * 0.00014),
    projectileDamage: 8 + ramp * 1.15,
    meleeDamage: 6 + ramp * 1.05,
    attackRange: 6.2 + Math.min(2.4, ramp * 0.28),
    attackWindup: Math.max(360, 720 - ramp * 42),
    attackDuration: Math.max(560, 920 - ramp * 34),
    attackCooldown: Math.max(760, 1900 - ramp * 92),
    initialCooldown: Math.max(420, 1150 - ramp * 80),
    ammoPadding: 20 + roundNumber * 4
  };
};

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
    const skin = isHit ? '#d9a998' : '#b88c62';
    const skinDark = isHit ? '#8f6259' : '#72513a';
    const skinLight = isHit ? '#f0d3c4' : '#d8b287';
    const blood = isHit ? '#ef3021' : '#8f1012';

    ctx.fillStyle = skinDark;
    ctx.fillRect(18, 56, 10, 18);
    ctx.fillRect(32, 56, 10, 18);
    ctx.fillRect(12, 35, 10, 22);
    ctx.fillRect(38, 35, 10, 22);

    ctx.fillStyle = skin;
    ctx.fillRect(18, 18, 24, 38);
    ctx.fillRect(15, 44, 12, 10);
    ctx.fillRect(33, 44, 12, 10);

    ctx.fillStyle = skinLight;
    ctx.fillRect(22, 22, 16, 10);
    ctx.fillRect(24, 33, 12, 15);

    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.moveTo(18, 18);
    ctx.lineTo(11, 7);
    ctx.lineTo(17, 4);
    ctx.lineTo(23, 16);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(42, 18);
    ctx.lineTo(49, 7);
    ctx.lineTo(43, 4);
    ctx.lineTo(37, 16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(30, 15, 12, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff2716';
    ctx.fillRect(22, 12, 5, 4);
    ctx.fillRect(33, 12, 5, 4);

    ctx.fillStyle = '#fff4de';
    ctx.fillRect(23, 13, 2, 2);
    ctx.fillRect(34, 13, 2, 2);

    ctx.fillStyle = blood;
    ctx.fillRect(26, 20, 8, 6);
    ctx.fillRect(25, 24, 10, 3);

    ctx.fillStyle = '#efe9df';
    ctx.fillRect(10, 47, 4, 8);
    ctx.fillRect(46, 47, 4, 8);

    if (isHit) {
      ctx.fillStyle = '#ff3d2e';
      ctx.fillRect(38, 7, 7, 6);
      ctx.fillRect(16, 28, 5, 6);
    }

    ctx.strokeStyle = '#22170e';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 24, 38);
  });

const createImpWalkSprite = (phase = 0) =>
  createSpriteCanvas(60, 78, (ctx) => {
    const legShift = phase === 0 ? -2 : 2;
    const armShift = phase === 0 ? 2 : -2;
    const skin = '#b88c62';
    const skinDark = '#72513a';
    const skinLight = '#d8b287';

    ctx.fillStyle = skinDark;
    ctx.fillRect(18 + legShift, 56, 10, 18);
    ctx.fillRect(32 - legShift, 56, 10, 18);
    ctx.fillRect(12 + armShift, 35, 10, 22);
    ctx.fillRect(38 - armShift, 35, 10, 22);

    ctx.fillStyle = skin;
    ctx.fillRect(18, 18, 24, 38);
    ctx.fillRect(15 + armShift, 44, 12, 10);
    ctx.fillRect(33 - armShift, 44, 12, 10);

    ctx.fillStyle = skinLight;
    ctx.fillRect(22, 22, 16, 10);
    ctx.fillRect(24, 33, 12, 15);

    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.moveTo(18, 18);
    ctx.lineTo(11, 7);
    ctx.lineTo(17, 4);
    ctx.lineTo(23, 16);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(42, 18);
    ctx.lineTo(49, 7);
    ctx.lineTo(43, 4);
    ctx.lineTo(37, 16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(30, 15, 12, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff2716';
    ctx.fillRect(22, 12, 5, 4);
    ctx.fillRect(33, 12, 5, 4);

    ctx.fillStyle = '#fff4de';
    ctx.fillRect(23, 13, 2, 2);
    ctx.fillRect(34, 13, 2, 2);

    ctx.fillStyle = '#8f1012';
    ctx.fillRect(26, 20, 8, 6);
    ctx.fillRect(25, 24, 10, 3);

    ctx.fillStyle = '#efe9df';
    ctx.fillRect(10 + armShift, 47, 4, 8);
    ctx.fillRect(46 - armShift, 47, 4, 8);

    ctx.strokeStyle = '#22170e';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 24, 38);
  });

const createImpAttackSprite = () =>
  createSpriteCanvas(60, 78, (ctx) => {
    const skin = '#c6986d';
    const skinDark = '#7d5940';
    const skinLight = '#e2be91';

    ctx.fillStyle = skinDark;
    ctx.fillRect(18, 56, 10, 18);
    ctx.fillRect(32, 56, 10, 18);
    ctx.fillRect(9, 31, 12, 28);
    ctx.fillRect(39, 31, 12, 28);

    ctx.fillStyle = skin;
    ctx.fillRect(18, 18, 24, 38);
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
    ctx.lineTo(11, 7);
    ctx.lineTo(17, 4);
    ctx.lineTo(23, 16);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(42, 18);
    ctx.lineTo(49, 7);
    ctx.lineTo(43, 4);
    ctx.lineTo(37, 16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(30, 15, 12, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff2716';
    ctx.fillRect(22, 12, 5, 4);
    ctx.fillRect(33, 12, 5, 4);

    ctx.fillStyle = '#fff4de';
    ctx.fillRect(23, 13, 2, 2);
    ctx.fillRect(34, 13, 2, 2);

    ctx.fillStyle = '#8f1012';
    ctx.fillRect(26, 20, 8, 7);
    ctx.fillRect(25, 25, 10, 2);

    ctx.fillStyle = '#efe9df';
    ctx.fillRect(8, 35, 5, 8);
    ctx.fillRect(47, 35, 5, 8);

    ctx.strokeStyle = '#22170e';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 24, 38);
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
  createSpriteCanvas(112, 84, (ctx) => {
    const metal = '#5b636f';
    const metalLight = '#a6adb4';
    const metalDark = '#101114';
    const hand = '#b18361';
    const handDark = '#714e38';

    ctx.fillStyle = handDark;
    ctx.fillRect(21, 48, 22, 26);
    ctx.fillRect(69, 48, 22, 26);

    ctx.fillStyle = hand;
    ctx.fillRect(24, 46, 18, 22);
    ctx.fillRect(72, 46, 18, 22);

    ctx.fillStyle = metalDark;
    ctx.fillRect(42, 30, 28, 42);
    ctx.fillRect(48, 19, 16, 14);
    ctx.fillRect(52, 6, 8, 15);

    ctx.fillStyle = metal;
    ctx.fillRect(44, 31, 10, 38);
    ctx.fillRect(58, 31, 10, 38);
    ctx.fillRect(50, 19, 12, 12);

    ctx.fillStyle = metalLight;
    ctx.fillRect(49, 25, 3, 36);
    ctx.fillRect(59, 24, 2, 36);
    ctx.fillRect(54, 9, 4, 10);

    ctx.fillStyle = '#2d211a';
    ctx.fillRect(46, 56, 20, 14);

    if (isFlash) {
      ctx.fillStyle = '#fff2ae';
      ctx.beginPath();
      ctx.moveTo(56, 0);
      ctx.lineTo(69, 14);
      ctx.lineTo(61, 20);
      ctx.lineTo(74, 26);
      ctx.lineTo(58, 30);
      ctx.lineTo(56, 44);
      ctx.lineTo(54, 30);
      ctx.lineTo(38, 26);
      ctx.lineTo(51, 20);
      ctx.lineTo(43, 14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff8b1f';
      ctx.beginPath();
      ctx.moveTo(56, 6);
      ctx.lineTo(63, 16);
      ctx.lineTo(59, 20);
      ctx.lineTo(67, 24);
      ctx.lineTo(57, 27);
      ctx.lineTo(56, 36);
      ctx.lineTo(55, 27);
      ctx.lineTo(45, 24);
      ctx.lineTo(53, 20);
      ctx.lineTo(49, 16);
      ctx.closePath();
      ctx.fill();
    }
  });

const createStoneWallTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#64676d';
    ctx.fillRect(0, 0, 64, 64);

    for (let y = 0; y < 64; y += 8) {
      for (let x = 0; x < 64; x += 16) {
        const offset = ((Math.floor(y / 8) + Math.floor(x / 16)) % 2) * 4;
        const blockNoise = ((x * 11 + y * 7) % 19) - 9;
        const light = 112 + blockNoise;
        ctx.fillStyle = `rgb(${light}, ${light + 3}, ${light + 8})`;
        ctx.fillRect(x + offset, y, 12, 7);
        ctx.fillStyle = 'rgba(33, 35, 40, 0.85)';
        ctx.fillRect(x + offset, y + 7, 12, 1);
      }
    }

    ctx.fillStyle = 'rgba(198, 204, 212, 0.25)';
    for (let sparkle = 0; sparkle < 130; sparkle += 1) {
      const px = (sparkle * 23) % 64;
      const py = (sparkle * 17) % 64;
      ctx.fillRect(px, py, 1, 1);
    }
  });

const createBronzeWallTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#6d5646';
    ctx.fillRect(0, 0, 64, 64);

    for (let x = 0; x < 64; x += 8) {
      const shade = 102 + ((x * 13) % 20);
      ctx.fillStyle = `rgb(${shade + 18}, ${shade + 6}, ${shade - 6})`;
      ctx.fillRect(x, 0, 6, 64);
      ctx.fillStyle = 'rgba(28, 15, 8, 0.55)';
      ctx.fillRect(x + 6, 0, 2, 64);
    }

    ctx.fillStyle = '#39261b';
    for (let y = 4; y < 64; y += 16) {
      ctx.fillRect(0, y, 64, 2);
    }
  });

const createTechWallTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#4d596b';
    ctx.fillRect(0, 0, 64, 64);

    ctx.fillStyle = '#6e7f98';
    ctx.fillRect(8, 8, 48, 48);
    ctx.fillStyle = '#232d39';
    ctx.fillRect(12, 12, 40, 40);

    ctx.fillStyle = '#9eaac2';
    for (let y = 16; y <= 44; y += 14) {
      ctx.fillRect(18, y, 10, 6);
      ctx.fillRect(36, y, 10, 6);
    }

    ctx.fillStyle = '#32414f';
    ctx.fillRect(28, 8, 8, 48);
    ctx.fillStyle = '#28458c';
    ctx.fillRect(29, 10, 6, 8);
    ctx.fillRect(29, 28, 6, 8);
    ctx.fillRect(29, 46, 6, 8);
  });

const createLightWallTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#7a7e83';
    ctx.fillRect(0, 0, 64, 64);

    ctx.fillStyle = '#4f555e';
    ctx.fillRect(0, 0, 64, 10);
    ctx.fillRect(0, 54, 64, 10);

    ctx.fillStyle = '#bcc2c8';
    ctx.fillRect(18, 8, 28, 48);
    ctx.fillStyle = '#eef5ff';
    ctx.fillRect(22, 12, 20, 40);
    ctx.fillStyle = '#9ed8ff';
    ctx.fillRect(24, 14, 16, 36);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(24, 14, 4, 36);
    ctx.fillStyle = '#2e3540';
    ctx.fillRect(16, 8, 2, 48);
    ctx.fillRect(46, 8, 2, 48);
  });

const createDoorWallTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#686561';
    ctx.fillRect(0, 0, 64, 64);

    ctx.fillStyle = '#85817a';
    ctx.fillRect(4, 0, 56, 64);
    ctx.fillStyle = '#3a3b40';
    ctx.fillRect(30, 0, 4, 64);

    ctx.fillStyle = '#2d4c9a';
    ctx.fillRect(10, 12, 8, 40);
    ctx.fillRect(46, 12, 8, 40);
    ctx.fillStyle = '#9fd7ff';
    ctx.fillRect(12, 14, 4, 36);
    ctx.fillRect(48, 14, 4, 36);

    ctx.fillStyle = '#202124';
    for (let y = 6; y < 64; y += 10) {
      ctx.fillRect(0, y, 64, 2);
    }
  });

const createHexFloorTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#6a5847';
    ctx.fillRect(0, 0, 64, 64);

    for (let y = 0; y < 64; y += 16) {
      for (let x = 0; x < 64; x += 18) {
        const offset = (Math.floor(y / 16) % 2) * 9;
        const px = x + offset;
        const base = 110 + ((x * 7 + y * 9) % 14);
        ctx.fillStyle = `rgb(${base}, ${base - 18}, ${base - 36})`;
        ctx.beginPath();
        ctx.moveTo(px + 5, y + 1);
        ctx.lineTo(px + 13, y + 1);
        ctx.lineTo(px + 18, y + 8);
        ctx.lineTo(px + 13, y + 15);
        ctx.lineTo(px + 5, y + 15);
        ctx.lineTo(px, y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(34, 22, 12, 0.55)';
        ctx.stroke();
      }
    }
  });

const createMetalFloorTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#53555a';
    ctx.fillRect(0, 0, 64, 64);

    for (let y = 0; y < 64; y += 16) {
      for (let x = 0; x < 64; x += 16) {
        const shade = 86 + ((x * 3 + y * 5) % 18);
        ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 4})`;
        ctx.fillRect(x + 1, y + 1, 14, 14);
        ctx.fillStyle = '#2c2d31';
        ctx.fillRect(x, y + 15, 16, 1);
        ctx.fillRect(x + 15, y, 1, 16);
        ctx.fillStyle = '#9ca0a7';
        ctx.fillRect(x + 2, y + 2, 2, 2);
      }
    }
  });

const createNukageTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#143e11';
    ctx.fillRect(0, 0, 64, 64);

    for (let y = 0; y < 64; y += 1) {
      for (let x = 0; x < 64; x += 1) {
        const wave = 70 + Math.sin((x + y) * 0.35) * 18 + ((x * 17 + y * 7) % 24);
        ctx.fillStyle = `rgb(${24}, ${Math.round(wave + 80)}, ${22})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    ctx.fillStyle = 'rgba(216, 255, 165, 0.14)';
    for (let ripple = 0; ripple < 90; ripple += 1) {
      const px = (ripple * 29) % 64;
      const py = (ripple * 11) % 64;
      ctx.fillRect(px, py, 2, 1);
    }
  });

const createDarkCeilingTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#323437';
    ctx.fillRect(0, 0, 64, 64);

    for (let y = 0; y < 64; y += 16) {
      for (let x = 0; x < 64; x += 16) {
        const shade = 66 + ((x * 5 + y * 7) % 14);
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade + 4})`;
        ctx.fillRect(x + 1, y + 1, 14, 14);
      }
    }

    ctx.strokeStyle = 'rgba(10, 10, 12, 0.75)';
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

const createGridCeilingTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#4f4f52';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#6f6f74';
    ctx.fillRect(4, 4, 56, 56);

    ctx.strokeStyle = 'rgba(25, 25, 28, 0.8)';
    for (let x = 4; x <= 60; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 4);
      ctx.lineTo(x + 0.5, 60);
      ctx.stroke();
    }
    for (let y = 4; y <= 60; y += 8) {
      ctx.beginPath();
      ctx.moveTo(4, y + 0.5);
      ctx.lineTo(60, y + 0.5);
      ctx.stroke();
    }
  });

const createCeilingLightTexture = () =>
  createSpriteCanvas(64, 64, (ctx) => {
    ctx.fillStyle = '#45484e';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#6a6e74';
    ctx.fillRect(0, 0, 64, 8);
    ctx.fillRect(0, 56, 64, 8);

    ctx.fillStyle = '#f5f8fe';
    ctx.fillRect(10, 12, 44, 40);
    ctx.fillStyle = '#b5daf9';
    ctx.fillRect(14, 16, 36, 32);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(14, 16, 6, 32);
  });

const createFireballSprite = (phase = 0) =>
  createSpriteCanvas(28, 28, (ctx) => {
    const outer = phase === 0 ? '#ff7b1f' : '#ffa521';
    const middle = phase === 0 ? '#ffdc67' : '#ffe99a';
    const core = phase === 0 ? '#fff7d5' : '#ffffff';

    ctx.fillStyle = 'rgba(255, 86, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(14, 14, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.arc(14, 14, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = middle;
    ctx.beginPath();
    ctx.arc(14, 14, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(14, 14, 3, 0, Math.PI * 2);
    ctx.fill();
  });

const createTextureSampler = (canvas) => {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);
  return { data, width, height };
};

const getMapCell = (x, y) => {
  const cellX = Math.floor(x);
  const cellY = Math.floor(y);
  if (cellX < 0 || cellY < 0 || cellY >= MAP.length || cellX >= MAP[0].length) return '1';
  return MAP[cellY][cellX];
};

const isWall = (x, y) => getMapCell(x, y) !== '0';

const tryMove = (entity, nextX, nextY, radius = PLAYER_RADIUS) => {
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
  let textureU = impact - Math.floor(impact);

  if ((side === 0 && dirX > 0) || (side === 1 && dirY < 0)) {
    textureU = 1 - textureU;
  }

  return { distance, side, cell, textureU };
};

const getFloorTextureKey = (worldX, worldY) => {
  if (pointInRect(worldX, worldY, 6, 7, 9, 9)) return 'nukage';
  if (pointInRect(worldX, worldY, 8.5, 1, 14, 4.5)) return 'metal';
  if (pointInRect(worldX, worldY, 2, 11.5, 14, 14.5)) return 'metal';
  return 'hex';
};

const getCeilingTextureKey = (worldX, worldY) => {
  if (pointInRect(worldX, worldY, 2, 1, 14, 4.5)) return 'light';
  if (pointInRect(worldX, worldY, 4.5, 4.5, 11.5, 11.5)) return 'grid';
  return 'dark';
};

const DoomApp = () => {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const pointerLookRef = useRef({ active: false, pointerId: null, lastX: 0 });
  const gameRef = useRef(null);
  const rafRef = useRef(null);
  const [restartKey, setRestartKey] = useState(0);
  const [status, setStatus] = useState('Loading round 1.');
  const [weaponLabel, setWeaponLabel] = useState('PISTOL');

  const selectWeapon = (weapon) => {
    if (!gameRef.current) return;
    gameRef.current.player.weapon = weapon;
    setWeaponLabel(weapon === 'fist' ? 'FIST' : 'PISTOL');
  };

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
    let wallTextures = null;
    let floorTextures = null;
    let ceilingTextures = null;
    const zBuffer = new Float32Array(VIEW_WIDTH);

    const pushStatus = (message) => {
      startTransition(() => {
        setStatus(message);
      });
    };

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
        weapon: 'pistol',
        vx: 0,
        vy: 0,
        bobPhase: 0,
        bobStrength: 0
      },
      enemies: [],
      projectiles: [],
      round: 1,
      lastShotAt: 0,
      lastPunchAt: 0,
      lastFrameAt: 0,
      accumulator: 0,
      simTime: 0,
      nextRoundAt: 0,
      running: true,
      deathSoundPlayed: false
    };

    gameRef.current = game;

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
      const size = clamp(124 / depth, 18, 192);
      return { screenX, depth, size };
    };

    const hasLineOfSight = (targetX, targetY) => {
      const dx = targetX - game.player.x;
      const dy = targetY - game.player.y;
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const hit = castRay(game.player.x, game.player.y, angle);
      return hit.distance >= distance - 0.22;
    };

    const applyDamage = (amount, now) => {
      const armorAbsorb = Math.min(game.player.armor, amount * 0.38);
      game.player.armor = Math.max(0, game.player.armor - armorAbsorb);
      game.player.hp = Math.max(0, game.player.hp - (amount - armorAbsorb));
      game.player.hurtAt = now;
    };

    const spawnProjectile = (enemy, now) => {
      const angle = Math.atan2(game.player.y - enemy.y, game.player.x - enemy.x);
      const tuning = getRoundTuning(game.round);
      game.projectiles.push({
        x: enemy.x,
        y: enemy.y,
        angle,
        speed: tuning.projectileSpeed,
        bornAt: now
      });
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
            Math.abs(projection.screenX - SCREEN_CENTER_X) < AIM_HALF_WIDTH
        )
        .sort((a, b) => a.projection.depth - b.projection.depth)[0];

    const spawnRound = (roundNumber, resetPlayer = false, now = game.simTime) => {
      const tuning = getRoundTuning(roundNumber);
      const enemyCount = tuning.enemyCount;
      const enemyHp = tuning.enemyHp;
      const shotsNeeded = enemyCount * enemyHp;
      const ammoGrant = Math.ceil(shotsNeeded * 2.25) + tuning.ammoPadding;
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
          weapon: 'pistol',
          vx: 0,
          vy: 0,
          bobPhase: 0,
          bobStrength: 0
        };
        ammoStatus = `Ammo loaded to ${ammoGrant}.`;
      } else {
        const refill = Math.ceil(shotsNeeded * 1.15) + 14 + roundNumber * 2;
        game.player.ammo += refill;
        game.player.armor = clamp(game.player.armor + 8, 0, 200);
        game.player.weaponFlashUntil = 0;
        game.player.hurtAt = now - 999;
        game.player.weapon = 'pistol';
        game.player.bobStrength = 0;
        ammoStatus = `+${refill} ammo and armor top-up.`;
      }

      game.deathSoundPlayed = false;
      const spawnOffset = ((roundNumber - 1) * 2) % SPAWN_POINTS.length;

      game.enemies = Array.from({ length: enemyCount }, (_, index) => {
        const spawn = SPAWN_POINTS[(spawnOffset + index) % SPAWN_POINTS.length];
        return {
          x: spawn.x,
          y: spawn.y,
          hp: enemyHp,
          speed: tuning.enemySpeed,
          alive: true,
          hitAt: -999,
          attackStartAt: 0,
          firedShot: false,
          cooldownUntil: now + tuning.initialCooldown + index * 190,
          meleeAt: -999,
          bobSeed: 0.4 + index * 0.74
        };
      });

      game.projectiles = [];
      game.round = roundNumber;
      game.lastShotAt = 0;
      game.lastPunchAt = 0;
      game.nextRoundAt = 0;
      game.running = true;
      keysRef.current = {};
      if (resetPlayer) {
        game.lastFrameAt = 0;
        game.accumulator = 0;
        game.simTime = 0;
      }
      setWeaponLabel('PISTOL');
      pushStatus(
        `Round ${roundNumber}. ${enemyCount} imps inbound. ${ammoStatus} W/S move, A/D turn, Q/E strafe, Shift runs, drag to look, 1 pistol, 2 fist.`
      );
    };

    const resizeCanvas = () => {
      const dprLimit = window.matchMedia('(max-width: 768px)').matches ? 1.25 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, dprLimit);
      frameWidth = canvas.clientWidth;
      frameHeight = canvas.clientHeight;
      canvas.width = Math.round(frameWidth * dpr);
      canvas.height = Math.round(frameHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };

    const tryShoot = (now) => {
      if (!game.running || game.player.weapon !== 'pistol') return;
      if (now - game.lastShotAt < 175 || game.player.ammo <= 0) return;

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
      if (now - game.lastPunchAt < 220) return;

      game.lastPunchAt = now;
      game.player.weaponFlashUntil = now + 120;

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

    const separateEnemies = () => {
      for (let index = 0; index < game.enemies.length; index += 1) {
        const enemyA = game.enemies[index];
        if (!enemyA.alive) continue;

        for (let otherIndex = index + 1; otherIndex < game.enemies.length; otherIndex += 1) {
          const enemyB = game.enemies[otherIndex];
          if (!enemyB.alive) continue;

          const dx = enemyB.x - enemyA.x;
          const dy = enemyB.y - enemyA.y;
          const distance = Math.hypot(dx, dy) || 0.0001;
          const minimum = ENEMY_RADIUS * 2.1;
          if (distance >= minimum) continue;

          const overlap = (minimum - distance) * 0.5;
          const pushX = (dx / distance) * overlap;
          const pushY = (dy / distance) * overlap;

          enemyA.x -= pushX;
          enemyA.y -= pushY;
          enemyB.x += pushX;
          enemyB.y += pushY;
        }
      }
    };

    const updateStep = (delta, now) => {
      if (!game.running) return;

      if (game.nextRoundAt && now >= game.nextRoundAt) {
        spawnRound(game.round + 1, false, now);
      }

      const tuning = getRoundTuning(game.round);
      const forwardIntent = (keysRef.current.w || keysRef.current.arrowup ? 1 : 0) - (keysRef.current.s || keysRef.current.arrowdown ? 1 : 0);
      const strafeIntent = (keysRef.current.e ? 1 : 0) - (keysRef.current.q ? 1 : 0);
      const dirX = Math.cos(game.player.angle);
      const dirY = Math.sin(game.player.angle);
      const rightX = Math.cos(game.player.angle + Math.PI / 2);
      const rightY = Math.sin(game.player.angle + Math.PI / 2);

      const turnSpeed = delta * KEYBOARD_TURN_SPEED;
      if (keysRef.current.a || keysRef.current.arrowleft) game.player.angle -= turnSpeed;
      if (keysRef.current.d || keysRef.current.arrowright) game.player.angle += turnSpeed;
      game.player.angle = normalizeAngle(game.player.angle);

      let wishX = dirX * forwardIntent + rightX * strafeIntent;
      let wishY = dirY * forwardIntent + rightY * strafeIntent;
      const wishLength = Math.hypot(wishX, wishY);
      if (wishLength > 0) {
        wishX /= wishLength;
        wishY /= wishLength;
      }

      const running = keysRef.current.shift;
      const backpedaling = forwardIntent < 0 && strafeIntent === 0;
      const moveTargetSpeed =
        PLAYER_WALK_SPEED *
        (running ? PLAYER_RUN_MULTIPLIER : 1) *
        (backpedaling ? PLAYER_BACKPEDAL_MULTIPLIER : 1);
      const moveBlend = wishLength > 0 ? PLAYER_ACCEL_BLEND : PLAYER_DECEL_BLEND;
      game.player.vx = lerp(game.player.vx, wishX * moveTargetSpeed, moveBlend);
      game.player.vy = lerp(game.player.vy, wishY * moveTargetSpeed, moveBlend);

      if (wishLength === 0) {
        game.player.vx *= PLAYER_STOP_FRICTION;
        game.player.vy *= PLAYER_STOP_FRICTION;
      }

      const moved = tryMove(
        game.player,
        game.player.x + game.player.vx * delta,
        game.player.y + game.player.vy * delta,
        PLAYER_RADIUS
      );

      if (moved.x === game.player.x) game.player.vx = 0;
      if (moved.y === game.player.y) game.player.vy = 0;
      game.player.x = moved.x;
      game.player.y = moved.y;

      const planarSpeed = Math.hypot(game.player.vx, game.player.vy) * 240;
      game.player.bobPhase += planarSpeed * 0.014;
      game.player.bobStrength = lerp(game.player.bobStrength, clamp(planarSpeed * 0.08, 0, 1.8), 0.16);

      if (keysRef.current[' ']) {
        if (game.player.weapon === 'pistol') tryShoot(now);
        else tryPunch(now);
      }

      game.enemies.forEach((enemy) => {
        if (!enemy.alive) return;

        const dx = game.player.x - enemy.x;
        const dy = game.player.y - enemy.y;
        const distance = Math.hypot(dx, dy);
        const canSeePlayer = hasLineOfSight(enemy.x, enemy.y);
        const attackElapsed = enemy.attackStartAt ? now - enemy.attackStartAt : 0;

        if (enemy.attackStartAt) {
          if (attackElapsed >= tuning.attackWindup && !enemy.firedShot && distance > 1.5) {
            spawnProjectile(enemy, now);
            enemy.firedShot = true;
          }
          if (attackElapsed >= tuning.attackDuration) {
            enemy.attackStartAt = 0;
            enemy.firedShot = false;
          }
        } else if (distance < 1.12 && now - enemy.meleeAt > 720) {
          enemy.meleeAt = now;
          applyDamage(tuning.meleeDamage, now);
        } else if (distance < tuning.attackRange && distance > 1.5 && canSeePlayer && now >= enemy.cooldownUntil) {
          enemy.attackStartAt = now;
          enemy.firedShot = false;
          enemy.cooldownUntil = now + tuning.attackDuration + tuning.attackCooldown;
        }

        if (!enemy.attackStartAt && distance > 1.1) {
          const next = tryMove(
            enemy,
            enemy.x + (dx / distance) * delta * enemy.speed,
            enemy.y + (dy / distance) * delta * enemy.speed,
            ENEMY_RADIUS
          );
          enemy.x = next.x;
          enemy.y = next.y;
        }
      });

      separateEnemies();

      game.projectiles = game.projectiles.filter((projectile) => {
        const nextX = projectile.x + Math.cos(projectile.angle) * projectile.speed * delta;
        const nextY = projectile.y + Math.sin(projectile.angle) * projectile.speed * delta;

        if (isWall(nextX, nextY)) return false;

        projectile.x = nextX;
        projectile.y = nextY;

        const playerDistance = Math.hypot(projectile.x - game.player.x, projectile.y - game.player.y);
        if (playerDistance <= PROJECTILE_RADIUS + PLAYER_RADIUS * 1.1) {
          applyDamage(tuning.projectileDamage, now);
          return false;
        }

        return now - projectile.bornAt < 5000;
      });

      const aliveCount = game.enemies.filter((enemy) => enemy.alive).length;
      if (game.player.hp <= 0) {
        if (!game.deathSoundPlayed) {
          game.deathSoundPlayed = true;
          playSfx('playerDeath');
        }
        game.running = false;
        pushStatus(`Game over on round ${game.round}. Restart to drop back into the arena.`);
      } else if (aliveCount === 0 && !game.nextRoundAt) {
        game.nextRoundAt = now + 1400;
        pushStatus(`Round ${game.round} cleared. Hell is opening round ${game.round + 1}...`);
      }
    };

    const sampleTextureColor = (texture, u, v, shade) => {
      const tx = ((Math.floor(u * texture.width) % texture.width) + texture.width) % texture.width;
      const ty = ((Math.floor(v * texture.height) % texture.height) + texture.height) % texture.height;
      const index = (ty * texture.width + tx) * 4;
      return `rgb(${Math.round(texture.data[index] * shade)}, ${Math.round(texture.data[index + 1] * shade)}, ${Math.round(texture.data[index + 2] * shade)})`;
    };

    const drawPlane = (isFloor, horizon) => {
      const dirX = Math.cos(game.player.angle);
      const dirY = Math.sin(game.player.angle);
      const planeX = -dirY * Math.tan(FOV / 2);
      const planeY = dirX * Math.tan(FOV / 2);
      const rowStart = isFloor ? Math.ceil(horizon) : 0;
      const rowEnd = isFloor ? VIEWPORT_HEIGHT : Math.ceil(horizon);

      for (let y = rowStart; y < rowEnd; y += 1) {
        const p = isFloor ? y - horizon : horizon - y;
        if (Math.abs(p) < 0.001) continue;

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
          const textureKey = isFloor ? getFloorTextureKey(worldX, worldY) : getCeilingTextureKey(worldX, worldY);
          const texture = isFloor ? floorTextures[textureKey] : ceilingTextures[textureKey];
          const shade = clamp(
            1 - rowDistance / MAX_VIEW_DISTANCE,
            isFloor ? 0.18 : 0.15,
            isFloor ? 1 : 0.88
          );

          bctx.fillStyle = sampleTextureColor(texture, worldX * 0.25, worldY * 0.25, shade);
          bctx.fillRect(x, y, 1, 1);

          worldX += stepX;
          worldY += stepY;
        }
      }
    };

    const drawViewport = (now) => {
      bctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

      const hurtPulse = now - game.player.hurtAt < 130 ? (1 - (now - game.player.hurtAt) / 130) * 2.8 : 0;
      const bobOffset = Math.sin(game.player.bobPhase) * game.player.bobStrength;
      const horizon = VIEWPORT_HEIGHT / 2 + bobOffset + hurtPulse;
      drawPlane(false, horizon);
      drawPlane(true, horizon);

      for (let x = 0; x < VIEW_WIDTH; x += 1) {
        const rayAngle = game.player.angle + ((x / VIEW_WIDTH) - 0.5) * FOV;
        const hit = castRay(game.player.x, game.player.y, rayAngle);
        const perpendicularDistance = hit.distance * Math.cos(rayAngle - game.player.angle);
        zBuffer[x] = perpendicularDistance;

        const wallTexture = wallTextures[hit.cell] || wallTextures['1'];
        const wallHeight = clamp(Math.floor(VIEWPORT_HEIGHT / perpendicularDistance), 8, VIEWPORT_HEIGHT * 1.8);
        const wallTop = Math.floor((VIEWPORT_HEIGHT - wallHeight) / 2 + bobOffset + hurtPulse);
        const depthShadeBase = clamp(1 - perpendicularDistance / MAX_VIEW_DISTANCE, 0.2, 1);
        const sideShade = hit.side === 1 ? 0.74 : 1;

        for (let y = 0; y < wallHeight; y += 1) {
          const textureV = y / Math.max(1, wallHeight);
          const pulse =
            hit.cell === '4'
              ? 0.92 + Math.sin(now * 0.012 + textureV * 4) * 0.08
              : hit.cell === '5'
                ? 0.96 + Math.sin(now * 0.008) * 0.04
                : 1;
          const shade = depthShadeBase * sideShade * pulse;
          bctx.fillStyle = sampleTextureColor(wallTexture, hit.textureU, textureV, shade);
          bctx.fillRect(x, wallTop + y, 1, 1);
        }
      }

      const billboardActors = [
        ...game.enemies
          .filter((enemy) => enemy.alive)
          .map((enemy) => ({ type: 'enemy', entity: enemy, projection: worldToCamera(enemy.x, enemy.y) })),
        ...game.projectiles.map((projectile) => ({
          type: 'projectile',
          entity: projectile,
          projection: worldToCamera(projectile.x, projectile.y)
        }))
      ]
        .filter(({ projection }) => projection)
        .sort((a, b) => b.projection.depth - a.projection.depth);

      const renderBillboard = (image, projection, drawY, drawWidth, drawHeight, alpha = 1) => {
        const left = projection.screenX - drawWidth / 2;
        const right = projection.screenX + drawWidth / 2;
        const startX = clamp(Math.floor(left), 0, VIEW_WIDTH - 1);
        const endX = clamp(Math.ceil(right), 0, VIEW_WIDTH - 1);

        bctx.save();
        bctx.globalAlpha = alpha;
        for (let stripe = startX; stripe <= endX; stripe += 1) {
          if (projection.depth > zBuffer[stripe] + 0.06) continue;
          const spriteU = (stripe - left) / drawWidth;
          if (spriteU < 0 || spriteU > 1) continue;
          const sourceX = clamp(Math.floor(spriteU * image.width), 0, image.width - 1);
          bctx.drawImage(image, sourceX, 0, 1, image.height, stripe, drawY, 1, drawHeight);
        }
        bctx.restore();
      };

      billboardActors.forEach(({ type, entity, projection }) => {
        if (type === 'enemy') {
          const bob = Math.sin(now * 0.008 + entity.bobSeed) * 2.2;
          const attacking = entity.attackStartAt && now - entity.attackStartAt < 430;
          const spriteImage =
            now - entity.hitAt < 90
              ? assets.enemyHit
              : attacking
                ? assets.enemyAttack
                : Math.sin(now * 0.011 + entity.bobSeed) > 0.1
                  ? assets.enemyWalkA
                  : assets.enemyWalkB;
          const drawWidth = projection.size * 0.96;
          const drawHeight = projection.size * 1.2;
          const drawY = Math.round(90 - drawHeight / 2 + bob + bobOffset * 0.6);

          bctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          bctx.beginPath();
          bctx.ellipse(
            projection.screenX,
            drawY + drawHeight - 4,
            drawWidth * 0.34,
            drawHeight * 0.09,
            0,
            0,
            Math.PI * 2
          );
          bctx.fill();

          renderBillboard(spriteImage, projection, drawY, drawWidth, drawHeight);
          return;
        }

        const spriteImage = Math.sin(now * 0.02) > 0 ? assets.fireballA : assets.fireballB;
        const size = clamp(48 / projection.depth, 10, 48);
        const drawY = Math.round(86 - size / 2 + Math.sin((now - entity.bornAt) * 0.02) * 2 + bobOffset * 0.4);
        renderBillboard(spriteImage, projection, drawY, size, size, 0.96);
      });

      const moving = Math.hypot(game.player.vx, game.player.vy) > 0.0004;
      const gunBobX = moving ? Math.sin(game.player.bobPhase * 0.9) * 4 : 0;
      const gunBobY = moving ? Math.abs(Math.cos(game.player.bobPhase * 0.72)) * 3 : 0;
      const actionActive = now < game.player.weaponFlashUntil;

      if (game.player.weapon === 'pistol') {
        const gunImage = actionActive ? assets.gunFlash : assets.gunIdle;
        const gunWidth = actionActive ? 126 : 114;
        const gunHeight = actionActive ? 94 : 84;
        bctx.drawImage(
          gunImage,
          Math.round(SCREEN_CENTER_X - gunWidth / 2 + gunBobX),
          Math.round(actionActive ? 86 + gunBobY : 92 + gunBobY),
          gunWidth,
          gunHeight
        );
      } else {
        const fistImage = actionActive ? assets.fistPunch : assets.fistIdle;
        const fistWidth = actionActive ? 118 : 108;
        const fistHeight = actionActive ? 96 : 88;
        bctx.drawImage(
          fistImage,
          Math.round(SCREEN_CENTER_X - fistWidth / 2 + gunBobX * 1.2),
          Math.round(actionActive ? 84 + gunBobY : 90 + gunBobY),
          fistWidth,
          fistHeight
        );
      }

      if (actionActive && game.player.weapon === 'pistol') {
        const flashGradient = bctx.createRadialGradient(SCREEN_CENTER_X, 108, 10, SCREEN_CENTER_X, 108, 96);
        flashGradient.addColorStop(0, 'rgba(255, 182, 64, 0.3)');
        flashGradient.addColorStop(1, 'rgba(255, 182, 64, 0)');
        bctx.fillStyle = flashGradient;
        bctx.fillRect(0, 0, VIEW_WIDTH, VIEWPORT_HEIGHT);
      }

      const topFade = bctx.createLinearGradient(0, 0, 0, 28);
      topFade.addColorStop(0, 'rgba(0,0,0,0.45)');
      topFade.addColorStop(1, 'rgba(0,0,0,0)');
      bctx.fillStyle = topFade;
      bctx.fillRect(0, 0, VIEW_WIDTH, 28);

      const edgeFade = bctx.createLinearGradient(0, 0, VIEW_WIDTH, 0);
      edgeFade.addColorStop(0, 'rgba(0,0,0,0.28)');
      edgeFade.addColorStop(0.15, 'rgba(0,0,0,0)');
      edgeFade.addColorStop(0.85, 'rgba(0,0,0,0)');
      edgeFade.addColorStop(1, 'rgba(0,0,0,0.28)');
      bctx.fillStyle = edgeFade;
      bctx.fillRect(0, 0, VIEW_WIDTH, VIEWPORT_HEIGHT);

      drawSprite(bctx, assets.hud, ASSET_RECTS.hud, 0, HUD_Y, VIEW_WIDTH, VIEW_HEIGHT - HUD_Y);
      drawHudText(bctx, String(Math.round(game.player.ammo)).padStart(2, '0'), 14, 165, 3);
      drawHudText(bctx, `${Math.round(game.player.hp)}%`, 63, 165, 3);
      drawHudText(bctx, `${Math.round(game.player.armor)}%`, 201, 165, 3);

      bctx.save();
      bctx.font = 'bold 10px Monaco, Menlo, monospace';
      bctx.fillStyle = 'rgba(0,0,0,0.55)';
      bctx.fillText(`ROUND ${game.round}  ${game.player.weapon === 'fist' ? 'WEAPON 2 FIST' : 'WEAPON 1 PISTOL'}`, 7, 12);
      bctx.fillStyle = '#ebe3d1';
      bctx.fillText(`ROUND ${game.round}  ${game.player.weapon === 'fist' ? 'WEAPON 2 FIST' : 'WEAPON 1 PISTOL'}`, 6, 11);
      bctx.restore();

      if (now - game.player.hurtAt < 110) {
        bctx.fillStyle = 'rgba(190, 0, 0, 0.2)';
        bctx.fillRect(0, 0, VIEW_WIDTH, VIEWPORT_HEIGHT);
      } else if (game.player.hp < 28) {
        bctx.fillStyle = `rgba(120, 0, 0, ${0.05 + (Math.sin(now * 0.008) + 1) * 0.03})`;
        bctx.fillRect(0, 0, VIEW_WIDTH, VIEWPORT_HEIGHT);
      }

      if (!game.running) {
        bctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        bctx.fillRect(0, 48, VIEW_WIDTH, 36);
        bctx.fillStyle = '#fff4da';
        bctx.font = 'bold 18px Arial';
        bctx.textAlign = 'center';
        bctx.fillText('GAME OVER', SCREEN_CENTER_X, 60);
        bctx.font = 'bold 10px Arial';
        bctx.fillText('RESTART TO TRY AGAIN', SCREEN_CENTER_X, 74);
        bctx.textAlign = 'left';
      }
    };

    const frame = (timestamp) => {
      if (!game.lastFrameAt) game.lastFrameAt = timestamp;
      const delta = Math.min(48, timestamp - game.lastFrameAt);
      game.lastFrameAt = timestamp;
      game.accumulator += delta;

      while (game.accumulator >= FIXED_TIMESTEP) {
        game.simTime += FIXED_TIMESTEP;
        updateStep(FIXED_TIMESTEP, game.simTime);
        game.accumulator -= FIXED_TIMESTEP;
      }

      drawViewport(game.simTime || timestamp);

      ctx.clearRect(0, 0, frameWidth, frameHeight);
      ctx.drawImage(buffer, 0, 0, frameWidth, frameHeight);
      rafRef.current = requestAnimationFrame(frame);
    };

    const setKey = (event, isPressed) => {
      const key = event.key.toLowerCase();
      if (key === '1' && isPressed) {
        selectWeapon('pistol');
        event.preventDefault();
        return;
      }
      if (key === '2' && isPressed) {
        selectWeapon('fist');
        event.preventDefault();
        return;
      }
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd', 'q', 'e'].includes(key)) {
        event.preventDefault();
      }
      keysRef.current[key] = isPressed;
    };

    const handleKeyDown = (event) => setKey(event, true);
    const handleKeyUp = (event) => setKey(event, false);

    const handleCanvasPointerDown = (event) => {
      event.preventDefault();
      canvas.focus();
      pointerLookRef.current.active = true;
      pointerLookRef.current.pointerId = event.pointerId;
      pointerLookRef.current.lastX = event.clientX;
      canvas.setPointerCapture?.(event.pointerId);
    };

    const handleCanvasPointerMove = (event) => {
      const pointerState = pointerLookRef.current;
      if (!pointerState.active || pointerState.pointerId !== event.pointerId || !gameRef.current) return;
      const deltaX = event.movementX || event.clientX - pointerState.lastX;
      pointerState.lastX = event.clientX;
      gameRef.current.player.angle = normalizeAngle(gameRef.current.player.angle + deltaX * POINTER_LOOK_SPEED);
    };

    const handleCanvasPointerUp = (event) => {
      if (pointerLookRef.current.pointerId === event.pointerId) {
        pointerLookRef.current.active = false;
        pointerLookRef.current.pointerId = null;
        canvas.releasePointerCapture?.(event.pointerId);
      }
    };

    const clearInput = () => {
      keysRef.current = {};
      pointerLookRef.current.active = false;
      pointerLookRef.current.pointerId = null;
    };

    const boot = async () => {
      const hud = await loadImage(ASSET_RECTS.hud.src);
      if (disposed) return;

      assets = {
        hud,
        gunIdle: createWeaponSprite(false),
        gunFlash: createWeaponSprite(true),
        fistIdle: createFistSprite(false),
        fistPunch: createFistSprite(true),
        enemyHit: createImpSprite(true),
        enemyWalkA: createImpWalkSprite(0),
        enemyWalkB: createImpWalkSprite(1),
        enemyAttack: createImpAttackSprite(),
        fireballA: createFireballSprite(0),
        fireballB: createFireballSprite(1)
      };

      wallTextures = {
        '1': createTextureSampler(createStoneWallTexture()),
        '2': createTextureSampler(createBronzeWallTexture()),
        '3': createTextureSampler(createTechWallTexture()),
        '4': createTextureSampler(createLightWallTexture()),
        '5': createTextureSampler(createDoorWallTexture())
      };

      floorTextures = {
        hex: createTextureSampler(createHexFloorTexture()),
        metal: createTextureSampler(createMetalFloorTexture()),
        nukage: createTextureSampler(createNukageTexture())
      };

      ceilingTextures = {
        dark: createTextureSampler(createDarkCeilingTexture()),
        grid: createTextureSampler(createGridCeilingTexture()),
        light: createTextureSampler(createCeilingLightTexture())
      };

      resizeCanvas();
      spawnRound(1, true);
      window.addEventListener('keydown', handleKeyDown, { passive: false });
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('blur', clearInput);
      window.addEventListener('resize', resizeCanvas);
      canvas.addEventListener('pointerdown', handleCanvasPointerDown);
      canvas.addEventListener('pointermove', handleCanvasPointerMove);
      canvas.addEventListener('pointerup', handleCanvasPointerUp);
      canvas.addEventListener('pointercancel', handleCanvasPointerUp);
      canvas.addEventListener('pointerleave', handleCanvasPointerUp);
      rafRef.current = requestAnimationFrame(frame);
    };

    boot().catch(() => {
      pushStatus('Could not load Doom assets.');
    });

    return () => {
      disposed = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearInput);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('pointerdown', handleCanvasPointerDown);
      canvas.removeEventListener('pointermove', handleCanvasPointerMove);
      canvas.removeEventListener('pointerup', handleCanvasPointerUp);
      canvas.removeEventListener('pointercancel', handleCanvasPointerUp);
      canvas.removeEventListener('pointerleave', handleCanvasPointerUp);
    };
  }, [restartKey]);

  return (
    <div className="mac-content-inner doom-app">
      <div className="doom-header">
        <div className="doom-kicker">
          <span className="doom-kicker-light"></span>
          <span>E1M1 PORTFOLIO BUILD</span>
        </div>
        <img src="/doom-logo.png" alt="Doom logo" className="doom-logo-wide" />
        <p className="doom-note">
          Click the game screen first, then use <strong>W/S</strong> to move, <strong>A/D</strong> to turn, <strong>Q/E</strong> to strafe, and <strong>Shift</strong> to run. <strong>1</strong> or <strong>2</strong> swaps weapons. Space fires or punches.
        </p>
      </div>

      <div className="doom-shell">
        <div className="doom-shell-topline">
          <span className="doom-top-pill">Macintosh Game Window</span>
          <span className="doom-top-copy">Click to focus. Drag to look. Survive the slower warm-up waves.</span>
        </div>
        <canvas ref={canvasRef} className="doom-iframe" tabIndex={0} />
      </div>

      <div className="doom-toolbar">
        <div className="doom-weapon-controls">
          <button
            type="button"
            className={`retro-mac-btn doom-weapon-btn${weaponLabel === 'PISTOL' ? ' is-active' : ''}`}
            onClick={() => selectWeapon('pistol')}
          >
            1 PISTOL
          </button>
          <button
            type="button"
            className={`retro-mac-btn doom-weapon-btn${weaponLabel === 'FIST' ? ' is-active' : ''}`}
            onClick={() => selectWeapon('fist')}
          >
            2 FIST
          </button>
        </div>

        <div className="doom-mobile-controls">
          <button
            type="button"
            className="retro-mac-btn doom-pad-btn doom-pad-left"
            aria-label="Turn left"
            {...bindControl('arrowleft')}
          >
            LEFT
          </button>
          <button
            type="button"
            className="retro-mac-btn doom-pad-btn doom-pad-up"
            aria-label="Move forward"
            {...bindControl('arrowup')}
          >
            FWD
          </button>
          <button
            type="button"
            className="retro-mac-btn doom-pad-btn doom-pad-right"
            aria-label="Turn right"
            {...bindControl('arrowright')}
          >
            RIGHT
          </button>
          <button
            type="button"
            className="retro-mac-btn doom-pad-btn doom-pad-down"
            aria-label="Move backward"
            {...bindControl('arrowdown')}
          >
            BACK
          </button>
          <button
            type="button"
            className="retro-mac-btn doom-shoot-btn"
            aria-label="Shoot or punch"
            {...bindControl(' ')}
          >
            FIRE
          </button>
        </div>

        <button
          type="button"
          className="retro-mac-btn doom-restart-btn"
          onClick={() => setRestartKey((value) => value + 1)}
        >
          Restart
        </button>
      </div>

      <p className="doom-status">{status}</p>
    </div>
  );
};

export default DoomApp;
