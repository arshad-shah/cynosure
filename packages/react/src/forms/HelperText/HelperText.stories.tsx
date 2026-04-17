import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '../Form/index.js';
import { Input } from '../Input/Input.js';
import { Label } from '../Label/Label.js';
import { HelperText } from './HelperText.js';

const meta: Meta<typeof HelperText> = {
  title: 'Forms/HelperText',
  component: HelperText,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof HelperText>;

export const Playground: Story = {
  args: {
    children: "We'll never share your email.",
  },
};

export const Default: Story = {
  render: () => <HelperText>We'll never share your email.</HelperText>,
};

export const WithInput: Story = {
  name: 'Paired with Label + Input',
  render: () => (
    <Stack gap="2" width="360px">
      <Label htmlFor="ht-email">Email</Label>
      <Input id="ht-email" type="email" aria-describedby="ht-email-help" />
      <HelperText id="ht-email-help">Use a work email so your team can find you.</HelperText>
    </Stack>
  ),
};

export const LongText: Story = {
  render: () => (
    <Stack width="360px">
      <HelperText>
        Passwords must be at least 8 characters and include a mix of letters, numbers, and symbols.
        Avoid reusing a password from another service.
      </HelperText>
    </Stack>
  ),
};

export const InlineFormatting: Story = {
  name: 'Inline formatting (code, strong)',
  render: () => (
    <Stack gap="2" width="360px">
      <HelperText>
        The <code>slug</code> must be lowercase — e.g. <code>my-project</code>.
      </HelperText>
      <HelperText>
        <strong>Tip:</strong> use paste to fill this from your clipboard.
      </HelperText>
    </Stack>
  ),
};

export const InsideFormField: Story = {
  name: 'Inside FormField (via FormDescription)',
  render: () => (
    <Form>
      <Stack gap="4" width="360px">
        <FormField name="slug">
          <FormLabel>Project slug</FormLabel>
          <FormControl>
            <Input placeholder="my-project" />
          </FormControl>
          <FormDescription>
            Used in URLs. Lowercase letters, numbers, and dashes only.
          </FormDescription>
          <FormMessage />
        </FormField>
      </Stack>
    </Form>
  ),
};
