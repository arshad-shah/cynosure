import type { Meta, StoryObj } from '@storybook/react';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Slot } from './Slot.js';

interface FakeButtonProps extends ButtonHTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

const FakeButton = forwardRef<HTMLElement, FakeButtonProps>(function FakeButton(
  { asChild, style, ...rest },
  ref,
) {
  const Component = (asChild ? Slot : 'button') as 'button';
  return (
    <Component
      ref={ref as never}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.875rem',
        borderRadius: '0.5rem',
        background: '#111',
        color: '#fff',
        fontSize: '0.875rem',
        textDecoration: 'none',
        ...style,
      }}
      {...rest}
    />
  );
});

const meta: Meta<typeof FakeButton> = {
  title: 'Primitives/Slot',
  component: FakeButton,
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof FakeButton>;

export const AsButton: Story = {
  args: { children: 'Click me' },
};

export const AsAnchor: Story = {
  render: (args) => (
    <FakeButton asChild {...args}>
      <a href="https://example.com" target="_blank" rel="noreferrer">
        Visit docs ↗
      </a>
    </FakeButton>
  ),
};
