import { useCallback } from 'react';
import { useControllableState } from './useControllableState.js';

export interface UseDisclosureParams {
  /** Controlled open state. */
  open?: boolean;
  /** Default open state for uncontrolled mode. */
  defaultOpen?: boolean;
  /** Fires whenever `open` changes. */
  onOpenChange?: (open: boolean) => void;
}

export interface UseDisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  setOpen: (value: boolean) => void;
}

/**
 * Open/close state primitive for dialogs, menus, drawers, and anything else
 * that flips between two states. Supports both controlled and uncontrolled
 * modes via {@link useControllableState}.
 */
export function useDisclosure({
  open,
  defaultOpen = false,
  onOpenChange,
}: UseDisclosureParams = {}): UseDisclosureReturn {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const onToggle = useCallback(() => setOpen((prev) => !prev), [setOpen]);

  return { isOpen, onOpen, onClose, onToggle, setOpen };
}
