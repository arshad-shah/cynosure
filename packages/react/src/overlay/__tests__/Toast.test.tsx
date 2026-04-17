import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Toaster, toast } from '../Toast/index.js';

describe('Toaster', () => {
  it('mounts a sonner region that can receive toasts', async () => {
    render(<Toaster />);
    toast('Hello');
    await waitFor(() => {
      const region = document.querySelector('[data-sonner-toaster]');
      expect(region).not.toBeNull();
    });
  });

  it('re-exports the toast function from sonner', () => {
    expect(typeof toast).toBe('function');
    expect(typeof toast.success).toBe('function');
    expect(typeof toast.error).toBe('function');
    expect(typeof toast.promise).toBe('function');
  });
});
