import { createContext, useContext } from 'react';

export type FileUploadVariant = 'default' | 'card' | 'compact' | 'minimal';

export interface FileUploadContextValue {
  files: File[];
  disabled: boolean;
  accept?: string;
  multiple: boolean;
  inputId: string;
  variant: FileUploadVariant;
  openFileDialog: () => void;
  removeFile: (index: number) => void;
}

export const FileUploadContext = createContext<FileUploadContextValue | null>(null);

export function useFileUploadContext(): FileUploadContextValue {
  const ctx = useContext(FileUploadContext);
  if (!ctx) {
    throw new Error('FileUpload subcomponents must be used inside <FileUpload>.');
  }
  return ctx;
}
