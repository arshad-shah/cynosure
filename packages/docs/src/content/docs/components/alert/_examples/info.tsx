import { Alert, AlertDescription, AlertTitle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Alert status="info">
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>This is an informational alert. No action needed.</AlertDescription>
    </Alert>
  );
}
