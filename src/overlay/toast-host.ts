import { createContext } from "react";

/**
 * A modal Dialog makes everything outside it inert, the Toaster's region included. While a Dialog is open it lends the
 * Toaster a container inside itself (`register`), and the Toaster renders its region there: above the dialog in the
 * top layer and not inert. The latest registered container wins (nested dialogs). Kept apart from Toast so Dialog does
 * not pull Toast into its bundle.
 */
export interface ToastHostRegistry {
  register: (el: HTMLElement) => () => void;
}

export const ToastHostContext = createContext<ToastHostRegistry | null>(null);
