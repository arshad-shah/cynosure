import { ColorPicker, Inline } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Inline gap="3" align="center">
      <ColorPicker size="sm" label="Small" defaultValue="#6366F1" />
      <ColorPicker size="md" label="Medium" defaultValue="#10B981" />
      <ColorPicker size="lg" label="Large" defaultValue="#EC4899" />
    </Inline>
  );
}
