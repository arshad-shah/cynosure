/**
 * QR code encoder (ISO/IEC 18004), pure and dependency-free: versions 1 to 40, levels L, M, Q and H, numeric,
 * alphanumeric or byte (UTF-8) mode, Reed–Solomon error correction, and the mask with the lowest standard penalty.
 * QRCode draws with it; it is also exported for pages without React (`qrMatrix`, `qrPath`, `qrToSvg`).
 */

/** Error correction level: how much of the code can be damaged or covered and still scan (L 7%, M 15%, Q 25%, H 30%). */
export type QrLevel = "L" | "M" | "Q" | "H";

export interface QrOptions {
  /** Error correction level. Default "M". */
  level?: QrLevel;
  /** Forces one of the eight mask patterns (0 to 7). Default: the one with the lowest penalty, as the standard asks. */
  mask?: number;
}

const LEVELS = "LMQH";
// Format bits of each level, in the order of LEVELS.
const FORMAT = [1, 0, 3, 2];
// Error correction codewords per block, by level then version (index 0 unused). Strings keep the bundle small.
const ECC_PER_BLOCK = [
  "0 7 10 15 20 26 18 20 24 30 18 20 24 26 30 22 24 28 30 28 28 28 28 30 30 26 28 30 30 30 30 30 30 30 30 30 30 30 30 30 30",
  "0 10 16 26 18 24 16 18 22 22 26 30 22 22 24 24 28 28 26 26 26 26 28 28 28 28 28 28 28 28 28 28 28 28 28 28 28 28 28 28 28",
  "0 13 22 18 26 18 24 18 22 20 24 28 26 24 20 30 24 28 28 26 30 28 30 30 30 30 28 30 30 30 30 30 30 30 30 30 30 30 30 30 30",
  "0 17 28 22 16 22 28 26 26 24 28 24 28 22 24 24 30 28 28 26 28 30 24 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30",
].map((row) => row.split(" ").map(Number));
// Number of error correction blocks, by level then version (index 0 unused).
const BLOCKS = [
  "0 1 1 1 1 1 2 2 2 2 4 4 4 4 4 6 6 6 6 7 8 8 9 9 10 12 12 12 13 14 15 16 17 18 19 19 20 21 22 24 25",
  "0 1 1 1 2 2 4 4 4 5 5 5 8 9 9 10 10 11 13 14 16 17 17 18 20 21 23 25 26 28 29 31 33 35 37 38 40 43 45 47 49",
  "0 1 1 2 2 4 4 6 6 8 8 8 10 12 16 12 17 16 18 21 20 23 23 25 27 29 34 34 35 38 40 43 45 48 51 53 56 59 62 65 68",
  "0 1 1 2 4 4 4 5 6 8 8 11 11 16 16 18 16 19 21 25 25 25 34 30 32 35 37 40 42 45 48 51 54 57 60 63 66 70 74 77 81",
].map((row) => row.split(" ").map(Number));
const ALPHANUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

/** Modules left for data and error correction once the function patterns are drawn. */
function rawModules(ver: number): number {
  let n = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const align = Math.floor(ver / 7) + 2;
    n -= (25 * align - 10) * align - 55;
    if (ver >= 7) n -= 36;
  }
  return n;
}

const dataCodewords = (ver: number, lvl: number) =>
  Math.floor(rawModules(ver) / 8) - (ECC_PER_BLOCK[lvl]?.[ver] ?? 0) * (BLOCKS[lvl]?.[ver] ?? 0);

/** Multiplication in GF(2^8) modulo x^8 + x^4 + x^3 + x^2 + 1. */
function gfMul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

/** Reed–Solomon generator polynomial of the given degree (leading term left out). */
function rsDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMul(result[j] as number, root) ^ (j + 1 < degree ? (result[j + 1] as number) : 0);
    }
    root = gfMul(root, 2);
  }
  return result;
}

function rsRemainder(data: number[], divisor: number[]): number[] {
  const result = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => {
      result[i] = (result[i] as number) ^ gfMul(coef, factor);
    });
  }
  return result;
}

/** Splits data into blocks, adds error correction to each and interleaves them. */
function interleave(data: number[], ver: number, lvl: number): number[] {
  const count = BLOCKS[lvl]?.[ver] as number;
  const eccLen = ECC_PER_BLOCK[lvl]?.[ver] as number;
  const raw = Math.floor(rawModules(ver) / 8);
  const short = count - (raw % count);
  const shortLen = Math.floor(raw / count);
  const divisor = rsDivisor(eccLen);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < count; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < short ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, divisor);
    if (i < short) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const result: number[] = [];
  for (let i = 0; i < shortLen + 1; i++)
    blocks.forEach((block, j) => {
      if (i !== shortLen - eccLen || j >= short) result.push(block[i] as number);
    });
  return result;
}

/** Picks the most compact single mode for the whole text, and its data bits (without the header). */
function encodeData(text: string): { mode: number; count: number; bits: number[]; widths: number[] } {
  const bits: number[] = [];
  const put = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  if (/^\d*$/.test(text)) {
    for (let i = 0; i < text.length; i += 3) {
      const chunk = text.slice(i, i + 3);
      put(Number(chunk), chunk.length * 3 + 1);
    }
    return { mode: 1, count: text.length, bits, widths: [10, 12, 14] };
  }
  if ([...text].every((c) => ALPHANUMERIC.includes(c))) {
    for (let i = 0; i < text.length; i += 2) {
      const a = ALPHANUMERIC.indexOf(text[i] as string);
      if (i + 1 < text.length) put(a * 45 + ALPHANUMERIC.indexOf(text[i + 1] as string), 11);
      else put(a, 6);
    }
    return { mode: 2, count: text.length, bits, widths: [9, 11, 13] };
  }
  const bytes = new TextEncoder().encode(text);
  for (const b of bytes) put(b, 8);
  return { mode: 4, count: bytes.length, bits, widths: [8, 16, 16] };
}

/** The masks, by number: true where a data module is flipped. `x` is the column, `y` the row. */
const MASKS: ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

/** Penalty of a finished symbol: runs, 2×2 blocks, finder-like patterns and dark/light balance (ISO/IEC 18004 7.8.3). */
function penalty(m: boolean[][]): number {
  const size = m.length;
  let points = 0;
  let dark = 0;
  for (let i = 0; i < size; i++) {
    let runRow = 0;
    let runCol = 0;
    let bitsRow = 0;
    let bitsCol = 0;
    for (let j = 0; j < size; j++) {
      const row = m[i]?.[j] as boolean;
      const col = m[j]?.[i] as boolean;
      if (row) dark++;
      // Runs of five or more modules of one colour, along rows and columns.
      if (j > 0 && row === m[i]?.[j - 1]) runRow++;
      else {
        if (runRow >= 5) points += runRow - 2;
        runRow = 1;
      }
      if (j > 0 && col === m[j - 1]?.[i]) runCol++;
      else {
        if (runCol >= 5) points += runCol - 2;
        runCol = 1;
      }
      // 1:1:3:1:1 finder-like patterns with four light modules on one side.
      bitsRow = ((bitsRow << 1) & 0x7ff) | (row ? 1 : 0);
      bitsCol = ((bitsCol << 1) & 0x7ff) | (col ? 1 : 0);
      if (j >= 10) {
        if (bitsRow === 0x5d0 || bitsRow === 0x05d) points += 40;
        if (bitsCol === 0x5d0 || bitsCol === 0x05d) points += 40;
      }
      // 2×2 blocks of one colour.
      if (
        i < size - 1 &&
        j < size - 1 &&
        row === m[i]?.[j + 1] &&
        row === m[i + 1]?.[j] &&
        row === m[i + 1]?.[j + 1]
      )
        points += 3;
    }
    if (runRow >= 5) points += runRow - 2;
    if (runCol >= 5) points += runCol - 2;
  }
  return points + Math.abs(Math.ceil((dark * 100) / (size * size) / 5) - 10) * 10;
}

/**
 * The modules of a QR code for `value`, as rows of booleans (true is dark), without the quiet zone. The smallest
 * version that holds the text is used; numeric and alphanumeric text use their compact modes, anything else is
 * UTF-8 bytes. Throws a RangeError when the text does not fit in version 40 at this level.
 */
export function qrMatrix(value: string, { level = "M", mask }: QrOptions = {}): boolean[][] {
  const lvl = Math.max(0, LEVELS.indexOf(level));
  const seg = encodeData(value);
  let ver = 1;
  let used = 0;
  for (; ; ver++) {
    if (ver > 40) throw new RangeError("The value is too long for a QR code at this error correction level.");
    const width = seg.widths[ver < 10 ? 0 : ver < 27 ? 1 : 2] as number;
    used = 4 + width + seg.bits.length;
    if (seg.count < 2 ** width && used <= dataCodewords(ver, lvl) * 8) break;
  }
  const capacity = dataCodewords(ver, lvl) * 8;
  const bits: number[] = [];
  const put = (v: number, n: number) => {
    for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1);
  };
  put(seg.mode, 4);
  put(seg.count, seg.widths[ver < 10 ? 0 : ver < 27 ? 1 : 2] as number);
  bits.push(...seg.bits);
  put(0, Math.min(4, capacity - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) put(pad, 8);
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8)
    codewords.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  const data = interleave(codewords, ver, lvl);

  const size = ver * 4 + 17;
  const modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const set = (x: number, y: number, dark: boolean) => {
    (modules[y] as boolean[])[x] = dark;
    (reserved[y] as boolean[])[x] = true;
  };

  // Timing patterns, then finders (with their separators) over them, then alignment patterns.
  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [
    [3, 3],
    [size - 4, 3],
    [3, size - 4],
  ] as const)
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, dist !== 2 && dist !== 4);
      }
  const align: number[] = [];
  if (ver > 1) {
    const count = Math.floor(ver / 7) + 2;
    const step = Math.floor((ver * 8 + count * 3 + 5) / (count * 4 - 4)) * 2;
    for (let pos = size - 7; align.length < count - 1; pos -= step) align.unshift(pos);
    align.unshift(6);
  }
  // Alignment patterns everywhere on the grid except over the three finders.
  const last = align.length - 1;
  align.forEach((ax, i) => {
    align.forEach((ay, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    });
  });

  const drawFormat = (msk: number) => {
    const fmt = ((FORMAT[lvl] as number) << 3) | msk;
    let rem = fmt;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits15 = ((fmt << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((bits15 >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6));
    set(8, 8, bit(7));
    set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, true);
  };
  drawFormat(0);
  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits18 = (ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const dark = ((bits18 >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      set(a, b, dark);
      set(b, a, dark);
    }
  }

  // Data in two-module columns, zigzagging up and down from the bottom right, skipping the vertical timing pattern.
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++)
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
        if (!reserved[y]?.[x] && i < data.length * 8) {
          (modules[y] as boolean[])[x] = (((data[i >>> 3] as number) >>> (7 - (i & 7))) & 1) === 1;
          i++;
        }
      }
  }

  const applyMask = (msk: number) => {
    const flip = MASKS[msk] as (x: number, y: number) => boolean;
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++)
        if (!reserved[y]?.[x] && flip(x, y)) (modules[y] as boolean[])[x] = !modules[y]?.[x];
  };
  let chosen = mask !== undefined && mask >= 0 && mask < 8 ? Math.floor(mask) : -1;
  if (chosen < 0) {
    let best = Number.POSITIVE_INFINITY;
    for (let msk = 0; msk < 8; msk++) {
      applyMask(msk);
      drawFormat(msk);
      const score = penalty(modules);
      if (score < best) {
        best = score;
        chosen = msk;
      }
      applyMask(msk);
    }
  }
  applyMask(chosen);
  drawFormat(chosen);
  return modules;
}

/**
 * SVG path data for a matrix: one `M x y h w v1 h-w z` rectangle per horizontal run of dark modules, one unit per
 * module, shifted by `quietZone` modules so the path sits in a `viewBox` of `size + 2 × quietZone`.
 */
export function qrPath(matrix: boolean[][], quietZone = 4): string {
  let d = "";
  matrix.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (!row[x]) continue;
      let w = 1;
      while (row[x + w]) w++;
      d += `M${x + quietZone} ${y + quietZone}h${w}v1h-${w}z`;
      x += w;
    }
  });
  return d;
}

export interface QrToSvgOptions extends QrOptions {
  /** Light modules around the code, which scanners need (the standard asks for 4). Default 4. */
  quietZone?: number;
  /** Width and height: a number of pixels or any CSS length. Default: none (the SVG fills what holds it). */
  size?: number | string;
  /** Accessible name. Default "QR code". */
  label?: string;
  /** Colour of the dark modules. Default black. */
  color?: string;
  /** Colour of the light modules and the quiet zone. Default white. */
  background?: string;
}

const escapeAttr = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * A QR code as a standalone SVG string, for pages without React and for files (an email, a print, a download). Its
 * colours are written into it, so it scans without the Cynosure stylesheet; black on white unless `color` and
 * `background` say otherwise.
 */
export function qrToSvg(
  value: string,
  {
    quietZone = 4,
    size,
    label = "QR code",
    color = "#000",
    background = "#fff",
    ...options
  }: QrToSvgOptions = {},
): string {
  const matrix = qrMatrix(value, options);
  const q = Math.max(0, Math.floor(quietZone));
  const box = matrix.length + q * 2;
  const length = typeof size === "number" ? `${size}px` : size;
  const dims = length ? ` width="${escapeAttr(length)}" height="${escapeAttr(length)}"` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}"${dims} shape-rendering="crispEdges" ` +
    `role="img" aria-label="${escapeAttr(label)}"><rect width="${box}" height="${box}" fill="${escapeAttr(background)}"/>` +
    `<path fill="${escapeAttr(color)}" d="${qrPath(matrix, q)}"/></svg>`
  );
}
