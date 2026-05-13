import { Menu, MenuDivider, MenuGroup, MenuItem } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: 260 }}>
      <Menu aria-label="Navigation">
        <MenuGroup label="Workspace">
          <MenuItem isActive>Dashboard</MenuItem>
          <MenuItem badge="3">Inbox</MenuItem>
          <MenuItem>Calendar</MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuGroup label="Organisation">
          <MenuItem>Members</MenuItem>
          <MenuItem>Settings</MenuItem>
        </MenuGroup>
      </Menu>
    </div>
  );
}
