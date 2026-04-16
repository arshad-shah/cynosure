import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  List,
  ListItem,
  OrderedList,
} from './List.js';

const meta: Meta = {
  title: 'Typography/List',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

export const Unordered: Story = {
  render: () => (
    <List spacing="2">
      <ListItem>Apples</ListItem>
      <ListItem>Bananas</ListItem>
      <ListItem>Cherries</ListItem>
    </List>
  ),
};

export const UnorderedMarkers: Story = {
  render: () => (
    <Stack gap="4">
      <List marker="disc">
        <ListItem>disc</ListItem>
      </List>
      <List marker="circle">
        <ListItem>circle</ListItem>
      </List>
      <List marker="square">
        <ListItem>square</ListItem>
      </List>
      <List marker="none">
        <ListItem>none</ListItem>
      </List>
    </Stack>
  ),
};

export const Ordered: Story = {
  render: () => (
    <OrderedList start={3} reversed>
      <ListItem>Third</ListItem>
      <ListItem>Second</ListItem>
      <ListItem>First</ListItem>
    </OrderedList>
  ),
};

export const Description: Story = {
  render: () => (
    <DescriptionList>
      <DescriptionTerm>Cost</DescriptionTerm>
      <DescriptionDetails>$10</DescriptionDetails>
      <DescriptionTerm>Colour</DescriptionTerm>
      <DescriptionDetails>Blue</DescriptionDetails>
      <DescriptionTerm>Quantity</DescriptionTerm>
      <DescriptionDetails>42</DescriptionDetails>
    </DescriptionList>
  ),
};

export const MarkerColor: Story = {
  render: () => (
    <List marker="disc" markerColor="accent.solid">
      <ListItem>accent-coloured marker</ListItem>
      <ListItem>accent-coloured marker</ListItem>
    </List>
  ),
};
