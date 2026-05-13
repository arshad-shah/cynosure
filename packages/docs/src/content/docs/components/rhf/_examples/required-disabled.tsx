import { Input } from '@arshad-shah/cynosure-react';
import { RHFField } from '@arshad-shah/cynosure-react/rhf';
import { useForm } from 'react-hook-form';

type Values = { name: string; id: string };

export default function Example() {
  const { control } = useForm<Values>({ defaultValues: { name: '', id: 'usr_9f2c4' } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
      <RHFField control={control} name="name" label="Display name" required>
        <Input placeholder="Required field" />
      </RHFField>
      <RHFField control={control} name="id" label="Account ID" disabled>
        <Input />
      </RHFField>
    </div>
  );
}
