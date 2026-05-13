import {
  Button,
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
    <Form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Stack gap="4" style={{ width: 360 }}>
        <FormField name="name" required>
          <FormLabel>Your name</FormLabel>
          <FormControl>
            <Input />
          </FormControl>
        </FormField>
        <FormField name="email" required>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" placeholder="you@example.com" />
          </FormControl>
          <FormDescription>We will never share your address.</FormDescription>
        </FormField>
        <Button type="submit">Send</Button>
      </Stack>
    </Form>
  );
}
