import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Button } from './Button.js';

const meta: Meta<typeof Button> = {
  title: 'Buttons/Button',
  component: Button,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'soft', 'outline', 'ghost', 'link'],
    },
    colorScheme: {
      control: 'select',
      options: ['accent', 'neutral', 'success', 'danger', 'warning'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['default', 'square', 'pill'] },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

const IconArrow = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconDownload = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconTrash = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

export const Playground: Story = {
  args: {
    children: 'Continue',
    variant: 'solid',
    colorScheme: 'accent',
    size: 'md',
    shape: 'default',
  },
};

export const Variants: Story = {
  render: () => (
    <Inline gap="3">
      <Button variant="solid">Solid</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </Inline>
  ),
};

export const ColorSchemes: Story = {
  render: () => (
    <Stack gap="3">
      {(['solid', 'soft', 'outline', 'ghost', 'link'] as const).map((variant) => (
        <Inline key={variant} gap="3">
          <Button variant={variant} colorScheme="accent">
            Accent
          </Button>
          <Button variant={variant} colorScheme="neutral">
            Neutral
          </Button>
          <Button variant={variant} colorScheme="success">
            Success
          </Button>
          <Button variant={variant} colorScheme="warning">
            Warning
          </Button>
          <Button variant={variant} colorScheme="danger">
            Danger
          </Button>
        </Inline>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="3" align="center">
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="md">md</Button>
      <Button size="lg">lg</Button>
      <Button size="xl">xl</Button>
    </Inline>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Inline gap="3" align="center">
      <Button shape="default">Default</Button>
      <Button shape="pill">Pill</Button>
      <Button shape="square" leftIcon={<IconTrash />} aria-label="delete" />
    </Inline>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Inline gap="3">
      <Button leftIcon={<IconDownload />}>Download</Button>
      <Button rightIcon={<IconArrow />}>Continue</Button>
      <Button leftIcon={<IconDownload />} rightIcon={<IconArrow />}>
        Both sides
      </Button>
      <Button variant="soft" colorScheme="danger" leftIcon={<IconTrash />}>
        Delete
      </Button>
    </Inline>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3">
      <Inline gap="3">
        <Button>Default</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
        <Button loading disabled>
          Loading + disabled
        </Button>
      </Inline>
      <Inline gap="3">
        <Button variant="outline">Default</Button>
        <Button variant="outline" disabled>
          Disabled
        </Button>
        <Button variant="outline" loading>
          Loading
        </Button>
      </Inline>
    </Stack>
  ),
};

export const AsChildLink: Story = {
  name: 'asChild — renders an <a>',
  render: () => (
    <Inline gap="3">
      <Button asChild>
        <a href="https://example.com" target="_blank" rel="noreferrer">
          Open docs ↗
        </a>
      </Button>
      <Button asChild variant="outline" rightIcon={<IconArrow />}>
        <a href="/pricing">Pricing</a>
      </Button>
    </Inline>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · click fires handler',
  render: () => {
    let count = 0;
    return (
      <Button
        onClick={(e) => {
          count += 1;
          e.currentTarget.setAttribute('data-clicks', String(count));
        }}
      >
        Continue
      </Button>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Continue' });
    await expect(button).not.toHaveAttribute('data-clicks');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('data-clicks', '1');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('data-clicks', '2');
  },
};
