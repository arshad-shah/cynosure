import { Button, Toaster, toast } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <Button variant="outline" onClick={() => toast('Plain message')}>
          Default
        </Button>
        <Button variant="outline" onClick={() => toast.success('Changes saved')}>
          Success
        </Button>
        <Button variant="outline" onClick={() => toast.error('Something went wrong')}>
          Error
        </Button>
        <Button variant="outline" onClick={() => toast.warning('Disk usage is high')}>
          Warning
        </Button>
        <Button variant="outline" onClick={() => toast.info('A new version is available')}>
          Info
        </Button>
      </div>
      <Toaster />
    </>
  );
}
