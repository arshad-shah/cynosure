import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '../Form/index.js';
import { TagsInput } from './TagsInput.js';

const meta: Meta<typeof TagsInput> = {
  title: 'Forms/TagsInput',
  component: TagsInput,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    unique: { control: 'boolean' },
    maxTags: { control: { type: 'number', min: 1, step: 1 } },
  },
};
export default meta;
type Story = StoryObj<typeof TagsInput>;

export const Playground: Story = {
  args: {
    placeholder: 'Add a tag, press Enter…',
    variant: 'outline',
    size: 'md',
    'aria-label': 'Tags',
  },
  render: (args) => (
    <div style={{ width: '380px' }}>
      <TagsInput {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="380px">
      <TagsInput
        variant="outline"
        defaultValue={['design', 'system']}
        aria-label="Outline"
        placeholder="Outline"
      />
      <TagsInput
        variant="filled"
        defaultValue={['design', 'system']}
        aria-label="Filled"
        placeholder="Filled"
      />
      <TagsInput
        variant="ghost"
        defaultValue={['design', 'system']}
        aria-label="Ghost"
        placeholder="Ghost"
      />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="380px">
      <TagsInput size="sm" defaultValue={['sm', 'size']} aria-label="Small" />
      <TagsInput size="md" defaultValue={['md', 'size']} aria-label="Medium" />
      <TagsInput size="lg" defaultValue={['lg', 'size']} aria-label="Large" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="380px">
      <TagsInput placeholder="Default" aria-label="Default" />
      <TagsInput
        defaultValue={['readonly', 'tag']}
        readOnly
        aria-label="Read only"
        placeholder="Read only"
      />
      <TagsInput
        defaultValue={['disabled', 'tag']}
        disabled
        aria-label="Disabled"
        placeholder="Disabled"
      />
      <TagsInput defaultValue={['invalid']} invalid aria-label="Invalid" placeholder="Invalid" />
    </Stack>
  ),
};

export const MaxTags: Story = {
  name: 'maxTags — caps input count',
  render: () => {
    function Demo(): React.ReactElement {
      const [tags, setTags] = useState<string[]>(['apple', 'banana']);
      return (
        <Stack gap="3" width="380px">
          <TagsInput
            value={tags}
            onValueChange={setTags}
            maxTags={4}
            placeholder="Up to 4 tags…"
            aria-label="Max 4"
          />
          <Text size="sm" color="fg.muted">
            {tags.length} / 4 tags
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const NonUnique: Story = {
  name: 'unique={false} — allows duplicates',
  render: () => (
    <div style={{ width: '380px' }}>
      <TagsInput
        unique={false}
        defaultValue={['same', 'same', 'same']}
        aria-label="Non-unique"
        placeholder="Duplicates allowed"
      />
    </div>
  ),
};

export const Suggestions: Story = {
  name: 'Datalist suggestions',
  render: () => (
    <div style={{ width: '380px' }}>
      <TagsInput
        suggestions={['design', 'engineering', 'marketing', 'support']}
        placeholder="Try typing 'd' or 'e'…"
        aria-label="With suggestions"
      />
    </div>
  ),
};

export const CustomCommitKeys: Story = {
  name: 'Commit on Space / Enter',
  render: () => (
    <div style={{ width: '380px' }}>
      <TagsInput
        commitKeys={[' ', 'Enter']}
        placeholder="Words commit as you type…"
        aria-label="Custom commit"
      />
    </div>
  ),
};

export const CustomRender: Story = {
  name: 'Custom renderTag',
  render: () => (
    <div style={{ width: '420px' }}>
      <TagsInput
        defaultValue={['react', 'solid', 'svelte']}
        aria-label="Custom tags"
        renderTag={(tag, _index, remove) => (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '2px 8px',
              borderRadius: 999,
              background: 'rgba(99,102,241,0.12)',
              color: '#4338ca',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            #{tag}
            <button
              type="button"
              onClick={remove}
              aria-label={`Remove ${tag}`}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: 'inherit',
              }}
            >
              ×
            </button>
          </span>
        )}
      />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Demo(): React.ReactElement {
      const [tags, setTags] = useState<string[]>(['alpha', 'beta']);
      return (
        <Stack gap="3" width="380px">
          <TagsInput value={tags} onValueChange={setTags} aria-label="Tags" />
          <Inline gap="2">
            <Text size="sm" color="fg.muted">
              Value: <code>{JSON.stringify(tags)}</code>
            </Text>
          </Inline>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const PasteSplit: Story = {
  name: 'Paste-then-Enter splits into tags',
  render: () => (
    <Stack gap="3" width="380px">
      <TagsInput
        commitKeys={['Enter', ',']}
        placeholder="Paste 'one,two,three' and press Enter"
        aria-label="Paste split"
      />
      <Text size="sm" color="fg.muted">
        Commas in the pasted string are treated as commit keys, splitting input into tags.
      </Text>
    </Stack>
  ),
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [tags, setTags] = useState<string[]>([]);
      const invalid = tags.length === 0;
      return (
        <Form>
          <Stack gap="4" width="420px">
            <FormField name="keywords" invalid={invalid} required>
              <FormLabel>Keywords</FormLabel>
              <FormControl>
                <TagsInput value={tags} onValueChange={setTags} aria-label="Keywords" />
              </FormControl>
              <FormDescription>Press Enter or comma to commit each tag.</FormDescription>
              <FormMessage>{invalid ? 'Add at least one keyword.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
