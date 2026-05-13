import { Button, Toaster, toast } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <>
      <Button
        onClick={() =>
          toast('Moved to trash', {
            description: 'The item was archived. You can restore it within 30 days.',
            action: {
              label: 'Undo',
              onClick: () => toast.success('Restored'),
            },
          })
        }
      >
        Delete item
      </Button>
      <Toaster />
    </>
  );
}
