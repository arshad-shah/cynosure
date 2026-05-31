import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Button } from '../Button/Button.js';
import { ButtonGroup } from './ButtonGroup.js';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Buttons/ButtonGroup',
  component: ButtonGroup,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button>Copy</Button>
      <Button>Paste</Button>
      <Button>Cut</Button>
    </ButtonGroup>
  ),
};

export const Attached: Story = {
  render: () => (
    <Stack gap="4">
      <ButtonGroup attached>
        <Button>Day</Button>
        <Button>Week</Button>
        <Button>Month</Button>
        <Button>Year</Button>
      </ButtonGroup>
      <ButtonGroup attached variant="outline">
        <Button>Left</Button>
        <Button>Center</Button>
        <Button>Right</Button>
      </ButtonGroup>
    </Stack>
  ),
};

export const SharedVariant: Story = {
  render: () => (
    <Stack gap="3">
      <ButtonGroup variant="soft" colorScheme="accent">
        <Button>Reply</Button>
        <Button>Forward</Button>
        <Button>Archive</Button>
      </ButtonGroup>
      <ButtonGroup variant="outline" size="sm">
        <Button>Small</Button>
        <Button>Small</Button>
        <Button>Small</Button>
      </ButtonGroup>
      <ButtonGroup variant="ghost" size="lg">
        <Button>Large</Button>
        <Button>Large</Button>
      </ButtonGroup>
    </Stack>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · group exposes role and clickable buttons',
  render: () => {
    let last = '';
    return (
      <ButtonGroup aria-label="Clipboard">
        {['Copy', 'Paste', 'Cut'].map((label) => (
          <Button
            key={label}
            onClick={(e) => {
              last = label;
              e.currentTarget.closest('[role="group"]')?.setAttribute('data-last', last);
            }}
          >
            {label}
          </Button>
        ))}
      </ButtonGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Clipboard' });
    await expect(group).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Paste' }));
    await expect(group).toHaveAttribute('data-last', 'Paste');
    await userEvent.click(canvas.getByRole('button', { name: 'Cut' }));
    await expect(group).toHaveAttribute('data-last', 'Cut');
  },
};
