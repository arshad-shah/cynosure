import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  Input,
  Select,
  Stack,
  Textarea,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Form>
      <Stack gap="4" style={{ width: 420 }}>
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
  );
}
