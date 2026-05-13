import { List, ListItem } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <List>
      <ListItem>Typography</ListItem>
      <ListItem>
        Layout
        <List marker="circle">
          <ListItem>Box</ListItem>
          <ListItem>Stack</ListItem>
          <ListItem>Grid</ListItem>
        </List>
      </ListItem>
      <ListItem>Forms</ListItem>
    </List>
  );
}
