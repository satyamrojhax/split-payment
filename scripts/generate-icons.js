import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// Minimal uncompressed/deflated raw PNG generator
function createPng(width, height, getPixel) {
  // width and height are 32-bit big endian
  const IHDR = Buffer.alloc(13);
  IHDR.writeUInt32BE(width, 0);
  IHDR.writeUInt32BE(height, 4);
  IHDR[8] = 8; // bit depth 8
  IHDR[9] = 6; // color type 6 (RGBA)
  IHDR[10] = 0; // compression
  IHDR[11] = 0; // filter
  IHDR[12] = 0; // interlace

  // Raw pixel data with filter byte per scanline
  const rowStride = width * 4 + 1;
  const rawData = Buffer.alloc(rowStride * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', IHDR);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
  }
  table[i] = c >>> 0;
}

// Pixel drawer for SplitPay brand icon
function getSplitPayPixel(x, y, w, h, isMaskable = false) {
  // Normalize coordinates to 0..1
  const nx = x / w;
  const ny = y / h;

  // Background: Rich high-contrast dark (#111111) with subtle gradient
  let r = 16, g = 16, b = 20, a = 255;

  // Outer squircle corner check if not maskable
  if (!isMaskable) {
    const cornerRadius = 0.22;
    // Check 4 corners
    const checkCorner = (cx, cy) => {
      const dx = Math.abs(nx - cx);
      const dy = Math.abs(ny - cy);
      if (dx < cornerRadius && dy < cornerRadius) {
        const dist = Math.sqrt((cornerRadius - dx) ** 2 + (cornerRadius - dy) ** 2);
        if (dist > cornerRadius) return false;
      }
      return true;
    };
    if (!checkCorner(cornerRadius, cornerRadius) ||
        !checkCorner(1 - cornerRadius, cornerRadius) ||
        !checkCorner(cornerRadius, 1 - cornerRadius) ||
        !checkCorner(1 - cornerRadius, 1 - cornerRadius)) {
      return [0, 0, 0, 0];
    }
  }

  // Draw subtle inner border
  const borderMargin = 0.03;
  if (nx > borderMargin && nx < 1 - borderMargin && ny > borderMargin && ny < 1 - borderMargin) {
    // Top Left Target Frame
    if (nx >= 0.22 && nx <= 0.42 && ny >= 0.22 && ny <= 0.42) {
      const isInner = nx >= 0.26 && nx <= 0.38 && ny >= 0.26 && ny <= 0.38;
      const isCenterDot = nx >= 0.29 && nx <= 0.35 && ny >= 0.29 && ny <= 0.35;
      if (!isInner || isCenterDot) {
        return [255, 255, 255, 255];
      }
    }

    // Top Right Target Frame
    if (nx >= 0.58 && nx <= 0.78 && ny >= 0.22 && ny <= 0.42) {
      const isInner = nx >= 0.62 && nx <= 0.74 && ny >= 0.26 && ny <= 0.38;
      const isCenterDot = nx >= 0.65 && nx <= 0.71 && ny >= 0.29 && ny <= 0.35;
      if (!isInner || isCenterDot) {
        return [255, 255, 255, 255];
      }
    }

    // Dynamic diagonal slash in center (Split symbol)
    const diagDist = Math.abs((nx - 0.2) - (0.8 - ny));
    if (diagDist < 0.025 && nx >= 0.25 && nx <= 0.75 && ny >= 0.25 && ny <= 0.75) {
      return [255, 255, 255, 255]; // White dynamic slash
    }

    // Bottom left block (Rupee symbol shape)
    if (ny >= 0.54 && ny <= 0.78 && nx >= 0.24 && nx <= 0.54) {
      // Horizontal bar 1
      if (ny >= 0.56 && ny <= 0.59 && nx >= 0.28 && nx <= 0.50) return [255, 255, 255, 255];
      // Horizontal bar 2
      if (ny >= 0.62 && ny <= 0.65 && nx >= 0.28 && nx <= 0.48) return [255, 255, 255, 255];
      // Vertical stem
      if (nx >= 0.28 && nx <= 0.32 && ny >= 0.56 && ny <= 0.76) return [255, 255, 255, 255];
      // Upper curve
      if (nx >= 0.44 && nx <= 0.48 && ny >= 0.58 && ny <= 0.64) return [255, 255, 255, 255];
      // Diagonal leg
      const legDist = Math.abs((nx - 0.32) - (ny - 0.64));
      if (legDist < 0.025 && ny >= 0.64 && ny <= 0.76 && nx >= 0.32 && nx <= 0.48) return [255, 255, 255, 255];
    }

    // Bottom right split pill
    if (nx >= 0.60 && nx <= 0.78 && ny >= 0.58 && ny <= 0.74) {
      return [255, 255, 255, 230];
    }
  }

  return [r, g, b, a];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

console.log('Generating PWA icons...');
const icon192 = createPng(192, 192, (x, y, w, h) => getSplitPayPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = createPng(512, 512, (x, y, w, h) => getSplitPayPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const iconMaskable = createPng(512, 512, (x, y, w, h) => getSplitPayPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);

const appleIcon = createPng(180, 180, (x, y, w, h) => getSplitPayPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

console.log('Done generating PWA icons!');
