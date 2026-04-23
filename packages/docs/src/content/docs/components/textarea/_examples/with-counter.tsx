import { Textarea } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState('');
  return (
    <Textarea
      value={value}
      onChange={setValue}
      limit={140}
      placeholder="What's on your mind? (140 chars max)"
      rows={4}
    />
  );
}
