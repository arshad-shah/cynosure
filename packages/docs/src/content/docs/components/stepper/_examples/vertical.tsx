import { Step, Stepper } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stepper currentStep={1} orientation="vertical">
      <Step title="Account" description="Email and password" />
      <Step title="Profile" description="Name and avatar" />
      <Step title="Confirm" description="Review and finish" />
    </Stepper>
  );
}
