import type { Meta, StoryObj } from '@storybook/react';
import { type ReactElement, useState } from 'react';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Step, Stepper } from './Stepper.js';

const meta: Meta<typeof Stepper> = {
  title: 'Navigation/Stepper',
  component: Stepper,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['numbered', 'dots', 'lines', 'icons'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    interactive: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Stepper>;

const IconCart = (): ReactElement => (
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
const IconCard = (): ReactElement => (
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
const IconCheck = (): ReactElement => (
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

export const Default: Story = {
  render: () => (
    <Stepper currentStep={1}>
      <Step title="Cart" />
      <Step title="Shipping" />
      <Step title="Payment" />
      <Step title="Review" />
    </Stepper>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="6">
      {(['numbered', 'dots', 'lines', 'icons'] as const).map((variant) => (
        <Stack key={variant} gap="2">
          <Text size="sm" color="fg.muted">
            variant="{variant}"
          </Text>
          <Stepper currentStep={2} variant={variant}>
            <Step title="Create" icon={variant === 'icons' ? <IconCart /> : undefined} />
            <Step title="Configure" icon={variant === 'icons' ? <IconCard /> : undefined} />
            <Step title="Deploy" icon={variant === 'icons' ? <IconCheck /> : undefined} />
            <Step title="Verify" icon={variant === 'icons' ? <IconCheck /> : undefined} />
          </Stepper>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Stack key={size} gap="2">
          <Text size="sm" color="fg.muted">
            size="{size}"
          </Text>
          <Stepper currentStep={1} size={size}>
            <Step title="Plan" />
            <Step title="Build" />
            <Step title="Ship" />
          </Stepper>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Statuses: Story = {
  name: 'Statuses — complete / active / pending / error',
  render: () => (
    <Stepper currentStep={2}>
      <Step title="Submitted" description="Step 1 complete" />
      <Step title="Validated" description="Step 2 complete" />
      <Step title="Processing" description="Takes up to 2 minutes" />
      <Step title="Flagged" description="A field needs review" status="error" />
      <Step title="Sent" description="Delivered to recipient" />
    </Stepper>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Stepper currentStep={1} orientation="vertical">
        <Step title="Account" description="Name, email, password" />
        <Step title="Profile" description="Tell us about your team" />
        <Step title="Integrations" description="Connect your tools" />
        <Step title="Invite" description="Bring your collaborators" />
      </Stepper>
    </div>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <Stepper currentStep={1}>
      <Step title="Choose plan" description="Free, Pro, or Enterprise" />
      <Step title="Add payment" description="Card or invoice" />
      <Step title="Invite teammates" description="Up to 5 on Pro" />
      <Step title="All set!" description="You're ready to go" />
    </Stepper>
  ),
};

export const Interactive: Story = {
  name: 'Interactive — click to jump back',
  render: () => {
    function Demo(): ReactElement {
      const [step, setStep] = useState(2);
      return (
        <Stack gap="4">
          <Stepper currentStep={step} interactive onStepChange={setStep}>
            <Step title="Cart" description="Items ready" />
            <Step title="Shipping" description="Address captured" />
            <Step title="Payment" description="Enter card details" />
            <Step title="Review" description="Confirm and place order" />
          </Stepper>
          <Inline gap="2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              disabled={step === 3}
            >
              Continue
            </Button>
            <Text size="sm" color="fg.muted">
              Step {step + 1} of 4
            </Text>
          </Inline>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const IconsVariant: Story = {
  name: 'Icons — custom marker per step',
  render: () => (
    <Stepper currentStep={1} variant="icons">
      <Step title="Cart" icon={<IconCart />} description="3 items" />
      <Step title="Payment" icon={<IconCard />} description="Visa ••• 4242" />
      <Step title="Done" icon={<IconCheck />} description="Order placed" />
    </Stepper>
  ),
};

export const CheckoutUseCase: Story = {
  name: 'Use case — multi-step form',
  render: () => {
    function Demo(): ReactElement {
      const [step, setStep] = useState(0);
      const steps = ['Details', 'Address', 'Payment', 'Review'];
      return (
        <Stack gap="4">
          <Stepper currentStep={step} interactive onStepChange={setStep}>
            {steps.map((s) => (
              <Step key={s} title={s} />
            ))}
          </Stepper>
          <div
            style={{
              minHeight: 120,
              padding: 16,
              border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
              borderRadius: 8,
            }}
          >
            <Text size="lg" weight="semibold">
              {steps[step]}
            </Text>
            <Text color="fg.muted">Form fields for "{steps[step]}" would go here.</Text>
          </div>
          <Inline gap="2" justify="end">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
              disabled={step === steps.length - 1}
            >
              {step === steps.length - 1 ? 'Submit' : 'Continue'}
            </Button>
          </Inline>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const LongLabels: Story = {
  name: 'Edge — long labels, vertical stepper',
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Stepper currentStep={2} orientation="vertical">
        <Step
          title="Initial consultation call"
          description="Understand the goals and validate the scope"
        />
        <Step
          title="Contract, statement of work, and kick-off logistics"
          description="Legal review + finance approval"
          status="complete"
        />
        <Step
          title="Discovery phase — stakeholder interviews"
          description="Three two-week cycles with design critiques at the end of each"
        />
        <Step title="Pilot rollout across the initial cohort" />
      </Stepper>
    </div>
  ),
};
