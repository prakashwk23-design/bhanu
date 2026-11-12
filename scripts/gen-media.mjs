// Generates the three demo media assets shipped with OmniPost AI.
// Pure Node (zlib only) so no image dependencies are required.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../public/media');
mkdirSync(outDir, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, pixelAt) {
  const stride = width * 3 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelAt(x, y);
      const o = y * stride + 1 + x * 3;
      raw[o] = clamp255(r);
      raw[o + 1] = clamp255(g);
      raw[o + 2] = clamp255(b);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const clamp255 = (v) => Math.round(clamp(v, 0, 255));
const mix = (a, b, t) => a + (b - a) * t;
const mixRgb = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const noise = (x, y) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return (n - Math.floor(n) - 0.5) * 5;
};

/** Layered dusk ridges with a low sun. */
function ridgeLines(width, height) {
  const top = [11, 16, 42];
  const mid = [72, 42, 108];
  const warm = [232, 148, 96];
  const sunX = width * 0.63;
  const sunY = height * 0.44;
  const sunR = width * 0.24;
  const ridges = [
    { base: 0.5, amp: 34, freq: 0.0027, phase: 0.4, color: [92, 62, 108], light: 0.06 },
    { base: 0.6, amp: 26, freq: 0.0038, phase: 2.1, color: [58, 40, 84], light: 0.1 },
    { base: 0.71, amp: 22, freq: 0.0049, phase: 4.4, color: [36, 25, 62], light: 0.14 },
    { base: 0.83, amp: 16, freq: 0.0061, phase: 1.2, color: [20, 15, 42], light: 0.18 },
  ];
  return (x, y) => {
    const t = y / height;
    let color = t < 0.55 ? mixRgb(top, mid, t / 0.55) : mixRgb(mid, warm, (t - 0.55) / 0.45);
    const dx = x - sunX;
    const dy = y - sunY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const glow = Math.pow(clamp(1 - dist / (sunR * 2.1), 0, 1), 2.2);
    color = mixRgb(color, [255, 205, 160], glow * 0.55);
    const core = Math.pow(clamp(1 - dist / (sunR * 0.42), 0, 1), 0.6);
    color = mixRgb(color, [255, 236, 205], core * 0.95);
    // stars in the upper sky
    if (y < height * 0.4 && (x * 7919 + y * 104729) % 9973 < 2) {
      color = mixRgb(color, [235, 240, 255], 0.7);
    }
    for (const ridge of ridges) {
      const ridgeY =
        height * ridge.base +
        Math.sin(x * ridge.freq + ridge.phase) * ridge.amp +
        Math.sin(x * ridge.freq * 2.7 + ridge.phase) * ridge.amp * 0.35;
      if (y > ridgeY) {
        const depth = clamp((y - ridgeY) / (height - ridgeY), 0, 1);
        const base = mixRgb(ridge.color, [8, 6, 22], depth * 0.7);
        color = mixRgb(color, base, 0.92);
        // sunset rim light along the ridge
        if (y - ridgeY < 3.2) {
          const rim = Math.pow(clamp(1 - Math.abs(x - sunX) / (sunR * 2.6), 0, 1), 1.4);
          color = mixRgb(color, [255, 186, 140], rim * (1 - ridge.light) * 0.8);
        }
      }
    }
    const n = noise(x, y);
    return [color[0] + n, color[1] + n, color[2] + n];
  };
}

/** Portrait product shot: soft violet studio light over a floating card. */
function studioProduct(width, height) {
  const bgTop = [30, 27, 75];
  const bgBottom = [14, 14, 34];
  const cardX = width * 0.5;
  const cardY = height * 0.44;
  const cardW = width * 0.56;
  const cardH = height * 0.28;
  const glowA = { x: width * 0.18, y: height * 0.22, r: width * 0.55, c: [99, 102, 241] };
  const glowB = { x: width * 0.88, y: height * 0.14, r: width * 0.42, c: [168, 85, 247] };
  const glowC = { x: width * 0.72, y: height * 0.78, r: width * 0.5, c: [236, 72, 153] };

  return (x, y) => {
    let color = mixRgb(bgTop, bgBottom, y / height);
    for (const g of [glowA, glowB, glowC]) {
      const d = Math.hypot(x - g.x, y - g.y) / g.r;
      const k = Math.pow(clamp(1 - d, 0, 1), 2.1) * 0.5;
      color = mixRgb(color, g.c, k);
    }
    // horizon + grid floor
    const horizon = height * 0.68;
    if (y > horizon) {
      const f = (y - horizon) / (height - horizon);
      color = mixRgb(color, [10, 9, 24], 0.35 + f * 0.3);
      const spacing = 70;
      const line = Math.abs(((x + (f * f) * 160) % spacing) - spacing / 2);
      if (line > spacing / 2 - 1 && Math.abs(((y - horizon) % (spacing * 0.8)) - spacing * 0.4) < 1) {
        color = mixRgb(color, [129, 140, 248], 0.16 + f * 0.12);
      }
      if (Math.abs(y - horizon) < 2) color = mixRgb(color, [165, 180, 252], 0.5);
    }
    // floor glow under the card
    const under = Math.pow(clamp(1 - Math.hypot((x - cardX) / (cardW * 0.7), (y - (cardY + cardH * 0.9)) / (cardH * 0.35)), 0, 1), 2);
    color = mixRgb(color, [129, 102, 241], under * 0.4);
    // the floating card
    const rx = cardW * 0.16;
    const inX = Math.abs(x - cardX) - (cardW / 2 - rx);
    const inY = Math.abs(y - cardY) - (cardH / 2 - rx);
    const inRound = Math.hypot(Math.max(inX, 0), Math.max(inY, 0)) - rx;
    if (inRound < 0) {
      const t = (y - (cardY - cardH / 2)) / cardH;
      let card = mixRgb([129, 122, 255], [58, 40, 128], t * 0.8);
      const sweep = clamp(1 - Math.abs(x - (cardX - cardW * 0.18) - y * 0.25) / 140, 0, 1);
      card = mixRgb(card, [226, 232, 255], sweep * 0.28);
      color = card;
      // faux UI rows on the card
      const rowY = cardY - cardH * 0.24;
      for (let i = 0; i < 3; i++) {
        const ry = rowY + i * cardH * 0.2;
        if (Math.abs(y - ry) < 7 && x > cardX - cardW * 0.32 && x < cardX - cardW * 0.32 + cardW * (0.5 - i * 0.1)) {
          color = mixRgb(color, [255, 255, 255], 0.55 - i * 0.12);
        }
      }
      const pill = { x: cardX + cardW * 0.28, y: cardY + cardH * 0.28, r: cardH * 0.11 };
      if (Math.hypot(x - pill.x, y - pill.y) < pill.r) color = [255, 255, 255];
    } else if (inRound < 2.4) {
      color = mixRgb(color, [196, 181, 253], 0.5);
    }
    const n = noise(x, y);
    return [color[0] + n, color[1] + n, color[2] + n];
  };
}

/** Night skyline with lit windows and a water reflection. */
function cityNight(width, height) {
  const buildings = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  let x = -20;
  while (x < width + 20) {
    const w = 30 + rand() * 70;
    const h = 90 + rand() * (height * 0.44);
    buildings.push({ x, w, h, shade: 0.55 + rand() * 0.45 });
    x += w + 6 + rand() * 14;
  }
  const horizon = height * 0.72;
  const moon = { x: width * 0.78, y: height * 0.2, r: width * 0.05 };
  return (px, py) => {
    let color = mixRgb([7, 11, 32], [24, 40, 78], py / horizon);
    const skyGlow = Math.pow(clamp(1 - Math.hypot(px - width * 0.4, py - horizon * 1.3) / (width * 0.75), 0, 1), 2);
    color = mixRgb(color, [56, 88, 140], skyGlow * 0.55);
    const md = Math.hypot(px - moon.x, py - moon.y);
    color = mixRgb(color, [190, 214, 255], Math.pow(clamp(1 - md / (moon.r * 4), 0, 1), 2.6) * 0.45);
    if (md < moon.r) color = mixRgb(color, [235, 243, 255], 0.92);
    // distant haze
    if (py > horizon - 40 && py < horizon) {
      color = mixRgb(color, [86, 118, 168], 0.12);
    }
    for (const b of buildings) {
      if (px > b.x && px < b.x + b.w && py > horizon - b.h && py < horizon) {
        const depth = (py - (horizon - b.h)) / b.h;
        let c = mixRgb([18, 24, 48], [9, 12, 28], depth);
        c = mixRgb(c, [40, 56, 96], b.shade * 0.5);
        // windows
        const wx = Math.floor((px - b.x) / 11);
        const wy = Math.floor((py - (horizon - b.h)) / 13);
        const lit = ((wx * 31 + wy * 17 + Math.floor(b.x)) % 7) < 3;
        if (lit && (px - b.x) % 11 > 2 && (px - b.x) % 11 < 8 && (py - (horizon - b.h)) % 13 > 3 && (py - (horizon - b.h)) % 13 < 8) {
          const warm = ((wx + wy) % 5) < 2;
          c = mixRgb(c, warm ? [255, 214, 150] : [150, 220, 255], 0.85);
        }
        // rooftop accent
        if (py < horizon - b.h + 2 && py > horizon - b.h - 1) c = mixRgb(c, [120, 150, 220], 0.35);
        color = c;
      }
    }
    if (py >= horizon) {
      const refl = (py - horizon) / (height - horizon);
      const above = horizon - (py - horizon) * 0.9;
      const b = buildings.find((bb) => px > bb.x && px < bb.x + bb.w && above > horizon - bb.h);
      let c = mixRgb([10, 18, 40], [5, 9, 22], refl);
      if (b) c = mixRgb(c, [30, 46, 80], (1 - refl) * 0.7);
      const glint = Math.abs(Math.sin(px * 0.06 + py * 0.02));
      c = mixRgb(c, [120, 170, 240], glint * 0.06 * (1 - refl));
      color = c;
    }
    const n = noise(px, py);
    return [color[0] + n, color[1] + n, color[2] + n];
  };
}

const assets = [
  { file: 'ridge-lines.png', w: 1600, h: 900, fn: ridgeLines },
  { file: 'studio-product.png', w: 1080, h: 1350, fn: studioProduct },
  { file: 'city-night.png', w: 1280, h: 720, fn: cityNight },
];

for (const asset of assets) {
  const started = Date.now();
  const buf = encodePng(asset.w, asset.h, asset.fn(asset.w, asset.h));
  writeFileSync(resolve(outDir, asset.file), buf);
  console.log(`wrote ${asset.file} ${asset.w}x${asset.h} ${(buf.length / 1024).toFixed(0)}kb in ${Date.now() - started}ms`);
}
