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

export default function Example() {
  return (
    <Form>
      <Stack gap="4" style={{ width: 360 }}>
        <FormField name="username" required>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="ada" />
          </FormControl>
          <FormDescription>3 to 20 lowercase letters or digits.</FormDescription>
          <FormMessage />
        </FormField>
        <Button type="submit">Continue</Button>
      </Stack>
    </Form>
  );
}
