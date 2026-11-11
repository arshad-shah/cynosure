import { describe, expect, it } from "vitest";
import { acceptsFile } from "../../src/components/FileDrop/FileDrop";

const f = (name: string, type: string) => new File([""], name, { type });

describe("acceptsFile", () => {
  it("accepts everything without a list", () => {
    expect(acceptsFile(f("a.exe", "application/x-msdownload"), undefined)).toBe(true);
    expect(acceptsFile(f("a.exe", ""), "")).toBe(true);
  });
  it("matches extensions, exact types and wildcards, ignoring case and spaces", () => {
    expect(acceptsFile(f("Photo.PNG", "image/png"), ".png")).toBe(true);
    expect(acceptsFile(f("doc.pdf", "application/pdf"), " image/*, application/pdf ")).toBe(true);
    expect(acceptsFile(f("a.webp", "image/webp"), "image/*")).toBe(true);
    expect(acceptsFile(f("a.txt", "text/plain"), ".png,image/*")).toBe(false);
    expect(acceptsFile(f("png", "text/plain"), ".png")).toBe(false);
  });
});
