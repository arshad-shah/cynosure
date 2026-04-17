import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup.js';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Feedback/ToggleGroup',
  component: ToggleGroup,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['ghost', 'outline', 'solid'] },
    attached: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof ToggleGroup>;

const AlignLeft = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="18" y2="18" />
  </svg>
);

const AlignCenter = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const AlignRight = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="6" y1="18" x2="21" y2="18" />
  </svg>
);

const AlignJustify = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const ListIcon = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const GridIcon = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const BoldIcon = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 4h6a4 4 0 0 1 0 8H7z" />
    <path d="M7 12h7a4 4 0 0 1 0 8H7z" />
  </svg>
);

const ItalicIcon = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const UnderlineIcon = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 4v7a6 6 0 0 0 12 0V4" />
    <line x1="4" y1="20" x2="20" y2="20" />
  </svg>
);

export const Playground: Story = {
  render: () => (
    <ToggleGroup
      type="single"
      defaultValue={'left' as string}
      size="md"
      variant="outline"
      attached
      aria-label="Text alignment"
    >
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRight />
      </ToggleGroupItem>
      <ToggleGroupItem value="justify" aria-label="Justify">
        <AlignJustify />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const TextAlignment: Story = {
  name: 'Text alignment toolbar — single select',
  render: () => {
    function Demo(): React.ReactElement {
      const [align, setAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
      return (
        <Stack gap="3">
          <ToggleGroup
            type="single"
            value={align}
            onValueChange={(v) => {
              if (v) setAlign(v as typeof align);
            }}
            variant="outline"
            attached
            aria-label="Text alignment"
          >
            <ToggleGroupItem value="left" aria-label="Align left">
              <AlignLeft />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Align center">
              <AlignCenter />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Align right">
              <AlignRight />
            </ToggleGroupItem>
            <ToggleGroupItem value="justify" aria-label="Justify">
              <AlignJustify />
            </ToggleGroupItem>
          </ToggleGroup>
          <Text size="sm" color="fg.muted">
            Alignment: <strong>{align}</strong>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const ViewMode: Story = {
  name: 'View-mode switcher — list vs grid',
  render: () => {
    function Demo(): React.ReactElement {
      const [mode, setMode] = useState<'list' | 'grid'>('list');
      return (
        <Stack gap="3">
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => {
              if (v) setMode(v as typeof mode);
            }}
            variant="solid"
            attached
            aria-label="View mode"
          >
            <ToggleGroupItem value="list" aria-label="List view">
              <ListIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <GridIcon />
            </ToggleGroupItem>
          </ToggleGroup>
          <Text size="sm" color="fg.muted">
            View: <strong>{mode}</strong>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const FormattingToolbar: Story = {
  name: 'Multi-select formatting — bold / italic / underline',
  render: () => {
    function Demo(): React.ReactElement {
      const [values, setValues] = useState<string[]>(['bold']);
      return (
        <Stack gap="3">
          <ToggleGroup
            type="multiple"
            value={values}
            onValueChange={setValues}
            variant="ghost"
            aria-label="Text formatting"
          >
            <ToggleGroupItem value="bold" aria-label="Bold">
              <BoldIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <ItalicIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline">
              <UnderlineIcon />
            </ToggleGroupItem>
          </ToggleGroup>
          <Text size="sm" color="fg.muted">
            Active: <strong>{values.join(', ') || '(none)'}</strong>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Attached: Story = {
  name: 'Attached segmented control vs unattached',
  render: () => (
    <Stack gap="4">
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 96 }}>
          attached
        </Text>
        <ToggleGroup
          type="single"
          defaultValue="left"
          variant="outline"
          attached
          aria-label="Alignment attached"
        >
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 96 }}>
          detached
        </Text>
        <ToggleGroup
          type="single"
          defaultValue="left"
          variant="outline"
          aria-label="Alignment detached"
        >
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
      </Inline>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <ToggleGroup
          key={size}
          type="single"
          defaultValue="left"
          size={size}
          variant="outline"
          attached
          aria-label={`Alignment ${size}`}
        >
          <ToggleGroupItem value="left" size={size} aria-label="Align left">
            <AlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" size={size} aria-label="Align center">
            <AlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" size={size} aria-label="Align right">
            <AlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
      ))}
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3">
      {(['ghost', 'outline', 'solid'] as const).map((variant) => (
        <ToggleGroup
          key={variant}
          type="single"
          defaultValue="left"
          variant={variant}
          attached
          aria-label={`Alignment ${variant}`}
        >
          <ToggleGroupItem value="left" variant={variant} aria-label="Align left">
            <AlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" variant={variant} aria-label="Align center">
            <AlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" variant={variant} aria-label="Align right">
            <AlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
      ))}
    </Stack>
  ),
};
