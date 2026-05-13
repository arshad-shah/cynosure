import { HelperText, Input, Label } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '320px' }}>
      <Label htmlFor="handle" required>
        Handle
      </Label>
      <Input id="handle" placeholder="@arshad" aria-describedby="handle-help" />
      <HelperText id="handle-help">Letters, numbers, and underscores only.</HelperText>
    </div>
  );
}
