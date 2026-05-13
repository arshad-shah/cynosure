import { ToggleGroup, ToggleGroupItem } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [align, setAlign] = useState('left');
  return (
    <ToggleGroup
      type="single"
      value={align}
      onValueChange={(value) => value && setAlign(value)}
      variant="outline"
      aria-label="Text alignment"
    >
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
      <ToggleGroupItem value="justify">Justify</ToggleGroupItem>
    </ToggleGroup>
  );
}
