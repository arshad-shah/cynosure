import { Alert, AlertDescription, AlertTitle, Button } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Alert status="warning" closable onClose={() => {}}>
      <AlertTitle>Session expiring</AlertTitle>
      <AlertDescription>Your session will expire in 5 minutes.</AlertDescription>
      <div style={{ marginTop: '0.5rem' }}>
        <Button variant="ghost" size="sm" onClick={() => {}}>
          Extend session
        </Button>
      </div>
    </Alert>
  );
}
