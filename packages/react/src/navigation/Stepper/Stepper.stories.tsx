import type { Meta, StoryObj } from '@storybook/react';
import { type ReactElement, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
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

export const Interactive: Story = {
  name: 'Interactive — click to jump back',
  render: () => {
    function Demo(): ReactElement {
      const steps = [
        {
          title: 'Cart',
          description: 'Items ready',
          body: 'Review the items in your cart and apply any promo codes before continuing.',
        },
        {
          title: 'Shipping',
          description: 'Address captured',
          body: 'Confirm the shipping address and pick a delivery speed.',
        },
        {
          title: 'Payment',
          description: 'Enter card details',
          body: 'Add a payment method. You won’t be charged until you confirm the order.',
        },
        {
          title: 'Review',
          description: 'Confirm and place order',
          body: 'Double-check the order summary, then submit to charge your card.',
        },
      ];
      const [step, setStep] = useState(2);
      const isLast = step === steps.length - 1;
      const isFirst = step === 0;
      return (
        <Stack gap="6" style={{ maxWidth: 720 }}>
          <Stepper currentStep={step} interactive onStepChange={setStep}>
            {steps.map((s) => (
              <Step key={s.title} title={s.title} description={s.description} />
            ))}
          </Stepper>
          <Stack
            gap="2"
            style={{
              padding: 'var(--cynosure-space-5, 20px)',
              border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
              borderRadius: 'var(--cynosure-radius-md, 8px)',
              minHeight: 140,
            }}
          >
            <Inline align="center" justify="between">
              <Text size="lg" weight="semibold">
                {steps[step].title}
              </Text>
              <Text size="sm" color="fg.muted">
                Step {step + 1} of {steps.length}
              </Text>
            </Inline>
            <Text color="fg.muted">{steps[step].body}</Text>
          </Stack>
          <Inline gap="2" justify="end">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={isFirst}
            >
              Back
            </Button>
            <Button
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
              disabled={isLast}
            >
              {isLast ? 'Place order' : 'Continue'}
            </Button>
          </Inline>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · click a completed step to jump back',
  render: () => {
    function Demo(): ReactElement {
      const [step, setStep] = useState(2);
      const steps = ['Cart', 'Shipping', 'Payment', 'Review'];
      return (
        <Stepper currentStep={step} interactive onStepChange={setStep}>
          {steps.map((s) => (
            <Step key={s} title={s} />
          ))}
        </Stepper>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Step 3 (Payment) starts active.
    const payment = canvas.getByText('Payment').closest('li');
    await expect(payment).toHaveAttribute('aria-current', 'step');

    // Completed steps are rendered as buttons; click "Cart" to jump back.
    await userEvent.click(canvas.getByRole('button', { name: 'Cart' }));
    const cart = canvas.getByText('Cart').closest('li');
    await expect(cart).toHaveAttribute('aria-current', 'step');
    await expect(payment).not.toHaveAttribute('aria-current');
  },
};
