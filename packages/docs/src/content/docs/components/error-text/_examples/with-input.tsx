import { ErrorText, Input, Label, Stack } from '@arshad-shah/cynosure-react';
import { useId, useState } from 'react';

export default function Example() {
  const errorId = useId();
  const inputId = useId();
  const [value, setValue] = useState('nope');
  const invalid = !value.includes('@');
  return (
    <Stack gap="2" style={{ width: 320 }}>
      <Label htmlFor={inputId}>Email</Label>
      <Input
        id={inputId}
        type="email"
        value={value}
        onChange={setValue}
        invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
      />
      {invalid ? <ErrorText id={errorId}>Please enter a valid email address.</ErrorText> : null}
    </Stack>
  );
}
