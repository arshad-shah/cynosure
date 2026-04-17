import type { Meta, StoryObj } from '@storybook/react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { IconButton } from './IconButton.js';

const meta: Meta<typeof IconButton> = {
  title: 'Forms/IconButton',
  component: IconButton,
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
  },
};
export default meta;
type Story = StoryObj<typeof IconButton>;

const Search = (): React.ReactElement => (
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const Pencil = (): React.ReactElement => (
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
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const Trash = (): React.ReactElement => (
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
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

export const Playground: Story = {
  args: { icon: <Search />, label: 'Search', variant: 'ghost', size: 'md' },
};

export const Variants: Story = {
  render: () => (
    <Inline gap="3">
      <IconButton icon={<Search />} label="Search" variant="solid" />
      <IconButton icon={<Search />} label="Search" variant="soft" />
      <IconButton icon={<Search />} label="Search" variant="outline" />
      <IconButton icon={<Search />} label="Search" variant="ghost" />
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="3" align="center">
      <IconButton icon={<Search />} label="Search" size="xs" />
      <IconButton icon={<Search />} label="Search" size="sm" />
      <IconButton icon={<Search />} label="Search" size="md" />
      <IconButton icon={<Search />} label="Search" size="lg" />
      <IconButton icon={<Search />} label="Search" size="xl" />
    </Inline>
  ),
};

export const ColorSchemes: Story = {
  render: () => (
    <Stack gap="3">
      <Inline gap="3">
        <IconButton icon={<Search />} label="Search" colorScheme="accent" />
        <IconButton icon={<Search />} label="Search" colorScheme="neutral" />
        <IconButton icon={<Search />} label="Search" colorScheme="success" />
        <IconButton icon={<Search />} label="Search" colorScheme="warning" />
        <IconButton icon={<Trash />} label="Delete" colorScheme="danger" />
      </Inline>
      <Inline gap="3">
        <IconButton icon={<Search />} label="Search" variant="soft" colorScheme="accent" />
        <IconButton icon={<Search />} label="Search" variant="soft" colorScheme="neutral" />
        <IconButton icon={<Search />} label="Search" variant="soft" colorScheme="success" />
        <IconButton icon={<Search />} label="Search" variant="soft" colorScheme="warning" />
        <IconButton icon={<Trash />} label="Delete" variant="soft" colorScheme="danger" />
      </Inline>
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Inline gap="3">
      <IconButton icon={<Pencil />} label="Edit" />
      <IconButton icon={<Pencil />} label="Edit" disabled />
      <IconButton icon={<Pencil />} label="Edit" loading />
    </Inline>
  ),
};

export const Toolbar: Story = {
  render: () => (
    <Inline gap="1" padding="2" background="bg.subtle" borderRadius="md">
      <IconButton icon={<Pencil />} label="Edit" variant="ghost" />
      <IconButton icon={<Search />} label="Search" variant="ghost" />
      <IconButton icon={<Trash />} label="Delete" variant="ghost" colorScheme="danger" />
    </Inline>
  ),
};
