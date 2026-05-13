import { Button, Notification } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Notification
      title="Invitation pending"
      description="Ada Lovelace invited you to the Cynosure workspace."
      timestamp="5m ago"
      actions={
        <>
          <Button size="sm">Accept</Button>
          <Button size="sm" variant="ghost">
            Decline
          </Button>
        </>
      }
    />
  );
}
