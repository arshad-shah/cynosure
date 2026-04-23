import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTriggerButton,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [density, setDensity] = useState('comfortable');

  return (
    <DropdownMenu>
      <DropdownMenuTriggerButton>View</DropdownMenuTriggerButton>
      <DropdownMenuContent>
        <DropdownMenuLabel>Show</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
          Grid
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showRulers} onCheckedChange={setShowRulers}>
          Rulers
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Density</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
          <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="spacious">Spacious</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
