import { describe, expect, it } from 'vitest';
import { getOwnerDocument } from '../getOwnerDocument.js';

describe('getOwnerDocument', () => {
  it('returns the owning document for an element', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(getOwnerDocument(el)).toBe(document);
    document.body.removeChild(el);
  });

  it('falls back to the global document when node is null', () => {
    expect(getOwnerDocument(null)).toBe(document);
    expect(getOwnerDocument(undefined)).toBe(document);
  });
});
