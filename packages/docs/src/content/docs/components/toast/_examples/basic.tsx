import { Button, Toaster, toast } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <>
      <Button onClick={() => toast('Saved successfully')}>Show toast</Button>
      <Toaster />
    </>
  );
}
