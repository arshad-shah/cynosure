import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import type { PanelImperativeHandle } from 'react-resizable-panels';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { Resizable, ResizableHandle, ResizablePanel } from './Resizable.js';

const meta: Meta<typeof Resizable> = {
  title: 'Data Display/Resizable',
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
      padding: 'var(--lumen-space-4)',
      background: accent
        ? 'var(--lumen-color-accent-muted)'
        : 'var(--lumen-color-background-muted)',
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
  borderRadius: 'var(--lumen-radius-md)',
  overflow: 'hidden',
  border: '1px solid var(--lumen-color-border-default)',
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

export const IDELayout: Story = {
  name: 'Three-pane IDE layout',
  render: () => (
    <div style={{ ...CONTAINER_STYLE, height: 420 }}>
      <Resizable direction="horizontal">
        <ResizablePanel defaultSize={22} minSize={15} maxSize={40}>
          <Pane label="Files" accent>
            <Stack gap="1">
              <Text size="sm">▸ src</Text>
              <Text size="sm">▸ tests</Text>
              <Text size="sm">README.md</Text>
              <Text size="sm">package.json</Text>
            </Stack>
          </Pane>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={58}>
          <Resizable direction="vertical">
            <ResizablePanel defaultSize={70}>
              <Pane label="Editor">
                <pre
                  style={{
                    margin: 0,
                    fontFamily: 'var(--lumen-font-mono)',
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  {'function sum(a: number, b: number) {\n  return a + b;\n}\n'}
                </pre>
              </Pane>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30}>
              <Pane label="Terminal">
                <Text size="sm" style={{ fontFamily: 'var(--lumen-font-mono)' }}>
                  $ pnpm test — 42 passing
                </Text>
              </Pane>
            </ResizablePanel>
          </Resizable>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <Pane label="Outline">
            <Stack gap="1">
              <Text size="sm">function sum</Text>
              <Text size="sm">const add</Text>
              <Text size="sm">export default</Text>
            </Stack>
          </Pane>
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

export const NoHandleIndicator: Story = {
  name: 'Minimal (no grip)',
  render: () => (
    <div style={CONTAINER_STYLE}>
      <Resizable direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <Pane label="One" />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <Pane label="Two" accent />
        </ResizablePanel>
      </Resizable>
    </div>
  ),
};
