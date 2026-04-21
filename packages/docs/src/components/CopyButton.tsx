import { Button } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

interface Props {
  code: string;
}

export default function CopyButton({ code }: Props) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      variant="ghost"
      colorScheme="neutral"
      size="xs"
      onClick={onClick}
      aria-label="Copy code"
      style={{ position: 'absolute', top: '0.5em', right: '0.5em', zIndex: 1 }}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}
