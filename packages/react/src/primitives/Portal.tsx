import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Props for the SSR-safe `Portal` wrapper around `react-dom`'s `createPortal`.
 */
export interface PortalProps {
  /**
   * DOM element (or lazy getter returning one) to portal into. The getter
   * form is preferred so the lookup happens once the portal mounts — before
   * then the target element may not yet exist.
   * @default document.body
   */
  container?: Element | DocumentFragment | (() => Element | DocumentFragment | null | undefined);
  /**
   * When `true`, renders children inline instead of portalling — useful for
   * tests, SSR-only flows, or temporarily disabling the portal hop.
   */
  disabled?: boolean;
  /**
   * Subtree to render at the resolved container.
   */
  children: ReactNode;
}

const resolveContainer = (
  container: PortalProps['container'],
): Element | DocumentFragment | null => {
  if (typeof container === 'function') return container() ?? null;
  if (container) return container;
  if (typeof document === 'undefined') return null;
  return document.body;
};

/**
 * SSR-safe portal wrapper around `react-dom`'s `createPortal`. Renders `null`
 * on the server (and on the first client render, so hydration matches),
 * then portals into the resolved container on subsequent renders.
 */
export function Portal({ container, disabled, children }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (disabled) return <>{children}</>;
  if (!mounted) return null;

  const target = resolveContainer(container);
  if (!target) return null;
  return createPortal(children, target);
}
