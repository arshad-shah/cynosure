import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(false);
  const [density, setDensity] = useState('comfortable');

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          style={{
            padding: '2rem',
            border: '1px dashed var(--cynosure-color-border-default, #d4d4d4)',
            borderRadius: '0.5rem',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          Right-click to change view options
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Show</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
          Grid
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={showRulers} onCheckedChange={setShowRulers}>
          Rulers
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>Density</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value={density} onValueChange={setDensity}>
          <ContextMenuRadioItem value="compact">Compact</ContextMenuRadioItem>
          <ContextMenuRadioItem value="comfortable">Comfortable</ContextMenuRadioItem>
          <ContextMenuRadioItem value="spacious">Spacious</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
