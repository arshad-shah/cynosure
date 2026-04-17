import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Tag } from './Tag.js';

const meta: Meta<typeof Tag> = {
  title: 'Feedback/Tag',
  component: Tag,
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
type Story = StoryObj<typeof Tag>;

const IconHash = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

export const Playground: Story = {
  args: {
    children: 'design',
    variant: 'soft',
    colorScheme: 'neutral',
    size: 'md',
    shape: 'pill',
  },
};

export const Static: Story = {
  name: 'Static labels (no handlers)',
  render: () => (
    <Inline gap="2">
      <Tag>design</Tag>
      <Tag colorScheme="accent">engineering</Tag>
      <Tag colorScheme="success">shipped</Tag>
      <Tag colorScheme="warning">WIP</Tag>
      <Tag colorScheme="danger">blocked</Tag>
      <Tag icon={<IconHash />}>hashtag</Tag>
    </Inline>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Inline gap="2" align="center">
      <Tag shape="default">default</Tag>
      <Tag shape="pill">pill</Tag>
      <Tag shape="square">square</Tag>
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="2" align="center">
      <Tag size="xs">xs</Tag>
      <Tag size="sm">sm</Tag>
      <Tag size="md">md</Tag>
    </Inline>
  ),
};

export const Interactive: Story = {
  name: 'Interactive — whole tag becomes a button via onClick',
  render: () => {
    function Demo(): React.ReactElement {
      const [last, setLast] = useState<string | null>(null);
      const items = ['design', 'engineering', 'marketing', 'sales'];
      return (
        <Stack gap="3">
          <Inline gap="2">
            {items.map((item) => (
              <Tag
                key={item}
                colorScheme={item === last ? 'accent' : 'neutral'}
                variant={item === last ? 'solid' : 'soft'}
                onClick={() => setLast(item)}
              >
                {item}
              </Tag>
            ))}
          </Inline>
          <Text size="sm" color="fg.muted">
            Last clicked: <strong>{last ?? '(none)'}</strong>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Removable: Story = {
  name: 'Removable — onRemove renders the × button',
  render: () => {
    function Demo(): React.ReactElement {
      const [tags, setTags] = useState([
        'typescript',
        'react',
        'vanilla-extract',
        'radix',
        'storybook',
      ]);
      const remove = (t: string): void => setTags((xs) => xs.filter((x) => x !== t));
      return (
        <Stack gap="3">
          <Inline gap="2">
            {tags.map((t) => (
              <Tag
                key={t}
                colorScheme="accent"
                variant="soft"
                onRemove={() => remove(t)}
                removeLabel={`Remove ${t} tag`}
              >
                {t}
              </Tag>
            ))}
          </Inline>
          {tags.length === 0 ? (
            <Text size="sm" color="fg.muted">
              All tags removed. Refresh the story to reset.
            </Text>
          ) : null}
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const KeyboardRemoval: Story = {
  name: 'Keyboard removal — focus a tag and press Backspace / Delete',
  render: () => {
    function Demo(): React.ReactElement {
      const [tags, setTags] = useState(['alpha', 'beta', 'gamma', 'delta', 'epsilon']);
      const remove = (t: string): void => setTags((xs) => xs.filter((x) => x !== t));
      return (
        <Stack gap="3">
          <Text size="sm" color="fg.muted">
            Tip: Tab to a tag, then press Backspace or Delete.
          </Text>
          <Inline gap="2">
            {tags.map((t) => (
              <Tag key={t} colorScheme="neutral" variant="outline" onRemove={() => remove(t)}>
                {t}
              </Tag>
            ))}
          </Inline>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const ClickAndRemove: Story = {
  name: 'Click + remove — label is a button, × is a second button',
  render: () => {
    function Demo(): React.ReactElement {
      const [selected, setSelected] = useState<string | null>(null);
      const [tags, setTags] = useState(['Sarah', 'Jordan', 'Alex', 'Priya']);
      const remove = (t: string): void => {
        setTags((xs) => xs.filter((x) => x !== t));
        if (selected === t) setSelected(null);
      };
      return (
        <Stack gap="3">
          <Inline gap="2">
            {tags.map((t) => (
              <Tag
                key={t}
                variant={selected === t ? 'solid' : 'soft'}
                colorScheme={selected === t ? 'accent' : 'neutral'}
                onClick={() => setSelected(t)}
                onRemove={() => remove(t)}
              >
                {t}
              </Tag>
            ))}
          </Inline>
          <Text size="sm">
            Selected: <strong>{selected ?? '(none)'}</strong>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Disabled: Story = {
  render: () => (
    <Inline gap="2">
      <Tag disabled>static disabled</Tag>
      <Tag disabled onClick={() => alert('should not fire')}>
        click disabled
      </Tag>
      <Tag disabled onRemove={() => alert('should not fire')}>
        remove disabled
      </Tag>
    </Inline>
  ),
};

export const ManyItems: Story = {
  name: 'Many items — wraps onto multiple lines',
  render: () => {
    const items = [
      'typescript',
      'react',
      'storybook',
      'vanilla-extract',
      'radix',
      'a11y',
      'theming',
      'tokens',
      'tests',
      'monorepo',
      'pnpm',
      'biome',
      'vite',
      'docs',
      'ssr',
      'hooks',
    ];
    return (
      <Inline gap="2" wrap>
        {items.map((t) => (
          <Tag key={t} variant="soft" colorScheme="neutral">
            {t}
          </Tag>
        ))}
      </Inline>
    );
  },
};
