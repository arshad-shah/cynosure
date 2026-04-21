import { type ReactNode, useState } from 'react';

interface Props {
  children: ReactNode;
  source: string;
  slug: string;
}

export default function PreviewFrame({ children, source, slug }: Props) {
  const [key, setKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div data-live-preview>
      <div data-live-preview-frame key={key}>
        {children}
      </div>
      <div data-live-preview-controls>
        <button type="button" onClick={onCopy} aria-label="Copy code">
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button type="button" onClick={() => setKey((k) => k + 1)} aria-label="Reset preview">
          Reset
        </button>
        <a href={`/preview/${slug}`} target="_blank" rel="noreferrer" aria-label="Open in new tab">
          Open
        </a>
      </div>
    </div>
  );
}
