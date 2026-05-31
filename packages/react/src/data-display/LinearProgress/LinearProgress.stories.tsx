import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { LinearProgress } from './LinearProgress.js';
import { LinearProgressBuffer } from './LinearProgressBuffer.js';
import { LinearProgressHeader } from './LinearProgressHeader.js';
import { LinearProgressIndicator } from './LinearProgressIndicator.js';
import { LinearProgressLabel } from './LinearProgressLabel.js';
import { LinearProgressMeta } from './LinearProgressMeta.js';
import { LinearProgressRoot } from './LinearProgressRoot.js';
import { LinearProgressSegment } from './LinearProgressSegment.js';
import { LinearProgressTrack } from './LinearProgressTrack.js';
import { LinearProgressValue } from './LinearProgressValue.js';

const meta: Meta<typeof LinearProgress> = {
  title: 'Data display/LinearProgress',
  component: LinearProgress,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    colorScheme: {
      control: 'select',
      options: ['accent', 'success', 'warning', 'danger', 'neutral'],
    },
    variant: { control: 'select', options: ['solid', 'ticked'] },
    indeterminate: { control: 'boolean' },
    showValue: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof LinearProgress>;

export const Basic: Story = {
  args: { value: 60, size: 'md' },
  render: (args) => (
    <div style={{ width: 360 }}>
      <LinearProgress {...args} />
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
          <LinearProgress value={v} showValue />
        </Stack>
      ))}
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
          <LinearProgress size={size} value={60} />
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
          <LinearProgress colorScheme={scheme} value={70} />
        </Stack>
      ))}
    </Stack>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <Stack gap="3" width="360px">
      <LinearProgress indeterminate label="Loading files" />
      <LinearProgress indeterminate colorScheme="success" />
      <LinearProgress indeterminate colorScheme="warning" />
    </Stack>
  ),
};

export const Buffered: Story = {
  name: 'Buffer (YouTube-style)',
  render: () => (
    <Stack gap="3" width="360px">
      <Text size="sm" color="fg.muted">
        A faint second bar behind the indicator tracks preloaded progress.
      </Text>
      <LinearProgress value={30} buffer={60} />
      <LinearProgress value={55} buffer={85} colorScheme="success" />
      <LinearProgress value={90} buffer={100} colorScheme="warning" />
    </Stack>
  ),
};

export const Stacked: Story = {
  name: 'Stacked / multi-value',
  render: () => (
    <Stack gap="3" width="360px">
      <LinearProgressHeader>
        <LinearProgressLabel>
          <Text size="sm" weight="medium">
            Disk usage
          </Text>
        </LinearProgressLabel>
        <LinearProgressMeta>
          <Text size="sm" color="fg.muted">
            75 of 100 GB
          </Text>
        </LinearProgressMeta>
      </LinearProgressHeader>
      <LinearProgress
        size="lg"
        segments={[
          { value: 40, colorScheme: 'accent', label: 'Photos' },
          { value: 25, colorScheme: 'warning', label: 'Videos' },
          { value: 10, colorScheme: 'neutral', label: 'Other' },
        ]}
      />
    </Stack>
  ),
};

export const UploadStyle: Story = {
  name: 'Upload — label + meta + value',
  render: () => (
    <Stack gap="2" width="420px">
      <LinearProgress
        value={12}
        max={20}
        label="Uploading files"
        meta="2.4 MB/s · 12s left"
        showValue
        formatValue={(v, m) => `${v.toString()} of ${m.toString()} files`}
      />
    </Stack>
  ),
};

export const Completion: Story = {
  name: 'Auto-detected completion',
  render: () => (
    <Stack gap="3" width="360px">
      <LinearProgress value={99} showValue />
      <LinearProgress value={100} showValue />
      <LinearProgress value={100} showValue completionState="none" />
    </Stack>
  ),
};

export const TickedVariant: Story = {
  name: 'Variant="ticked"',
  render: () => (
    <Stack gap="3" width="360px">
      <Text size="sm" color="fg.muted">
        Opt-in punch-card motif — faint tick marks every 10%.
      </Text>
      <LinearProgress variant="ticked" value={60} size="lg" />
      <LinearProgress variant="ticked" value={30} size="md" colorScheme="warning" />
    </Stack>
  ),
};

export const Compound: Story = {
  name: 'Compound primitives',
  render: () => (
    <Stack gap="3" width="420px">
      <Text size="sm" color="fg.muted">
        Break out to the primitives when you need custom layout — here, a buffer behind a
        determinate indicator with a custom footer.
      </Text>
      <LinearProgressRoot value={45} max={100} aria-label="Streaming">
        <LinearProgressHeader>
          <LinearProgressLabel>Streaming "Cynosure ep. 4"</LinearProgressLabel>
          <LinearProgressMeta>00:22 / 00:48</LinearProgressMeta>
        </LinearProgressHeader>
        <LinearProgressTrack>
          <LinearProgressBuffer value={78} />
          <LinearProgressIndicator />
        </LinearProgressTrack>
        <Inline justify="between">
          <Text size="xs" color="fg.muted">
            Buffered up to 78%
          </Text>
          <LinearProgressValue />
        </Inline>
      </LinearProgressRoot>

      <LinearProgressRoot max={100} aria-label="Quota breakdown">
        <LinearProgressTrack>
          <LinearProgressSegment value={32} colorScheme="accent" />
          <LinearProgressSegment value={18} colorScheme="warning" />
          <LinearProgressSegment value={8} colorScheme="danger" />
        </LinearProgressTrack>
      </LinearProgressRoot>
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
          <LinearProgress value={value} showValue />
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
