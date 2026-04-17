import { describe, expect, it } from 'vitest';
import { paginationRange } from '../shared/paginationRange.js';

describe('paginationRange', () => {
  it('returns the full list when total is below the ellipsis threshold', () => {
    expect(paginationRange({ totalPages: 5, currentPage: 2 })).toEqual([1, 2, 3, 4, 5]);
  });

  it('shows a single right-side ellipsis near the start of a long list', () => {
    expect(
      paginationRange({ totalPages: 20, currentPage: 3, siblingCount: 1, boundaryCount: 1 }),
    ).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20]);
  });

  it('shows a single left-side ellipsis near the end of a long list', () => {
    expect(
      paginationRange({ totalPages: 20, currentPage: 18, siblingCount: 1, boundaryCount: 1 }),
    ).toEqual([1, 'ellipsis-start', 16, 17, 18, 19, 20]);
  });

  it('shows two ellipses when current sits in the middle', () => {
    expect(
      paginationRange({ totalPages: 20, currentPage: 10, siblingCount: 1, boundaryCount: 1 }),
    ).toEqual([1, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 20]);
  });

  it('honours siblingCount and boundaryCount', () => {
    expect(
      paginationRange({ totalPages: 30, currentPage: 15, siblingCount: 2, boundaryCount: 2 }),
    ).toEqual([1, 2, 'ellipsis-start', 13, 14, 15, 16, 17, 'ellipsis-end', 29, 30]);
  });

  it('clamps an out-of-range currentPage', () => {
    expect(paginationRange({ totalPages: 5, currentPage: 99 })).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange({ totalPages: 5, currentPage: -3 })).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns an empty array when totalPages <= 0', () => {
    expect(paginationRange({ totalPages: 0, currentPage: 1 })).toEqual([]);
    expect(paginationRange({ totalPages: -5, currentPage: 1 })).toEqual([]);
  });
});
