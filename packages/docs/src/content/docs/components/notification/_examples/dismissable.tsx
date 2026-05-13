import { Notification } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <Notification
      title="Heads up"
      description="You can dismiss this notification once you've read it."
      onDismiss={() => setOpen(false)}
    />
  );
}
