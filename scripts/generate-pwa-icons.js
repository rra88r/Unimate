const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// CRC32 table for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, getPixelRgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk("IHDR", ihdr);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }
  const idatChunk = makeChunk("IDAT", zlib.deflateSync(rawData));
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return dist(px, py, x1, y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist(px, py, x1 + t * (x2 - x1), y1 + t * (y2 - y1));
}

function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function renderUnimateIcon(size, isMaskable = false) {
  const radius = isMaskable ? 0 : size * 0.22;
  const cx = size / 2;
  const cy = size / 2;

  return createPng(size, size, (x, y) => {
    // 1. Squircle clipping
    if (!isMaskable) {
      const qx = Math.max(0, Math.abs(x - cx) - (cx - radius));
      const qy = Math.max(0, Math.abs(y - cy) - (cy - radius));
      if (Math.hypot(qx, qy) > radius) {
        return [0, 0, 0, 0];
      }
    }

    // 2. Gradient background (indigo-600 #4f46e5 to indigo-900 #312e81)
    const t = (x + y) / (2 * size);
    const rBase = Math.round(79 * (1 - t) + 49 * t);
    const gBase = Math.round(70 * (1 - t) + 46 * t);
    const bBase = Math.round(229 * (1 - t) + 129 * t);

    // 3. Graduation cap icon
    const s = size * (isMaskable ? 0.65 : 0.75);
    const topY = cy - s * 0.22;
    const midY = cy - s * 0.04;
    const botY = cy + s * 0.14;
    const leftX = cx - s * 0.38;
    const rightX = cx + s * 0.38;

    // Diamond cap
    const diamond = [
      [cx, topY],
      [rightX, midY],
      [cx, botY],
      [leftX, midY]
    ];

    // Cap neck/curve
    const skullCap = [
      [cx - s * 0.26, midY + s * 0.05],
      [cx - s * 0.26, botY + s * 0.04],
      [cx, botY + s * 0.18],
      [cx + s * 0.26, botY + s * 0.04],
      [cx + s * 0.26, midY + s * 0.05]
    ];

    const dDiamond = distToSegment(x, y, cx, topY, rightX, midY);
    const dEdge2 = distToSegment(x, y, rightX, midY, cx, botY);
    const dEdge3 = distToSegment(x, y, cx, botY, leftX, midY);
    const dEdge4 = distToSegment(x, y, leftX, midY, cx, topY);
    const minDiamondEdge = Math.min(dDiamond, dEdge2, dEdge3, dEdge4);

    // Tassel
    const tasselLine = distToSegment(x, y, rightX, midY, rightX + s * 0.04, botY + s * 0.12);
    const tasselBobble = dist(x, y, rightX + s * 0.04, botY + s * 0.15);

    const isCap = pointInPoly(x, y, diamond) || pointInPoly(x, y, skullCap);
    const strokeW = Math.max(1.5, size * 0.016);

    if (tasselLine < strokeW || tasselBobble < strokeW * 2) {
      return [255, 255, 255, 255];
    }

    if (isCap) {
      return [255, 255, 255, 255];
    }

    if (minDiamondEdge < 1.2) {
      const alpha = 1 - minDiamondEdge / 1.2;
      return [
        Math.round(255 * alpha + rBase * (1 - alpha)),
        Math.round(255 * alpha + gBase * (1 - alpha)),
        Math.round(255 * alpha + bBase * (1 - alpha)),
        255
      ];
    }

    return [rBase, gBase, bBase, 255];
  });
}

function createIco(pngBuffers) {
  // ICO format with PNG payloads
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4); // count

  let offset = 6 + count * 16;
  const dirEntries = [];
  const imageBuffers = [];

  for (const item of pngBuffers) {
    const { width, height, buffer } = item;
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit depth
    entry.writeUInt32LE(buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    imageBuffers.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

const outDir = path.join(__dirname, "..", "public", "icons");
const pubDir = path.join(__dirname, "..", "public");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log("Generating PWA icons...");

// 192x192
const p192 = renderUnimateIcon(192);
fs.writeFileSync(path.join(outDir, "icon-192x192.png"), p192);

// 512x512
const p512 = renderUnimateIcon(512);
fs.writeFileSync(path.join(outDir, "icon-512x512.png"), p512);

// 1024x1024 (iOS App Store & Universal Retina)
const p1024 = renderUnimateIcon(1024, true);
fs.writeFileSync(path.join(outDir, "icon-1024x1024.png"), p1024);

// iOS AppIcon.appiconset
const iosAppIconDir = path.join(__dirname, "..", "ios", "App", "App", "Assets.xcassets", "AppIcon.appiconset");
if (fs.existsSync(iosAppIconDir)) {
  fs.writeFileSync(path.join(iosAppIconDir, "AppIcon-512@2x.png"), p1024);
  console.log("Updated iOS AppIcon in Xcode assets!");
}

// 512x512 maskable (full bleed)
const p512Mask = renderUnimateIcon(512, true);
fs.writeFileSync(path.join(outDir, "icon-maskable-512x512.png"), p512Mask);

// Apple Touch Icons
const p180 = renderUnimateIcon(180);
fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), p180);
fs.writeFileSync(path.join(pubDir, "apple-touch-icon.png"), p180);

const p167 = renderUnimateIcon(167); // iPad Pro
fs.writeFileSync(path.join(outDir, "apple-touch-icon-167x167.png"), p167);

const p152 = renderUnimateIcon(152); // iPad
fs.writeFileSync(path.join(outDir, "apple-touch-icon-152x152.png"), p152);

const p120 = renderUnimateIcon(120); // iPhone Retina
fs.writeFileSync(path.join(outDir, "apple-touch-icon-120x120.png"), p120);

// Favicon ICO (16x16, 32x32, 48x48)
const p16 = renderUnimateIcon(16);
const p32 = renderUnimateIcon(32);
const p48 = renderUnimateIcon(48);
const icoBuf = createIco([
  { width: 16, height: 16, buffer: p16 },
  { width: 32, height: 32, buffer: p32 },
  { width: 48, height: 48, buffer: p48 }
]);
fs.writeFileSync(path.join(pubDir, "favicon.ico"), icoBuf);

console.log("All PWA and iOS icons generated successfully!");
