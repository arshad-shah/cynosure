import {
  Blockquote,
  Code,
  Heading,
  Kbd,
  Link,
  List,
  ListItem,
  OrderedList,
  Text,
} from '@lumen/react';
import { Demo, SectionHeader } from './common';

export function TypographySection() {
  return (
    <>
      <SectionHeader
        title="Typography"
        description="Headings, body text, inline & structural typography."
      />
      <div className="showcase-grid">
        <Demo title="Heading">
          <div>
            <Heading level={1} size="2xl">
              H1 heading
            </Heading>
            <Heading level={2} size="xl">
              H2 heading
            </Heading>
            <Heading level={3} size="lg">
              H3 heading
            </Heading>
          </div>
        </Demo>

        <Demo title="Text">
          <div>
            <Text size="lg">Large body</Text>
            <Text>Default body</Text>
            <Text size="sm" variant="muted">
              Muted small
            </Text>
          </div>
        </Demo>

        <Demo title="Link">
          <Link href="#">Default link</Link>
        </Demo>

        <Demo title="Code">
          <Text>
            Inline <Code>npm install</Code> reference.
          </Text>
        </Demo>

        <Demo title="Kbd">
          <Text>
            Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd>
          </Text>
        </Demo>

        <Demo title="Blockquote">
          <Blockquote>Good design is as little design as possible.</Blockquote>
        </Demo>

        <Demo title="List (unordered)">
          <List>
            <ListItem>Alpha</ListItem>
            <ListItem>Bravo</ListItem>
            <ListItem>Charlie</ListItem>
          </List>
        </Demo>

        <Demo title="OrderedList">
          <OrderedList>
            <ListItem>First</ListItem>
            <ListItem>Second</ListItem>
            <ListItem>Third</ListItem>
          </OrderedList>
        </Demo>
      </div>
    </>
  );
}
