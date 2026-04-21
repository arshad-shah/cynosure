import { Alert, AlertDescription, AlertTitle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Alert status="warning">
      <AlertTitle>Storage almost full</AlertTitle>
      <AlertDescription>
        You have used 90% of your storage quota. Consider upgrading your plan.
      </AlertDescription>
    </Alert>
  );
}
