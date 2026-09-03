/**
 * Generates 48x48 PNG sprites for enterprise buildings.
 * Run: node scripts/generate-map-sprites.mjs
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../client/public/assets/map');

const W = 48;
const H = 48;

const PALETTE = {
  transparent: [0, 0, 0, 0],
  outline: [30, 41, 59, 255],
  shadow: [15, 23, 42, 180],
  window: [254, 243, 199, 255],
  chimney: [51, 65, 85, 255],
  manufactory: [74, 144, 217, 255],
  factory: [80, 200, 120, 255],
  shop: [245, 197, 66, 255],
  farm: [230, 126, 34, 255],
  mine: [149, 165, 166, 255],
  research_center: [155, 89, 182, 255],
  locked: [100, 116, 139, 120],
};

function createCanvas() {
  return Array.from({ length: H }, () =>
    Array.from({ length: W }, () => [...PALETTE.transparent])
  );
}

function setPixel(canvas, x, y, color) {
  if (x >= 0 && x < W && y >= 0 && y < H) canvas[y][x] = color;
}

function fillRect(canvas, x, y, w, h, color) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) setPixel(canvas, px, py, color);
  }
}

function drawOutlineRect(canvas, x, y, w, h, color) {
  for (let px = x; px < x + w; px++) {
    setPixel(canvas, px, y, color);
    setPixel(canvas, px, y + h - 1, color);
  }
  for (let py = y; py < y + h; py++) {
    setPixel(canvas, x, py, color);
    setPixel(canvas, x + w - 1, py, color);
  }
}

function drawManufactory(canvas, color) {
  fillRect(canvas, 8, 22, 32, 16, color);
  fillRect(canvas, 30, 12, 6, 10, PALETTE.chimney);
  drawOutlineRect(canvas, 8, 22, 32, 16, PALETTE.outline);
  fillRect(canvas, 14, 26, 8, 8, PALETTE.window);
  fillRect(canvas, 26, 26, 8, 8, PALETTE.window);
}

function drawFactory(canvas, color) {
  fillRect(canvas, 4, 20, 40, 18, color);
  fillRect(canvas, 10, 8, 8, 12, PALETTE.chimney);
  fillRect(canvas, 28, 4, 8, 16, PALETTE.chimney);
  drawOutlineRect(canvas, 4, 20, 40, 18, PALETTE.outline);
}

function drawShop(canvas, color) {
  fillRect(canvas, 10, 24, 28, 14, color);
  fillRect(canvas, 14, 28, 8, 8, PALETTE.window);
  fillRect(canvas, 26, 28, 8, 8, PALETTE.window);
  drawOutlineRect(canvas, 10, 24, 28, 14, PALETTE.outline);
}

function drawFarm(canvas, color) {
  fillRect(canvas, 10, 26, 28, 12, color);
  for (let i = 0; i < 28; i++) {
    const t = i / 27;
    const px = Math.round(10 + i);
    const py = Math.round(26 - (1 - Math.abs(t - 0.5) * 2) * 14);
    setPixel(canvas, px, py, PALETTE.outline);
    setPixel(canvas, px, py + 1, color);
  }
  drawOutlineRect(canvas, 10, 26, 28, 12, PALETTE.outline);
}

function drawMine(canvas, color) {
  for (let row = 0; row < 20; row++) {
    const half = Math.round((row / 19) * 18);
    for (let dx = -half; dx <= half; dx++) {
      setPixel(canvas, 24 + dx, 10 + row, color);
    }
  }
  fillRect(canvas, 18, 18, 12, 20, PALETTE.chimney);
  drawOutlineRect(canvas, 18, 18, 12, 20, PALETTE.outline);
}

function drawResearch(canvas, color) {
  fillRect(canvas, 10, 24, 28, 14, color);
  for (let y = 6; y <= 24; y++) {
    const r = Math.round(Math.sqrt(Math.max(0, 196 - (y - 6) * 8)));
    for (let dx = -r; dx <= r; dx++) setPixel(canvas, 24 + dx, y, color);
  }
  drawOutlineRect(canvas, 10, 24, 28, 14, PALETTE.outline);
}

function drawLocked(canvas) {
  fillRect(canvas, 12, 18, 24, 20, PALETTE.locked);
  drawOutlineRect(canvas, 12, 18, 24, 20, PALETTE.outline);
  fillRect(canvas, 20, 24, 8, 8, [251, 191, 36, 255]);
}

const DRAWERS = {
  manufactory: drawManufactory,
  factory: drawFactory,
  shop: drawShop,
  farm: drawFarm,
  mine: drawMine,
  research_center: drawResearch,
  locked: (c) => drawLocked(c),
};

function encodePNG(canvas) {
  const raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) {
    const rowStart = y * (W * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < W; x++) {
      const [r, g, b, a] = canvas[y][x];
      const i = rowStart + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const chunks = [
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ];

  return Buffer.concat([signature, ...chunks]);
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [name, drawer] of Object.entries(DRAWERS)) {
  const canvas = createCanvas();
  if (name === 'locked') drawer(canvas);
  else drawer(canvas, PALETTE[name]);
  fillRect(canvas, 0, H - 4, W, 4, PALETTE.shadow);
  const png = encodePNG(canvas);
  const file = path.join(OUT_DIR, `${name}.png`);
  fs.writeFileSync(file, png);
  console.log(`Wrote ${file} (${png.length} bytes)`);
}

console.log('Done — sprites in client/public/assets/map/');
