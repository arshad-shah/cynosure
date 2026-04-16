import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../primitives/layout/Stack/Stack.js';
import { Blockquote } from './Blockquote/Blockquote.js';
import { Code } from './Code/Code.js';
import { Heading } from './Heading/Heading.js';
import { Kbd } from './Kbd/Kbd.js';
import { Link } from './Link/Link.js';
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  List,
  ListItem,
} from './List/List.js';
import { Text } from './Text/Text.js';

const meta: Meta = {
  title: 'Typography/Gallery',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => (
    <Stack gap="6" padding="6" maxWidth="prose">
      <Heading level={1}>Lumen typography</Heading>
      <Text variant="lead" size="lg">
        A lean set of text primitives composed on top of <Code>Box</Code>.
      </Text>

      <Heading level={2}>Headings decouple level from size</Heading>
      <Text>
        Use <Code>level</Code> for semantics (h1 for page title, h2 for sections), and{' '}
        <Code>size</Code> to match the visual hierarchy your designer drew. An h1 at body-xs is
        perfectly legal.
      </Text>

      <Heading level={3}>Lists</Heading>
      <List spacing="2">
        <ListItem>Text, Heading, Code, Kbd</ListItem>
        <ListItem>Link, Blockquote</ListItem>
        <ListItem>List, OrderedList, DescriptionList</ListItem>
      </List>

      <Heading level={3}>Keyboard hints</Heading>
      <Text>
        Press <Kbd>⌘</Kbd>+<Kbd>K</Kbd> to open the palette.
      </Text>

      <Blockquote variant="callout" attribution="Design principle">
        Every non-primitive component composes Box. No raw JSX elements in component bodies.
      </Blockquote>

      <Heading level={3}>Metadata</Heading>
      <DescriptionList>
        <DescriptionTerm>Package</DescriptionTerm>
        <DescriptionDetails>
          <Code>@lumen/react</Code>
        </DescriptionDetails>
        <DescriptionTerm>Docs</DescriptionTerm>
        <DescriptionDetails>
          <Link href="https://lumen.dev" external>
            lumen.dev
          </Link>
        </DescriptionDetails>
      </DescriptionList>
    </Stack>
  ),
};
