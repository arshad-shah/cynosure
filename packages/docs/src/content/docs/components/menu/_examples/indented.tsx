import { Menu, MenuGroup, MenuItem } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: 260 }}>
      <Menu aria-label="Docs">
        <MenuGroup label="Getting started">
          <MenuItem indent={1}>Installation</MenuItem>
          <MenuItem indent={1}>Quick start</MenuItem>
          <MenuItem indent={1} isActive>
            Theming
          </MenuItem>
        </MenuGroup>
        <MenuGroup label="Overlays">
          <MenuItem indent={1}>Dialog</MenuItem>
          <MenuItem indent={2}>Confirm dialog</MenuItem>
          <MenuItem indent={2}>Alert dialog</MenuItem>
          <MenuItem indent={1}>Popover</MenuItem>
        </MenuGroup>
      </Menu>
    </div>
  );
}
