import { ColorPicker } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: 320 }}>
      <ColorPicker variant="inline" defaultValue="#6366F1" alpha eyedropper />
    </div>
  );
}
