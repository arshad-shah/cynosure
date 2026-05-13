import { Step, Stepper } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stepper currentStep={1}>
      <Step title="Account" description="Email and password" />
      <Step title="Profile" description="Name, avatar, and bio" />
      <Step title="Confirm" description="Review and finish" />
    </Stepper>
  );
}
