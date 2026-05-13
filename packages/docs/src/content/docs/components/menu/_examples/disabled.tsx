import { Menu, MenuItem } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ width: 240 }}>
      <Menu aria-label="Primary">
        <MenuItem isActive>Dashboard</MenuItem>
        <MenuItem>Inbox</MenuItem>
        <MenuItem disabled>Archived (coming soon)</MenuItem>
      </Menu>
    </div>
  );
}
