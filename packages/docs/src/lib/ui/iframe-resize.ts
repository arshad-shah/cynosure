const DEFAULT_CHANNEL = 'default';
const MESSAGE_TYPE = 'cynosure:iframe-height';

type HeightMessage = {
  type: typeof MESSAGE_TYPE;
  channel: string;
  height: number;
};

function isHeightMessage(value: unknown): value is HeightMessage {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.type === MESSAGE_TYPE && typeof v.channel === 'string' && typeof v.height === 'number';
}

export function startIframeHeightReporter(opts: { channel?: string } = {}): () => void {
  const channel = opts.channel ?? DEFAULT_CHANNEL;

  const post = (): void => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }
    if (!window.parent || window.parent === window) return;
    const height = document.documentElement.scrollHeight;
    const message: HeightMessage = {
      type: MESSAGE_TYPE,
      channel,
      height,
    };
    window.parent.postMessage(message, '*');
  };

  const onLoad = (): void => {
    post();
  };

  if (document.readyState === 'complete') {
    post();
  } else {
    window.addEventListener('load', onLoad);
  }

  let observer: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => {
      post();
    });
    observer.observe(document.documentElement);
  }

  return () => {
    window.removeEventListener('load', onLoad);
    observer?.disconnect();
  };
}

export function subscribeIframeHeight(iframe: HTMLIFrameElement, channel: string): () => void {
  const handler = (event: MessageEvent): void => {
    if (!isHeightMessage(event.data)) return;
    if (event.data.channel !== channel) return;
    if (iframe.contentWindow && event.source !== iframe.contentWindow) return;
    iframe.style.height = `${event.data.height}px`;
  };
  window.addEventListener('message', handler);
  return () => {
    window.removeEventListener('message', handler);
  };
}
