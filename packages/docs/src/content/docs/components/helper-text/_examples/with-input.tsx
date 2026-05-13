import { HelperText, Input, Label, Stack } from '@arshad-shah/cynosure-react';
import { useId } from 'react';

export default function Example() {
  const inputId = useId();
  const helperId = useId();
  return (
    <Stack gap="2" style={{ width: 320 }}>
      <Label htmlFor={inputId}>Password</Label>
      <Input
        id={inputId}
        type="password"
        aria-describedby={helperId}
        placeholder="At least 8 characters"
      />
      <HelperText id={helperId}>
        Use at least 8 characters with a mix of letters and digits.
      </HelperText>
    </Stack>
  );
}
