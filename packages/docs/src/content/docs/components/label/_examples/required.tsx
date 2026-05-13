import { Input, Label } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '260px' }}>
      <Label htmlFor="username" required>
        Username
      </Label>
      <Input id="username" required placeholder="ada-lovelace" />
    </div>
  );
}
