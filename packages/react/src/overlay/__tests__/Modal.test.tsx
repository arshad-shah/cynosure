import { describe, expect, it } from 'vitest';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../Dialog/index.js';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '../Modal/index.js';

describe('Modal aliases', () => {
  it('re-exports Dialog under the Modal name', () => {
    expect(Modal).toBe(Dialog);
    expect(ModalContent).toBe(DialogContent);
    expect(ModalHeader).toBe(DialogHeader);
    expect(ModalFooter).toBe(DialogFooter);
    expect(ModalTitle).toBe(DialogTitle);
    expect(ModalDescription).toBe(DialogDescription);
    expect(ModalTrigger).toBe(DialogTrigger);
  });
});
