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
        <FormField name="username">
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input />
          </FormControl>
          <FormDescription>3 to 20 lowercase letters or digits.</FormDescription>
        </FormField>
      </Stack>
    </Form>
  );
}
