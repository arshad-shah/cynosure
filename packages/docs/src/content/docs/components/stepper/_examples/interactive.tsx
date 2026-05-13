import { Step, Stepper } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [step, setStep] = useState(2);
  return (
    <Stepper currentStep={step} interactive onStepChange={setStep}>
      <Step title="Account" />
      <Step title="Profile" />
      <Step title="Confirm" />
      <Step title="Done" />
    </Stepper>
  );
}
