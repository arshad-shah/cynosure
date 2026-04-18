import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Button } from '../Button/Button.js';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { Input } from '../Input/Input.js';
import { Select } from '../Select/Select.js';
import { Textarea } from '../Textarea/Textarea.js';
import { Form } from './Form.js';
import { FormControl } from './FormControl.js';
import { FormDescription } from './FormDescription.js';
import { FormField } from './FormField.js';
import { FormLabel } from './FormLabel.js';
import { FormMessage } from './FormMessage.js';

const meta: Meta<typeof FormField> = {
  title: 'Forms/Form composition',
  component: FormField,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof FormField>;

export const Plain: Story = {
  name: 'Plain / uncontrolled + FormData',
  render: () => {
    function Plain(): React.ReactElement {
      const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null);
      return (
        <Stack gap="4" width="420px">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              const data = Object.fromEntries(new FormData(e.currentTarget).entries());
              setSubmitted(data);
            }}
          >
            <Stack gap="4">
              <FormField name="name" required>
                <FormLabel>Your name</FormLabel>
                <FormControl>
                  <Input />
                </FormControl>
              </FormField>
              <FormField name="email" required>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" />
                </FormControl>
                <FormDescription>We will never share your email.</FormDescription>
              </FormField>
              <Button type="submit">Send</Button>
            </Stack>
          </Form>
          {submitted ? (
            <Text size="sm" color="fg.muted">
              Submitted: <code>{JSON.stringify(submitted)}</code>
            </Text>
          ) : null}
        </Stack>
      );
    }
    return <Plain />;
  },
};

export const ControlledValidation: Story = {
  name: 'Controlled inline validation',
  render: () => {
    function Controlled(): React.ReactElement {
      const [email, setEmail] = useState('');
      const invalid = email.length > 0 && !email.includes('@');
      return (
        <Form>
          <Stack gap="4" width="420px">
            <FormField name="email" invalid={invalid} required>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" value={email} onChange={setEmail} />
              </FormControl>
              <FormDescription>We will never share your email.</FormDescription>
              <FormMessage>{invalid ? 'Needs an @' : undefined}</FormMessage>
            </FormField>
            <Button type="submit">Sign in</Button>
          </Stack>
        </Form>
      );
    }
    return <Controlled />;
  },
};

export const AllControlTypes: Story = {
  name: 'Every field type composed',
  render: () => (
    <Form>
      <Stack gap="4" width="480px">
        <FormField name="title" required>
          <FormLabel>Title</FormLabel>
          <FormControl>
            <Input />
          </FormControl>
        </FormField>
        <FormField name="description">
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea rows={4} />
          </FormControl>
          <FormDescription>Markdown supported.</FormDescription>
        </FormField>
        <FormField name="priority" required>
          <FormLabel>Priority</FormLabel>
          <FormControl>
            <Select
              items={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
              defaultValue="medium"
            />
          </FormControl>
        </FormField>
        <FormField name="terms" required>
          <Checkbox>I accept the terms</Checkbox>
        </FormField>
        <Button type="submit">Create</Button>
      </Stack>
    </Form>
  ),
};

export const InvalidStates: Story = {
  name: 'Invalid states across field types',
  render: () => (
    <Form>
      <Stack gap="4" width="420px">
        <FormField name="email" invalid>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" defaultValue="bad" />
          </FormControl>
          <FormMessage>Must be a valid email</FormMessage>
        </FormField>
        <FormField name="bio" invalid>
          <FormLabel>Bio</FormLabel>
          <FormControl>
            <Textarea rows={3} defaultValue="x" />
          </FormControl>
          <FormMessage>At least 10 characters</FormMessage>
        </FormField>
      </Stack>
    </Form>
  ),
};

export const DisabledField: Story = {
  render: () => (
    <Form>
      <Stack gap="4" width="420px">
        <FormField name="email" disabled>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" defaultValue="you@example.com" />
          </FormControl>
          <FormDescription>Contact support to change your email.</FormDescription>
        </FormField>
      </Stack>
    </Form>
  ),
};

export const ChildPropsWin: Story = {
  name: 'Child props override FormField inheritance',
  render: () => (
    <Form>
      <Stack gap="4" width="420px">
        <FormField name="shared" required disabled>
          <FormLabel>Field (group says required + disabled)</FormLabel>
          <FormControl>
            {/* `disabled={false}` on the child beats the FormField default */}
            <Input disabled={false} />
          </FormControl>
          <FormDescription>
            The input child passed <code>disabled=&#123;false&#125;</code>, so it stays enabled even
            though the FormField has <code>disabled</code>.
          </FormDescription>
        </FormField>
      </Stack>
    </Form>
  ),
};

export const NoValidateDefault: Story = {
  name: 'noValidate is on by default',
  render: () => (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        alert('Submitted — no native browser validation fired.');
      }}
    >
      <Stack gap="4" width="420px">
        <Text size="sm" color="fg.muted">
          <code>Form</code> defaults <code>noValidate</code> to <code>true</code> so Cynosure's
          <code> FormMessage </code> stays the single source of validation UX. Pass{' '}
          <code>noValidate=&#123;false&#125;</code> to opt back into native bubbles.
        </Text>
        <FormField name="email" required>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
        </FormField>
        <Button type="submit">Try submitting empty</Button>
      </Stack>
    </Form>
  ),
};
