import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../Box/Box.js';
import { Grid } from './Grid.js';

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Grid>;

const Cell = ({ children }: { children: React.ReactNode }) => (
  <Box
    padding="4"
    background="accent.soft"
    color="accent.solid"
    borderRadius="sm"
    style={{ textAlign: 'center' }}
  >
    {children}
  </Box>
);

export const ThreeColumns: Story = {
  render: () => (
    <Grid columns={3} gap="3">
      <Cell>1</Cell>
      <Cell>2</Cell>
      <Cell>3</Cell>
      <Cell>4</Cell>
      <Cell>5</Cell>
      <Cell>6</Cell>
    </Grid>
  ),
};

export const ResponsiveColumns: Story = {
  render: () => (
    <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="3">
      {Array.from({ length: 8 }, (_, i) => `cell-${i + 1}`).map((id, i) => (
        <Cell key={id}>{i + 1}</Cell>
      ))}
    </Grid>
  ),
};

export const ExplicitTemplate: Story = {
  render: () => (
    <Grid templateColumns="200px 1fr 200px" gap="3">
      <Cell>sidebar</Cell>
      <Cell>main</Cell>
      <Cell>aside</Cell>
    </Grid>
  ),
};

export const ChildSpan: Story = {
  render: () => (
    <Grid columns={4} gap="3">
      <Box gridColumn="span 2" padding="4" background="accent.soft" borderRadius="sm">
        span 2
      </Box>
      <Cell>A</Cell>
      <Cell>B</Cell>
      <Cell>C</Cell>
      <Box gridColumn="span 3" padding="4" background="accent.soft" borderRadius="sm">
        span 3
      </Box>
    </Grid>
  ),
};
