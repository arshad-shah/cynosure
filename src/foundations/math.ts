/**
 * `v` kept between `lo` and `hi` (a fraction, 0 to 1, by default). If `hi` is below `lo` (a box larger than its
 * bounds) it settles on `lo`.
 */
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(Math.max(v, lo), Math.max(lo, hi));
