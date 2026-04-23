import { Button } from '@arshad-shah/cynosure-react';
import { ArrowRight, Download } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Button leftIcon={<Download size={16} />}>Download</Button>
      <Button rightIcon={<ArrowRight size={16} />}>Continue</Button>
      <Button
        leftIcon={<Download size={16} />}
        rightIcon={<ArrowRight size={16} />}
        variant="outline"
      >
        With both icons
      </Button>
    </div>
  );
}
