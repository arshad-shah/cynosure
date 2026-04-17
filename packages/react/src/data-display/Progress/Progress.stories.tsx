import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { Progress, ProgressCircle } from './Progress.js';

const meta: Meta<typeof Progress> = {
  title: 'Data Display/Progress',
  component: Progress,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    colorScheme: {
      control: 'select',
      options: ['accent', 'success', 'warning', 'danger', 'neutral'],
    },
    indeterminate: { control: 'boolean' },
    striped: { control: 'boolean' },
    animated: { control: 'boolean' },
    showValue: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Progress>;

export const Basic: Story = {
  args: { value: 60, size: 'md' },
  render: (args) => (
    <div style={{ width: 360 }}>
      <Progress {...args} />
    </div>
  ),
};

export const Determinate: Story = {
  render: () => (
    <Stack gap="3" width="360px">
      {[10, 33, 50, 67, 90, 100].map((v) => (
        <Stack key={v} gap="1">
          <Text size="sm" color="fg.muted">
            {v.toString()}%
          </Text>
          <Progress value={v} showValue />
        </Stack>
      ))}
    </Stack>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <Stack gap="3" width="360px">
      <Progress indeterminate label="Loading files" />
      <Progress indeterminate colorScheme="success" />
      <Progress indeterminate colorScheme="warning" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="4" width="360px">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Stack key={size} gap="1">
          <Text size="sm" color="fg.muted">
            size="{size}"
          </Text>
          <Progress size={size} value={60} />
        </Stack>
      ))}
    </Stack>
  ),
};

export const ColorSchemes: Story = {
  render: () => (
    <Stack gap="3" width="360px">
      {(['accent', 'success', 'warning', 'danger', 'neutral'] as const).map((scheme) => (
        <Stack key={scheme} gap="1">
          <Text size="sm" color="fg.muted">
            {scheme}
          </Text>
          <Progress colorScheme={scheme} value={70} />
        </Stack>
      ))}
    </Stack>
  ),
};

export const StripedAnimated: Story = {
  name: 'Striped + animated',
  render: () => (
    <Stack gap="3" width="360px">
      <Progress value={60} striped />
      <Progress value={60} striped animated />
      <Progress value={60} striped animated colorScheme="success" />
    </Stack>
  ),
};

export const WithLabel: Story = {
  name: 'With label + value',
  render: () => (
    <Stack gap="2" width="360px">
      <Inline justify="between">
        <Text size="sm" weight="medium">
          Upload progress
        </Text>
        <Text size="sm" color="fg.muted">
          12 of 20 files
        </Text>
      </Inline>
      <Progress value={60} showValue label="Upload progress" />
    </Stack>
  ),
};

export const Controlled: Story = {
  name: 'Controlled (animated)',
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState(0);
      const [running, setRunning] = useState(false);

      useEffect(() => {
        if (!running) return;
        const timer = setInterval(() => {
          setValue((v) => {
            if (v >= 100) {
              setRunning(false);
              return 100;
            }
            return v + 5;
          });
        }, 200);
        return () => {
          clearInterval(timer);
        };
      }, [running]);

      return (
        <Stack gap="3" width="360px">
          <Progress value={value} showValue />
          <Inline gap="2">
            <Button
              onClick={() => {
                setValue(0);
                setRunning(true);
              }}
              disabled={running}
            >
              Start
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRunning(false);
                setValue(0);
              }}
            >
              Reset
            </Button>
          </Inline>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

/* -------------------------------- Circle -------------------------------- */

type CircleStory = StoryObj<typeof ProgressCircle>;

export const Circle: CircleStory = {
  name: 'ProgressCircle — basic',
  render: () => (
    <Inline gap="4" align="center">
      <ProgressCircle value={25} />
      <ProgressCircle value={50} />
      <ProgressCircle value={75} />
      <ProgressCircle value={100} colorScheme="success" />
    </Inline>
  ),
};

export const CircleSizes: CircleStory = {
  name: 'ProgressCircle — sizes',
  render: () => (
    <Inline gap="4" align="center">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Stack key={size} gap="1" align="center">
          <ProgressCircle size={size} value={66} />
          <Text size="xs" color="fg.muted">
            {size}
          </Text>
        </Stack>
      ))}
    </Inline>
  ),
};

export const CircleWithLabel: CircleStory = {
  name: 'ProgressCircle — centered label',
  render: () => (
    <Inline gap="4" align="center">
      <ProgressCircle size="xl" value={72}>
        <Text size="sm" weight="bold">
          72%
        </Text>
      </ProgressCircle>
      <ProgressCircle size="xl" value={100} colorScheme="success">
        <Text size="sm" weight="bold">
          Done
        </Text>
      </ProgressCircle>
    </Inline>
  ),
};

export const CircleIndeterminate: CircleStory = {
  name: 'ProgressCircle — indeterminate',
  render: () => (
    <Inline gap="4" align="center">
      <ProgressCircle indeterminate />
      <ProgressCircle indeterminate size="lg" colorScheme="success" />
      <ProgressCircle indeterminate size="xl" colorScheme="danger" thickness={2} />
    </Inline>
  ),
};

export const CircleColorSchemes: CircleStory = {
  name: 'ProgressCircle — color schemes',
  render: () => (
    <Stack gap="4">
      <Heading level={3} size="sm">
        Each scheme at 66%
      </Heading>
      <Inline gap="4" align="center">
        {(['accent', 'success', 'warning', 'danger', 'neutral'] as const).map((scheme) => (
          <Stack key={scheme} gap="1" align="center">
            <ProgressCircle colorScheme={scheme} value={66} size="lg" />
            <Text size="xs" color="fg.muted">
              {scheme}
            </Text>
          </Stack>
        ))}
      </Inline>
    </Stack>
  ),
};
