import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
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
import { Input } from '../Input/Input.js';
import { Label } from '../Label/Label.js';
import { ErrorText } from './ErrorText.js';

const meta: Meta<typeof ErrorText> = {
  title: 'Forms/ErrorText',
  component: ErrorText,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ErrorText>;

export const Playground: Story = {
  args: {
    children: 'This field is required.',
  },
};

export const Default: Story = {
  render: () => <ErrorText>This field is required.</ErrorText>,
};

export const WithInput: Story = {
  name: 'Paired with invalid Input',
  render: () => (
    <Stack gap="2" width="360px">
      <Label htmlFor="et-email">Email</Label>
      <Input
        id="et-email"
        type="email"
        defaultValue="bad-email"
        invalid
        aria-describedby="et-email-err"
      />
      <ErrorText id="et-email-err">Must be a valid email address.</ErrorText>
    </Stack>
  ),
};

export const WithoutAlertRole: Story = {
  name: 'role=presentation — suppress live announcement',
  render: () => (
    <Stack gap="3" width="360px">
      <ErrorText>Default — announced via role="alert".</ErrorText>
      <ErrorText role="presentation">
        Rendered silently — use when errors arrive in bulk (e.g. on submit) and you announce them
        elsewhere.
      </ErrorText>
    </Stack>
  ),
};

export const MultipleErrors: Story = {
  render: () => (
    <Stack gap="1" width="360px">
      <ErrorText>Must be at least 8 characters.</ErrorText>
      <ErrorText>Must include a number.</ErrorText>
      <ErrorText>Must include a symbol.</ErrorText>
    </Stack>
  ),
};

export const Live: Story = {
  name: 'Live — reveals on invalid input',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState('');
      const invalid = value.length > 0 && !value.includes('@');
      return (
        <Stack gap="2" width="360px">
          <Label htmlFor="et-live">Email</Label>
          <Input
            id="et-live"
            value={value}
            onChange={setValue}
            invalid={invalid}
            aria-describedby={invalid ? 'et-live-err' : undefined}
          />
          {invalid ? <ErrorText id="et-live-err">Add an “@”.</ErrorText> : null}
          <Text size="sm" color="fg.muted">
            Type a value missing an “@” to see the error announce.
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const InsideFormField: Story = {
  name: 'Inside FormField (via FormMessage)',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState('');
      const invalid = value.length > 0 && value.length < 3;
      return (
        <Form>
          <Stack gap="4" width="360px">
            <FormField name="handle" invalid={invalid} required>
              <FormLabel>Handle</FormLabel>
              <FormControl>
                <Input value={value} onChange={setValue} placeholder="min 3 chars" />
              </FormControl>
              <FormDescription>Your public @handle on the platform.</FormDescription>
              <FormMessage>
                {invalid ? 'Handles must be at least 3 characters.' : undefined}
              </FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
