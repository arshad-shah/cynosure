import { ToggleGroup, ToggleGroupItem } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [marks, setMarks] = useState<string[]>(['bold']);
  return (
    <ToggleGroup
      type="multiple"
      value={marks}
      onValueChange={setMarks}
      variant="outline"
      aria-label="Text formatting"
    >
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
    </ToggleGroup>
  );
}
