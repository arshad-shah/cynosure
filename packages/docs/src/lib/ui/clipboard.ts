const CLIPBOARD_COPIED_EVENT = 'cynosure:clipboard-copied';

function fireCopiedEvent(text: string): void {
  window.dispatchEvent(new CustomEvent(CLIPBOARD_COPIED_EVENT, { detail: { text } }));
}

async function writeWithClipboardApi(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function writeWithTextareaFallback(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  } finally {
    document.body.removeChild(textarea);
  }
  return ok;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  const viaApi = await writeWithClipboardApi(text);
  if (viaApi) {
    fireCopiedEvent(text);
    return true;
  }
  const viaFallback = writeWithTextareaFallback(text);
  if (viaFallback) {
    fireCopiedEvent(text);
    return true;
  }
  return false;
}
