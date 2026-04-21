import { Alert, AlertDescription, AlertTitle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Alert status="danger">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>
        We could not process your request. Please try again later.
      </AlertDescription>
    </Alert>
  );
}
