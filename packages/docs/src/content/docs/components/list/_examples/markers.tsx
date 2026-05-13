import { List, ListItem, OrderedList } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div
      style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
    >
      <List marker="disc">
        <ListItem>Disc</ListItem>
        <ListItem>Marker</ListItem>
      </List>
      <List marker="circle">
        <ListItem>Circle</ListItem>
        <ListItem>Marker</ListItem>
      </List>
      <List marker="square">
        <ListItem>Square</ListItem>
        <ListItem>Marker</ListItem>
      </List>
      <List marker="none">
        <ListItem>No marker</ListItem>
        <ListItem>Still a list</ListItem>
      </List>
      <OrderedList marker="lower-alpha">
        <ListItem>Lower alpha</ListItem>
        <ListItem>Marker</ListItem>
      </OrderedList>
      <OrderedList marker="upper-alpha">
        <ListItem>Upper alpha</ListItem>
        <ListItem>Marker</ListItem>
      </OrderedList>
    </div>
  );
}
