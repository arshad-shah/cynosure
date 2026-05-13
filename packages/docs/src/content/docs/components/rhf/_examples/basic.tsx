import { Input } from '@arshad-shah/cynosure-react';
import { RHFField } from '@arshad-shah/cynosure-react/rhf';
import { useForm } from 'react-hook-form';

type Values = { email: string };

export default function Example() {
  const { control, handleSubmit } = useForm<Values>({ defaultValues: { email: '' } });

  return (
    <form
      onSubmit={handleSubmit(() => {
        // submit handler — wire your network call here
      })}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '320px' }}
    >
      <RHFField control={control} name="email" label="Email">
        <Input type="email" placeholder="you@example.com" />
      </RHFField>
    </form>
  );
}
