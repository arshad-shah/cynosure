import { Step, Stepper } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stepper currentStep={1}>
      <Step title="Account" />
      <Step title="Profile" status="error" description="Avatar upload failed" />
      <Step title="Confirm" />
    </Stepper>
  );
}
