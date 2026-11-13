/**
 * `v` kept between `lo` and `hi` (a fraction, 0 to 1, by default). If `hi` is below `lo` (a box larger than its
 * bounds) it settles on `lo`.
 */
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(Math.max(v, lo), Math.max(lo, hi));

/**
 * Decimal places of `n`, exponent notation included: 0.05 has 2, 1e-7 has 7, 1.5e-7 has 8. Non-finite numbers have 0.
 */
export const decimals = (n: number) => {
  if (!Number.isFinite(n)) return 0;
  const [mantissa = "", exponent = "0"] = String(n).split("e");
  return Math.max(0, (mantissa.split(".")[1] ?? "").length - Number(exponent));
};

/**
 * `v` rounded to the most decimal places among `sources` (a step and the min it counts from), shedding floating-point
 * noise: `roundLike(0.1 + 0.2, 0.1)` is 0.3, `roundLike(3.5000000000000004, 1, 0.5)` is 3.5.
 */
export const roundLike = (v: number, ...sources: number[]) =>
  Number(v.toFixed(Math.min(100, Math.max(0, ...sources.map(decimals)))));

/**
 * `n` written out without exponent notation, as ARIA values and form fields expect: 1e-7 is "0.0000001". Numbers too
 * large or not finite keep `String(n)`.
 */
export const plainNumber = (n: number) =>
  Number.isFinite(n) && Math.abs(n) < 1e21 ? n.toFixed(Math.min(100, decimals(n))) : String(n);

/**
 * `v` moved to the nearest point of the step grid that starts at `origin` (`origin + k * step`), without
 * floating-point noise: `snapToStep(0.34, 0.1, 0)` is 0.3, `snapToStep(4.2, 1, 0.5)` is 4.5.
 */
export const snapToStep = (v: number, step: number, origin: number) =>
  roundLike(origin + Math.round((v - origin) / step) * step, step, origin);

/**
 * A number for `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, written out without exponent notation
 * (`plainNumber`) so screen readers read it; React types these attributes as numbers. Absent stays absent.
 */
export function ariaNumber(n: number): number;
export function ariaNumber(n: number | null | undefined): number | undefined;
export function ariaNumber(n: number | null | undefined) {
  return n == null ? undefined : (plainNumber(n) as unknown as number);
}
