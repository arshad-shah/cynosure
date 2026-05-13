// Generates brand/favicon.ico, brand/apple-touch-icon.png, and brand/og-image.png
// from the SVG sources. Idempotent — safe to re-run. Outputs are committed so
// contributors don't need to run this to build.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(join(here, name));

// Encode an ICO from PNG buffers. ICO supports embedded PNGs natively; the
// container is a 6-byte ICONDIR + N × 16-byte ICONDIRENTRY + concatenated
// image data. Inlining this drops the `to-ico` → jimp → jpeg-js/url-regex/
// minimist transitive chain (5 high-severity advisories at last audit).
function pngsToIco(pngs) {
  const headerSize = 6 + 16 * pngs.length;
  const totalSize = pngs.reduce((sum, p) => sum + p.length, headerSize);
  const buf = Buffer.alloc(totalSize);
  buf.writeUInt16LE(0, 0); // reserved
  buf.writeUInt16LE(1, 2); // type: 1 = icon
  buf.writeUInt16LE(pngs.length, 4); // image count

  let offset = headerSize;
  for (let i = 0; i < pngs.length; i++) {
    const png = pngs[i];
    // Read width/height from the PNG IHDR chunk (bytes 16-23 are width+height as uint32 BE).
    const w = png.readUInt32BE(16);
    const h = png.readUInt32BE(20);
    const entry = 6 + i * 16;
    buf.writeUInt8(w >= 256 ? 0 : w, entry); // width (0 means 256)
    buf.writeUInt8(h >= 256 ? 0 : h, entry + 1); // height
    buf.writeUInt8(0, entry + 2); // colour palette
    buf.writeUInt8(0, entry + 3); // reserved
    buf.writeUInt16LE(1, entry + 4); // colour planes
    buf.writeUInt16LE(32, entry + 6); // bits per pixel
    buf.writeUInt32LE(png.length, entry + 8); // image size
    buf.writeUInt32LE(offset, entry + 12); // image offset
    png.copy(buf, offset);
    offset += png.length;
  }
  return buf;
}

async function buildFavicon() {
  const svg = read('cynosure-mark-favicon.svg');
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((s) =>
      sharp(svg, { density: 384 }).resize(s, s, { kernel: 'lanczos3' }).png().toBuffer(),
    ),
  );
  const ico = pngsToIco(pngs);
  writeFileSync(join(here, 'favicon.ico'), ico);
  console.log('wrote favicon.ico (16 + 32 + 48)');
}

async function buildAppleTouch() {
  // 180×180, dark rounded bg + full mark centered at 60% width.
  const composed = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1a1d2e"/>
          <stop offset="1" stop-color="#0b0d12"/>
        </linearGradient>
        <linearGradient id="ctr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f5f6fa"/>
          <stop offset="1" stop-color="#c77dff"/>
        </linearGradient>
      </defs>
      <rect width="180" height="180" fill="url(#bg)"/>
      <g transform="translate(36 36) scale(1.08)">
        <g fill="#c77dff">
          <rect x="46" y="2" width="8" height="8" rx="2"/>
          <rect x="46" y="90" width="8" height="8" rx="2"/>
          <rect x="2" y="46" width="8" height="8" rx="2"/>
          <rect x="90" y="46" width="8" height="8" rx="2"/>
        </g>
        <g fill="#8b9dff">
          <rect x="18" y="18" width="16" height="16" rx="4"/>
          <rect x="66" y="18" width="16" height="16" rx="4"/>
          <rect x="18" y="66" width="16" height="16" rx="4"/>
          <rect x="66" y="66" width="16" height="16" rx="4"/>
        </g>
        <rect x="36" y="36" width="28" height="28" rx="6" fill="url(#ctr)"/>
      </g>
    </svg>`;
  await sharp(Buffer.from(composed), { density: 512 })
    .resize(180, 180)
    .png()
    .toFile(join(here, 'apple-touch-icon.png'));
  console.log('wrote apple-touch-icon.png (180×180)');
}

async function buildOg() {
  // 1200×630 social card: mark + wordmark top-left, tagline bottom, decorative corner mark.
  const og = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
      <defs>
        <radialGradient id="bg" cx="75%" cy="30%" r="80%">
          <stop offset="0" stop-color="#2a1d4a"/>
          <stop offset="0.65" stop-color="#0b0d12"/>
        </radialGradient>
        <linearGradient id="ctr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f5f6fa"/>
          <stop offset="1" stop-color="#c77dff"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <!-- decorative oversized mark, clipped at corner, low opacity -->
      <g transform="translate(900 -120) scale(5)" opacity="0.1">
        <g fill="#c77dff">
          <rect x="46" y="2" width="8" height="8" rx="2"/>
          <rect x="2" y="46" width="8" height="8" rx="2"/>
        </g>
        <g fill="#8b9dff">
          <rect x="18" y="18" width="16" height="16" rx="4"/>
          <rect x="66" y="18" width="16" height="16" rx="4"/>
          <rect x="18" y="66" width="16" height="16" rx="4"/>
          <rect x="66" y="66" width="16" height="16" rx="4"/>
        </g>
        <rect x="36" y="36" width="28" height="28" rx="6" fill="#f5f6fa"/>
      </g>
      <!-- header: mark + wordmark -->
      <g transform="translate(72 72) scale(0.9)">
        <g fill="#c77dff">
          <rect x="46" y="2" width="8" height="8" rx="2"/>
          <rect x="46" y="90" width="8" height="8" rx="2"/>
          <rect x="2" y="46" width="8" height="8" rx="2"/>
          <rect x="90" y="46" width="8" height="8" rx="2"/>
        </g>
        <g fill="#8b9dff">
          <rect x="18" y="18" width="16" height="16" rx="4"/>
          <rect x="66" y="18" width="16" height="16" rx="4"/>
          <rect x="18" y="66" width="16" height="16" rx="4"/>
          <rect x="66" y="66" width="16" height="16" rx="4"/>
        </g>
        <rect x="36" y="36" width="28" height="28" rx="6" fill="url(#ctr)"/>
      </g>
      <text x="190" y="143" font-family="'Inter Tight', Inter, system-ui, sans-serif" font-weight="600" font-size="54" letter-spacing="-1.5" fill="#f5f6fa">cynosure</text>
      <!-- tagline -->
      <text x="72" y="470" font-family="'Inter Tight', Inter, system-ui, sans-serif" font-weight="700" font-size="64" letter-spacing="-2" fill="#f5f6fa">A gorgeous, tiny, accessible</text>
      <text x="72" y="540" font-family="'Inter Tight', Inter, system-ui, sans-serif" font-weight="700" font-size="64" letter-spacing="-2" fill="#f5f6fa">React UI framework.</text>
      <text x="72" y="582" font-family="Inter, system-ui, sans-serif" font-weight="500" font-size="22" fill="#a1a6bf">90+ components · WCAG 2.2 AA · pay for what you import</text>
    </svg>`;
  await sharp(Buffer.from(og), { density: 384 })
    .resize(1200, 630)
    .png()
    .toFile(join(here, 'og-image.png'));
  console.log('wrote og-image.png (1200×630)');
}

await buildFavicon();
await buildAppleTouch();
await buildOg();
