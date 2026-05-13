import { Menu, MenuItem } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: 240 }}>
      <Menu aria-label="Primary">
        <MenuItem isActive>Dashboard</MenuItem>
        <MenuItem>Inbox</MenuItem>
        <MenuItem>Calendar</MenuItem>
        <MenuItem>Settings</MenuItem>
      </Menu>
    </div>
  );
}
