import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import type { PanelImperativeHandle } from 'react-resizable-panels';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { Resizable, ResizableHandle, ResizablePanel } from './Resizable.js';

const meta: Meta<typeof Resizable> = {
  title: 'Data display/Resizable',
  component: Resizable,
  parameters: { layout: 'padded' },
  argTypes: {
    direction: { control: 'select', options: ['horizontal', 'vertical'] },
  },
};
export default meta;
type Story = StoryObj<typeof Resizable>;

const Pane = ({
  label,
  accent,
  children,
}: {
  label: string;
  accent?: boolean;
  children?: React.ReactNode;
}): React.ReactElement => (
  <Stack
    gap="2"
    style={{
      height: '100%',
      padding: 'var(--cynosure-space-4)',
      background: accent
        ? 'var(--cynosure-color-accent-muted)'
        : 'var(--cynosure-color-background-muted)',
    }}
  >
    <Heading level={4} size="xs">
      {label}
    </Heading>
    {children ?? (
      <Text size="sm" color="fg.muted">
        Drag the handle to resize this panel.
      </Text>
    )}
  </Stack>
);

const CONTAINER_STYLE: React.CSSProperties = {
  height: 320,
  borderRadius: 'var(--cynosure-radius-md)',
  overflow: 'hidden',
  border: '1px solid var(--cynosure-color-border-default)',
};

export const HorizontalSplit: Story = {
  name: 'Horizontal split',
  render: () => (
    <div style={CONTAINER_STYLE}>
      <Resizable direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <Pane label="Left" accent />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <Pane label="Right" />
        </ResizablePanel>
      </Resizable>
    </div>
  ),
};

export const VerticalSplit: Story = {
  name: 'Vertical split',
  render: () => (
    <div style={CONTAINER_STYLE}>
      <Resizable direction="vertical">
        <ResizablePanel defaultSize={50}>
          <Pane label="Top" accent />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <Pane label="Bottom" />
        </ResizablePanel>
      </Resizable>
    </div>
  ),
};

export const MinMaxConstraints: Story = {
  name: 'Min / max size constraints',
  render: () => (
    <div style={CONTAINER_STYLE}>
      <Resizable direction="horizontal">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          <Pane label="20 → 40 %" accent>
            <Text size="sm" color="fg.muted">
              Cannot shrink below 20% or exceed 40%.
            </Text>
          </Pane>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <Pane label="Flex" />
        </ResizablePanel>
      </Resizable>
    </div>
  ),
};

export const CollapsiblePanel: Story = {
  name: 'Collapsible panel',
  render: () => {
    function CollapsibleDemo(): React.ReactElement {
      const sidebarRef = useRef<PanelImperativeHandle | null>(null);
      return (
        <Stack gap="3">
          <Inline gap="2">
            <Button size="sm" onClick={() => sidebarRef.current?.collapse()}>
              Collapse sidebar
            </Button>
            <Button size="sm" variant="outline" onClick={() => sidebarRef.current?.expand()}>
              Expand sidebar
            </Button>
          </Inline>
          <div style={CONTAINER_STYLE}>
            <Resizable direction="horizontal">
              <ResizablePanel
                panelRef={sidebarRef}
                defaultSize={25}
                minSize={15}
                maxSize={40}
                collapsible
                collapsedSize={4}
              >
                <Pane label="Sidebar" accent />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={75}>
                <Pane label="Content" />
              </ResizablePanel>
            </Resizable>
          </div>
        </Stack>
      );
    }
    return <CollapsibleDemo />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · separator present, panel collapses',
  render: () => {
    function Demo(): React.ReactElement {
      const sidebarRef = useRef<PanelImperativeHandle | null>(null);
      return (
        <Stack gap="3">
          <Inline gap="2">
            <Button size="sm" onClick={() => sidebarRef.current?.collapse()}>
              Collapse sidebar
            </Button>
            <Button size="sm" variant="outline" onClick={() => sidebarRef.current?.expand()}>
              Expand sidebar
            </Button>
          </Inline>
          <div style={CONTAINER_STYLE}>
            <Resizable direction="horizontal">
              <ResizablePanel
                panelRef={sidebarRef}
                defaultSize={25}
                minSize={15}
                maxSize={40}
                collapsible
                collapsedSize={4}
              >
                <Pane label="Sidebar" accent />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={75}>
                <Pane label="Content" />
              </ResizablePanel>
            </Resizable>
          </div>
        </Stack>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The draggable handle is a focusable ARIA separator tracking the boundary.
    const handle = canvas.getByRole('separator');
    await expect(handle).toBeInTheDocument();
    await expect(Number(handle.getAttribute('aria-valuenow'))).toBeGreaterThan(20);

    await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }));
    await waitFor(() => {
      // Collapsing snaps the sidebar to its collapsedSize (4%).
      expect(Number(handle.getAttribute('aria-valuenow'))).toBeLessThan(10);
    });
  },
};
