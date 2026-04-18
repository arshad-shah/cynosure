import { type ReactNode, useEffect, useState } from 'react';
import { Portal } from '../../primitives/Portal.js';

const DEFAULT_ID = 'cynosure-portal';

/**
 * Thin wrapper around Cynosure's `Portal` that lazily mounts a default
 * `#cynosure-portal` container. Every overlay in Phase 09 uses its own
 * primitive's portal by default (Radix provides one), but consumers that
 * build custom overlays can reuse this to keep all portalled content
 * under a single, inspectable DOM node.
 */
export interface OverlayPortalProps {
  /** Explicit container overrides the default lookup. */
  container?: Element | DocumentFragment | (() => Element | DocumentFragment | null | undefined);
  /** Render inline instead of portalling (tests, SSR fallbacks). */
  disabled?: boolean;
  children: ReactNode;
}

const ensureDefaultContainer = (): HTMLElement | null => {
  if (typeof document === 'undefined') return null;
  let el = document.getElementById(DEFAULT_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = DEFAULT_ID;
    document.body.appendChild(el);
  }
  return el;
};

export function OverlayPortal({ container, disabled, children }: OverlayPortalProps) {
  const [defaultContainer, setDefaultContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (container) return;
    setDefaultContainer(ensureDefaultContainer());
  }, [container]);

  return (
    <Portal container={container ?? (() => defaultContainer)} disabled={disabled}>
      {children}
    </Portal>
  );
}
