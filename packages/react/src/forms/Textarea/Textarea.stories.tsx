import type { Meta, StoryObj } from '@storybook/react';
import { Bold, Code as CodeIcon, Italic, Link2, Paperclip, Send } from 'lucide-react';
import { useState } from 'react';
import { IconButton } from '../IconButton/IconButton.js';
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
import { Textarea } from './Textarea.js';
import { TextareaActions } from './TextareaActions.js';
import { TextareaClearButton } from './TextareaClearButton.js';
import { TextareaCounter } from './TextareaCounter.js';
import { TextareaField } from './TextareaField.js';
import { TextareaFooter } from './TextareaFooter.js';
import { TextareaResizeHandle } from './TextareaResizeHandle.js';
import { TextareaRoot } from './TextareaRoot.js';

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Textarea',
  component: Textarea,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    resize: { control: 'select', options: ['vertical', 'horizontal', 'both', 'none'] },
    rows: { control: { type: 'number', min: 1, max: 20, step: 1 } },
    maxRows: { control: { type: 'number', min: 1, max: 40, step: 1 } },
    limit: { control: { type: 'number', min: 1, max: 10000, step: 1 } },
    autoResize: { control: 'boolean' },
    showCount: { control: 'boolean' },
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {
  args: {
    placeholder: 'Write your story…',
    variant: 'outline',
    size: 'md',
    rows: 4,
    limit: 280,
    clearable: true,
  },
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="420px">
      <Textarea variant="outline" placeholder="Outline" />
      <Textarea variant="filled" placeholder="Filled" />
      <Textarea variant="ghost" placeholder="Ghost" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="420px">
      <Textarea size="sm" placeholder="Small" limit={140} clearable defaultValue="Small" />
      <Textarea size="md" placeholder="Medium" limit={280} clearable defaultValue="Medium" />
      <Textarea size="lg" placeholder="Large" limit={500} clearable defaultValue="Large" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="420px">
      <Textarea placeholder="Default" />
      <Textarea placeholder="Read only" defaultValue="Read-only content" readOnly />
      <Textarea placeholder="Disabled" disabled defaultValue="Disabled content" />
      <Textarea placeholder="Invalid" defaultValue="Too short" invalid />
      <Textarea placeholder="Required" required />
    </Stack>
  ),
};

export const WithCharacterLimit: Story = {
  name: 'Counter + limit (warns at 80%, danger over)',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState('Short message');
      return (
        <Stack gap="2" width="420px">
          <Textarea value={value} onChange={setValue} limit={100} placeholder="Type to see it shift from default → warning → danger" />
          <Text size="sm" color="fg.muted">
            Counter shifts to warning at 80 chars, danger past 100.
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Clearable: Story = {
  name: 'Clearable — top-right × appears once there is content',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState('Some text you can clear');
      return (
        <Stack gap="2" width="420px">
          <Textarea value={value} onChange={setValue} clearable placeholder="Type something…" />
          <Text size="sm" color="fg.muted">
            The × sits in the top-right corner; field reserves right-padding when clearable is on.
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const WithToolbar: Story = {
  name: 'Toolbar footer — attach, formatting, send',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState('');
      return (
        <Stack gap="2" width="480px">
          <Textarea
            value={value}
            onChange={setValue}
            placeholder="Reply to the thread…"
            limit={500}
            clearable
            toolbar={
              <>
                <IconButton size="sm" variant="ghost" icon={<Paperclip size={15} />} label="Attach" />
                <IconButton size="sm" variant="ghost" icon={<Bold size={15} />} label="Bold" />
                <IconButton size="sm" variant="ghost" icon={<Italic size={15} />} label="Italic" />
                <IconButton size="sm" variant="ghost" icon={<Link2 size={15} />} label="Link" />
                <IconButton size="sm" variant="ghost" icon={<CodeIcon size={15} />} label="Code" />
              </>
            }
          />
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const ResizeAxes: Story = {
  name: 'Resize — vertical / both / none / autoResize',
  render: () => (
    <Stack gap="3" width="420px">
      <div>
        <Text size="sm" color="fg.muted">resize="vertical" (default)</Text>
        <Textarea resize="vertical" placeholder="Drag the corner grip" />
      </div>
      <div>
        <Text size="sm" color="fg.muted">resize="both"</Text>
        <Textarea resize="both" placeholder="X + Y drag" />
      </div>
      <div>
        <Text size="sm" color="fg.muted">resize="none"</Text>
        <Textarea resize="none" placeholder="No grip" />
      </div>
      <div>
        <Text size="sm" color="fg.muted">autoResize (grip hidden)</Text>
        <Textarea autoResize maxRows={6} placeholder="Type — the field grows with content" />
      </div>
    </Stack>
  ),
};

export const AutoResize: Story = {
  name: 'Auto-resize — grows with content',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState(
        'Try typing (or pasting) multi-line content — the field grows to fit.\n\nAdd more lines…',
      );
      return (
        <Stack gap="3" width="420px">
          <Textarea autoResize maxRows={8} value={value} onChange={setValue} />
          <Text size="sm" color="fg.muted">
            Uses native <code>field-sizing: content</code> in Chromium; falls back to a JS resizer elsewhere.
            <code>maxRows</code> caps growth based on the actual resolved line-height.
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState('');
      return (
        <Stack gap="3" width="420px">
          <Textarea value={value} onChange={setValue} placeholder="Type here" rows={4} limit={140} />
          <Text size="sm">
            Character count: <strong>{value.length}</strong>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [bio, setBio] = useState('');
      return (
        <Form>
          <Stack gap="4" width="480px">
            <FormField name="bio">
              <FormLabel>Short bio</FormLabel>
              <FormControl>
                <Textarea value={bio} onChange={setBio} rows={4} placeholder="About you…" limit={140} clearable />
              </FormControl>
              <FormDescription>Maximum 140 characters.</FormDescription>
              <FormMessage />
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};

export const CompoundPrimitives: Story = {
  name: 'Compound primitives — custom layout',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState('');
      return (
        <Stack gap="2" width="480px">
          <Text size="sm" color="fg.muted">
            Drop down to the primitives to build a custom layout — here the counter is
            moved to the left and a send button sits on the right of the footer.
          </Text>
          <TextareaRoot value={value} onChange={setValue} limit={500} resize="vertical">
            <TextareaField placeholder="Custom composition…" rows={4} />
            <TextareaClearButton />
            <TextareaFooter>
              <TextareaCounter />
              <TextareaActions>
                <IconButton size="sm" variant="ghost" icon={<Paperclip size={15} />} label="Attach" />
                <IconButton size="sm" variant="solid" icon={<Send size={15} />} label="Send" />
              </TextareaActions>
            </TextareaFooter>
            <TextareaResizeHandle />
          </TextareaRoot>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const LongText: Story = {
  render: () => (
    <Stack gap="3" width="420px">
      <Textarea
        rows={6}
        clearable
        limit={2000}
        defaultValue={`${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20)}`}
      />
    </Stack>
  ),
};
