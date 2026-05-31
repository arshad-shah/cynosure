import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
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

export const Disabled: Story = {
  render: () => (
    <Inline gap="2">
      <Tag disabled>static disabled</Tag>
      <Tag disabled onClick={() => undefined}>
        click disabled
      </Tag>
      <Tag disabled onRemove={() => undefined}>
        remove disabled
      </Tag>
    </Inline>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · remove button removes the tag',
  render: () => {
    function Demo(): React.ReactElement {
      const [tags, setTags] = useState(['react', 'typescript']);
      const remove = (t: string): void => setTags((xs) => xs.filter((x) => x !== t));
      return (
        <Inline gap="2">
          {tags.map((t) => (
            <Tag key={t} colorScheme="accent" onRemove={() => remove(t)}>
              {t}
            </Tag>
          ))}
        </Inline>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // onRemove makes the tag a role="group" with a focusable × button.
    await expect(canvas.getByRole('group', { name: 'react' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove react' }));
    await expect(canvas.queryByRole('group', { name: 'react' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('group', { name: 'typescript' })).toBeInTheDocument();
  },
};
