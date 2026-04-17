// `Modal` is a naming alias for `Dialog`. Some consumers (and design systems)
// prefer the word "Modal"; aliasing costs nothing and keeps both dialects
// reachable from the same entry point. The underlying component is byte-for-byte
// identical — import from either name and you get the same module instance.
export {
  Dialog as Modal,
  DialogClose as ModalClose,
  DialogContent as ModalContent,
  DialogDescription as ModalDescription,
  DialogFooter as ModalFooter,
  DialogHeader as ModalHeader,
  DialogPortal as ModalPortal,
  DialogTitle as ModalTitle,
  DialogTrigger as ModalTrigger,
} from '../Dialog/Dialog.js';
export type {
  DialogContentProps as ModalContentProps,
  DialogDescriptionProps as ModalDescriptionProps,
  DialogFooterProps as ModalFooterProps,
  DialogHeaderProps as ModalHeaderProps,
  DialogTitleProps as ModalTitleProps,
} from '../Dialog/Dialog.js';
