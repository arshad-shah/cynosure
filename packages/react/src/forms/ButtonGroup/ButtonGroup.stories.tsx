import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
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

export const Segmented: Story = {
  name: 'Segmented control pattern',
  render: () => {
    function Segmented(): React.ReactElement {
      const [active, setActive] = useState<'list' | 'grid' | 'board'>('list');
      return (
        <Stack gap="2">
          <ButtonGroup attached variant="outline">
            {(['list', 'grid', 'board'] as const).map((key) => (
              <Button
                key={key}
                variant={active === key ? 'solid' : 'outline'}
                onClick={() => setActive(key)}
                aria-pressed={active === key}
              >
                {key}
              </Button>
            ))}
          </ButtonGroup>
          <Text size="sm" color="fg.muted">
            Active: <strong>{active}</strong>
          </Text>
        </Stack>
      );
    }
    return <Segmented />;
  },
};

export const Overrides: Story = {
  name: 'Per-button overrides win over group context',
  render: () => (
    <ButtonGroup variant="soft" colorScheme="neutral">
      <Button>Inherits soft/neutral</Button>
      <Button colorScheme="success">Overrides color</Button>
      <Button variant="outline" colorScheme="danger">
        Overrides both
      </Button>
    </ButtonGroup>
  ),
};
