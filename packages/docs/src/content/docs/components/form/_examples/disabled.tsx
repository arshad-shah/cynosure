import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  Input,
  Stack,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Form>
      <Stack gap="4" style={{ width: 360 }}>
        <FormField name="email" disabled>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" defaultValue="you@example.com" />
          </FormControl>
          <FormDescription>Contact support to change your email.</FormDescription>
        </FormField>
      </Stack>
    </Form>
  );
}
