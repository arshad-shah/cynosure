import { List, ListItem } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div
      style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
    >
      <List spacing="1">
        <ListItem>Tight</ListItem>
        <ListItem>Spacing</ListItem>
        <ListItem>One</ListItem>
      </List>
      <List spacing="3">
        <ListItem>Default</ListItem>
        <ListItem>ish</ListItem>
        <ListItem>Spacing</ListItem>
      </List>
      <List spacing="6">
        <ListItem>Loose</ListItem>
        <ListItem>Breathing</ListItem>
        <ListItem>Room</ListItem>
      </List>
    </div>
  );
}
