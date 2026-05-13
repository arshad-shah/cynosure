import { Button, Input } from '@arshad-shah/cynosure-react';
import { RHFField } from '@arshad-shah/cynosure-react/rhf';
import { useForm } from 'react-hook-form';

type Values = { username: string };

export default function Example() {
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: { username: '' },
    mode: 'onBlur',
  });

  return (
    <form
      onSubmit={handleSubmit(() => {
        // submit handler — validate happens before this fires
      })}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '320px' }}
    >
      <RHFField
        control={control}
        name="username"
        label="Username"
        required
        rules={{
          required: 'Username is required',
          minLength: { value: 3, message: 'At least 3 characters' },
        }}
      >
        <Input placeholder="ada-lovelace" />
      </RHFField>
      <Button type="submit">Save</Button>
    </form>
  );
}
