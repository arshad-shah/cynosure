import { Button, Toaster, toast } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <>
      <Button
        onClick={() =>
          toast.success('Invite sent', {
            description: 'alex@cynosure.app will receive an email shortly.',
          })
        }
      >
        Send invite
      </Button>
      <Toaster />
    </>
  );
}
