import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Button } from '../Button/Button.js';
import { Input } from '../Input/Input.js';
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
  render: () => (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget).entries());
        // biome-ignore lint/suspicious/noConsole: demo surface only
        console.log('submit payload:', data);
      }}
    >
      <Stack gap="4">
        <FormField name="email" required>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" />
          </FormControl>
          <FormDescription>We will never share your email.</FormDescription>
        </FormField>
        <FormField name="password" required>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input type="password" />
          </FormControl>
        </FormField>
        <Button type="submit">Sign in</Button>
      </Stack>
    </Form>
  ),
};

export const WithValidation: Story = {
  name: 'With controlled validation',
  render: () => {
    function Controlled(): React.ReactElement {
      const [email, setEmail] = useState('');
      const invalid = email.length > 0 && !email.includes('@');
      return (
        <Form>
          <Stack gap="4">
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
