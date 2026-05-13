import { Step, Stepper } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Stepper currentStep={1} size="sm">
        <Step title="Plan" />
        <Step title="Build" />
        <Step title="Ship" />
      </Stepper>
      <Stepper currentStep={1} size="md">
        <Step title="Plan" />
        <Step title="Build" />
        <Step title="Ship" />
      </Stepper>
      <Stepper currentStep={1} size="lg">
        <Step title="Plan" />
        <Step title="Build" />
        <Step title="Ship" />
      </Stepper>
    </div>
  );
}
