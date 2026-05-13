import {
  MenuBar,
  MenuBarCheckboxItem,
  MenuBarContent,
  MenuBarLabel,
  MenuBarMenu,
  MenuBarRadioGroup,
  MenuBarRadioItem,
  MenuBarSeparator,
  MenuBarTrigger,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [wrap, setWrap] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [zoom, setZoom] = useState('100');

  return (
    <MenuBar>
      <MenuBarMenu>
        <MenuBarTrigger>View</MenuBarTrigger>
        <MenuBarContent>
          <MenuBarLabel>Editor</MenuBarLabel>
          <MenuBarSeparator />
          <MenuBarCheckboxItem checked={wrap} onCheckedChange={setWrap}>
            Word wrap
          </MenuBarCheckboxItem>
          <MenuBarCheckboxItem checked={minimap} onCheckedChange={setMinimap}>
            Show minimap
          </MenuBarCheckboxItem>
          <MenuBarSeparator />
          <MenuBarLabel>Zoom</MenuBarLabel>
          <MenuBarSeparator />
          <MenuBarRadioGroup value={zoom} onValueChange={setZoom}>
            <MenuBarRadioItem value="75">75%</MenuBarRadioItem>
            <MenuBarRadioItem value="100">100%</MenuBarRadioItem>
            <MenuBarRadioItem value="125">125%</MenuBarRadioItem>
          </MenuBarRadioGroup>
        </MenuBarContent>
      </MenuBarMenu>
    </MenuBar>
  );
}
