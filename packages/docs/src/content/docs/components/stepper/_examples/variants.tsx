import { Step, Stepper } from '@arshad-shah/cynosure-react';

const IconCart = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const IconCard = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const IconCheck = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Stepper currentStep={1} variant="numbered">
        <Step title="Cart" />
        <Step title="Payment" />
        <Step title="Confirm" />
      </Stepper>
      <Stepper currentStep={1} variant="dots">
        <Step title="Cart" />
        <Step title="Payment" />
        <Step title="Confirm" />
      </Stepper>
      <Stepper currentStep={1} variant="lines">
        <Step title="Cart" />
        <Step title="Payment" />
        <Step title="Confirm" />
      </Stepper>
      <Stepper currentStep={1} variant="icons">
        <Step title="Cart" icon={<IconCart />} />
        <Step title="Payment" icon={<IconCard />} />
        <Step title="Confirm" icon={<IconCheck />} />
      </Stepper>
    </div>
  );
}
