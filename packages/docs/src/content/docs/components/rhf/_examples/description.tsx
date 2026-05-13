import { Input } from '@arshad-shah/cynosure-react';
import { RHFField } from '@arshad-shah/cynosure-react/rhf';
import { useForm } from 'react-hook-form';

type Values = { handle: string };

export default function Example() {
  const { control } = useForm<Values>({ defaultValues: { handle: '' } });

  return (
    <div style={{ width: '320px' }}>
      <RHFField
        control={control}
        name="handle"
        label="Handle"
        description="Letters, numbers, and underscores only."
      >
        <Input placeholder="@arshad" />
      </RHFField>
    </div>
  );
}
