import { Menu, MenuGroup, MenuItem } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: 260 }}>
      <Menu aria-label="Docs">
        <MenuGroup label="Components" collapsible defaultOpen>
          <MenuItem indent={1}>Button</MenuItem>
          <MenuItem indent={1}>Input</MenuItem>
          <MenuItem indent={1} isActive>
            Tabs
          </MenuItem>
        </MenuGroup>
        <MenuGroup label="Recipes" collapsible defaultOpen={false}>
          <MenuItem indent={1}>Login form</MenuItem>
          <MenuItem indent={1}>Command palette</MenuItem>
        </MenuGroup>
      </Menu>
    </div>
  );
}
