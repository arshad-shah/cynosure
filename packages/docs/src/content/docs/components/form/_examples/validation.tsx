import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  Input,
  Stack,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [email, setEmail] = useState('');
  const invalid = email.length > 0 && !email.includes('@');
  return (
    <Form>
      <Stack gap="4" style={{ width: 360 }}>
        <FormField name="email" invalid={invalid} required>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" value={email} onChange={setEmail} />
          </FormControl>
          <FormDescription>We will never share your address.</FormDescription>
          <FormMessage>{invalid ? 'Needs an @ symbol.' : undefined}</FormMessage>
        </FormField>
        <Button type="submit">Sign in</Button>
      </Stack>
    </Form>
  );
}
