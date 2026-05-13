import { Input, Label } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '260px' }}>
      <Label htmlFor="locked" disabled>
        Account ID
      </Label>
      <Input id="locked" disabled defaultValue="usr_9f2c4" />
    </div>
  );
}
