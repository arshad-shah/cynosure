import { Alert, AlertDescription, AlertTitle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Alert status="success">
      <AlertTitle>Payment confirmed</AlertTitle>
      <AlertDescription>Your payment was processed successfully.</AlertDescription>
    </Alert>
  );
}
