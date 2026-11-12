import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { type QrLevel, qrMatrix, qrPath, qrToSvg } from "../../src/foundations/qr";

const rows = (m: boolean[][]) => m.map((r) => r.map((v) => (v ? "1" : "0")).join(""));
const hash = (m: boolean[][]) => createHash("sha256").update(rows(m).join("\n")).digest("hex").slice(0, 16);
const version = (m: boolean[][]) => (m.length - 17) / 4;

// Expected matrices come from the `qrcode` npm package (a widely used reference encoder) with the same mode, level
// and its own mask choice; only their SHA-256 is kept here. "HELLO WORLD" is written out in full.
const HELLO_WORLD_Q = [
  "111111100001001111111",
  "100000101100101000001",
  "101110100101101011101",
  "101110101111101011101",
  "101110101101001011101",
  "100000100100101000001",
  "111111101010101111111",
  "000000001101100000000",
  "010111101100111011010",
  "101111010000111101110",
  "001010110001001100000",
  "101101000101100011000",
  "110111111110111011111",
  "000000001000100101000",
  "111111100110011001111",
  "100000101010010010111",
  "101110101101001000111",
  "101110101011100010100",
  "101110100100001000011",
  "100000101110011100110",
  "111111100101000000010",
];

const REFERENCES: [value: string, level: QrLevel, version: number, hash: string][] = [
  ["01234567", "M", 1, "88ee0d88685d91c6"],
  ["https://cynosure.arshadshah.com", "M", 3, "dce60de94d8f4039"],
  ["héllo wörld ✓ 日本", "L", 2, "21adf88c962746ed"],
  [
    "https://cynosure.arshadshah.com/storybook/?path=/docs/components-qrcode--docs",
    "H",
    8,
    "f13299ac12acbc4f",
  ],
  ["3".repeat(400), "L", 8, "a1741e8cf5bf126e"],
  ["A".repeat(1000), "Q", 25, "90e976e673cecdef"],
  ["z".repeat(2953), "L", 40, "d32fc000f1cc1643"],
];

describe("qrMatrix", () => {
  it("matches the reference module for module (alphanumeric, version 1, level Q)", () => {
    expect(rows(qrMatrix("HELLO WORLD", { level: "Q" }))).toEqual(HELLO_WORLD_Q);
  });

  it.each(REFERENCES)("matches the reference for %#: level %s, version %i", (value, level, ver, expected) => {
    const m = qrMatrix(value, { level });
    expect(version(m)).toBe(ver);
    expect(hash(m)).toBe(expected);
  });

  it("uses the smallest version that holds the text, in its most compact mode", () => {
    // Capacities of version 1 at level M: 34 digits, 20 alphanumeric characters, 14 bytes.
    expect(version(qrMatrix("1".repeat(34)))).toBe(1);
    expect(version(qrMatrix("1".repeat(35)))).toBe(2);
    expect(version(qrMatrix("A".repeat(20)))).toBe(1);
    expect(version(qrMatrix("A".repeat(21)))).toBe(2);
    expect(version(qrMatrix("a".repeat(14)))).toBe(1);
    expect(version(qrMatrix("a".repeat(15)))).toBe(2);
    // UTF-8: "é" is two bytes.
    expect(version(qrMatrix("é".repeat(7)))).toBe(1);
    expect(version(qrMatrix("é".repeat(8)))).toBe(2);
  });

  it("needs a bigger symbol for a stronger level", () => {
    const sizes = (["L", "M", "Q", "H"] as const).map((level) => qrMatrix("x".repeat(100), { level }).length);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(sizes[3]).toBeGreaterThan(sizes[0] as number);
  });

  it("fills version 40 and refuses one byte more", () => {
    expect(version(qrMatrix("z".repeat(2953), { level: "L" }))).toBe(40);
    expect(() => qrMatrix("z".repeat(2954), { level: "L" })).toThrow(RangeError);
    expect(() => qrMatrix("z".repeat(1273), { level: "H" })).not.toThrow();
    expect(() => qrMatrix("z".repeat(1274), { level: "H" })).toThrow(RangeError);
  });

  it("draws the three finder patterns and the timing patterns", () => {
    const m = qrMatrix("https://cynosure.arshadshah.com");
    const n = m.length;
    const finder = ["1111111", "1000001", "1011101", "1011101", "1011101", "1000001", "1111111"];
    const at = (x: number, y: number) =>
      m.slice(y, y + 7).map((r) =>
        r
          .slice(x, x + 7)
          .map((v) => (v ? "1" : "0"))
          .join(""),
      );
    expect(at(0, 0)).toEqual(finder);
    expect(at(n - 7, 0)).toEqual(finder);
    expect(at(0, n - 7)).toEqual(finder);
    for (let i = 8; i < n - 8; i++) {
      expect(m[6]?.[i]).toBe(i % 2 === 0);
      expect(m[i]?.[6]).toBe(i % 2 === 0);
    }
  });

  it("takes a forced mask, and otherwise picks one", () => {
    const masks = Array.from({ length: 8 }, (_, mask) =>
      rows(qrMatrix("HELLO WORLD", { level: "Q", mask })).join(),
    );
    expect(new Set(masks).size).toBe(8);
    expect(masks).toContain(HELLO_WORLD_Q.join());
    expect(rows(qrMatrix("HELLO WORLD", { level: "Q", mask: 6 }))).toEqual(HELLO_WORLD_Q);
  });
});

describe("qrPath", () => {
  it("draws every dark module once, shifted by the quiet zone", () => {
    const m = qrMatrix("https://cynosure.arshadshah.com");
    const drawn = new Set<string>();
    for (const [, x, y, w] of qrPath(m, 4).matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g))
      for (let i = 0; i < Number(w); i++) {
        const key = `${Number(x) - 4 + i},${Number(y) - 4}`;
        expect(drawn.has(key)).toBe(false);
        drawn.add(key);
      }
    const dark = m.flatMap((r, y) => r.flatMap((v, x) => (v ? [`${x},${y}`] : [])));
    expect([...drawn].sort()).toEqual(dark.sort());
  });
});

describe("qrToSvg", () => {
  it("is a standalone, named, black-on-white SVG with the quiet zone in its viewBox", () => {
    const svg = qrToSvg("HELLO WORLD", { level: "Q", size: 128 });
    expect(svg).toContain('viewBox="0 0 29 29"');
    expect(svg).toContain('width="128px"');
    expect(svg).toContain('role="img" aria-label="QR code"');
    expect(svg).toContain('<rect width="29" height="29" fill="#fff"/>');
    expect(svg).toContain(`<path fill="#000" d="${qrPath(qrMatrix("HELLO WORLD", { level: "Q" }), 4)}"/>`);
  });

  it("takes colours, a label and a quiet zone, and escapes them", () => {
    const svg = qrToSvg("1", { quietZone: 2, label: 'Pay "Ada" & co', color: "navy", background: "ivory" });
    expect(svg).toContain('viewBox="0 0 25 25"');
    expect(svg).toContain('aria-label="Pay &quot;Ada&quot; &amp; co"');
    expect(svg).toContain('fill="navy"');
    expect(svg).toContain('fill="ivory"');
    // No size: the SVG fills what holds it.
    expect(svg).not.toMatch(/<svg[^>]*width=/);
  });
});
