import type { Meta, StoryObj } from '@storybook/react';
import { Check, ChevronDown, Filter } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Chip } from './Chip.js';

const meta: Meta<typeof Chip> = {
  title: 'Feedback/Chip',
  component: Chip,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['solid', 'soft', 'outline', 'ghost'] },
    colorScheme: {
      control: 'select',
      options: ['accent', 'neutral', 'success', 'warning', 'danger', 'info'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md'] },
    shape: { control: 'select', options: ['default', 'pill', 'square'] },
  },
};
export default meta;
type Story = StoryObj<typeof Chip>;

const IconCheck = (): React.ReactElement => <Check size={12} strokeWidth={3} aria-hidden />;
const IconChevron = (): React.ReactElement => <ChevronDown size={12} aria-hidden />;
const IconFilter = (): React.ReactElement => <Filter size={12} aria-hidden />;

export const Playground: Story = {
  args: {
    children: 'Filter',
    variant: 'soft',
    colorScheme: 'neutral',
    size: 'md',
    shape: 'pill',
  },
};

export const WithIcons: Story = {
  name: 'With leftIcon / rightIcon',
  render: () => (
    <Inline gap="2" wrap>
      <Chip leftIcon={<IconFilter />} colorScheme="accent">
        Filter
      </Chip>
      <Chip rightIcon={<IconChevron />} variant="outline">
        Sort by
      </Chip>
      <Chip leftIcon={<IconCheck />} rightIcon={<IconChevron />} colorScheme="success">
        Active
      </Chip>
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="2" align="center">
      <Chip size="xs">xs</Chip>
      <Chip size="sm">sm</Chip>
      <Chip size="md">md</Chip>
    </Inline>
  ),
};

export const Variants: Story = {
  render: () => (
    <Inline gap="2" align="center">
      <Chip variant="solid" colorScheme="accent" selected>
        solid
      </Chip>
      <Chip variant="soft">soft</Chip>
      <Chip variant="outline">outline</Chip>
      <Chip variant="ghost">ghost</Chip>
    </Inline>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Inline gap="2">
      <Chip disabled>Disabled</Chip>
      <Chip disabled selected colorScheme="accent" variant="solid">
        Disabled selected
      </Chip>
      <Chip disabled onRemove={() => undefined}>
        Disabled + remove
      </Chip>
    </Inline>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · toggle pressed and remove fires',
  render: () => {
    function Demo(): React.ReactElement {
      const [selected, setSelected] = useState(false);
      const [open, setOpen] = useState(true);
      if (!open) return <span>Removed</span>;
      return (
        <Chip
          selected={selected}
          onSelectedChange={setSelected}
          onRemove={() => setOpen(false)}
          colorScheme="accent"
        >
          React
        </Chip>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Removable chip splits into a main toggle button + a remove button.
    const toggle = canvas.getByRole('button', { name: 'React' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Remove React' }));
    await expect(canvas.queryByRole('button', { name: 'React' })).not.toBeInTheDocument();
    await expect(canvas.getByText('Removed')).toBeInTheDocument();
  },
};
