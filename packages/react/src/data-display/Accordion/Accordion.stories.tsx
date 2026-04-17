import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { List, ListItem } from '../../typography/List/List.js';
import { Text } from '../../typography/Text/Text.js';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion.js';

const meta: Meta<typeof Accordion> = {
  title: 'Data Display/Accordion',
  component: Accordion,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'contained', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<typeof Accordion>;

const FAQ_ITEMS = [
  {
    value: 'shipping',
    q: 'How long does shipping take?',
    a: 'Orders placed before 2pm typically ship the same business day. Standard delivery is 3–5 business days; express is next business day.',
  },
  {
    value: 'returns',
    q: 'What is your returns policy?',
    a: 'Unworn items with the original packaging can be returned for up to 30 days after delivery. Include the order number in your return request.',
  },
  {
    value: 'warranty',
    q: 'Do your products come with a warranty?',
    a: 'Yes — every item ships with a 2-year manufacturer warranty that covers defects in materials and workmanship.',
  },
  {
    value: 'support',
    q: 'How can I contact support?',
    a: 'The fastest route is our in-app chat. For non-urgent questions, email support@example.com and we will reply within one business day.',
  },
];

export const Single: Story = {
  args: { variant: 'default', size: 'md' },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <Accordion
        type="single"
        collapsible
        defaultValue="shipping"
        variant={args.variant}
        size={args.size}
      >
        {FAQ_ITEMS.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>
              <Text>{item.a}</Text>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Accordion type="multiple" defaultValue={['shipping', 'returns']}>
        {FAQ_ITEMS.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>
              <Text>{item.a}</Text>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="6">
      {(['default', 'contained', 'ghost'] as const).map((variant) => (
        <Stack key={variant} gap="2">
          <Text size="sm" color="fg.muted">
            variant="{variant}"
          </Text>
          <div style={{ maxWidth: 520 }}>
            <Accordion type="single" collapsible variant={variant} defaultValue="shipping">
              {FAQ_ITEMS.slice(0, 2).map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>
                    <Text>{item.a}</Text>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Stack key={size} gap="2">
          <Text size="sm" color="fg.muted">
            size="{size}"
          </Text>
          <div style={{ maxWidth: 520 }}>
            <Accordion type="single" collapsible size={size}>
              {FAQ_ITEMS.slice(0, 2).map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>
                    <Text>{item.a}</Text>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState<string>('');
      return (
        <Stack gap="3" style={{ maxWidth: 520 }}>
          <Inline gap="2">
            <Button size="sm" variant="outline" onClick={() => setValue('shipping')}>
              Open shipping
            </Button>
            <Button size="sm" variant="outline" onClick={() => setValue('warranty')}>
              Open warranty
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setValue('')}>
              Close all
            </Button>
          </Inline>
          <Accordion type="single" collapsible value={value} onValueChange={setValue}>
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>
                  <Text>{item.a}</Text>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Text size="sm" color="fg.muted">
            Active: <code>{value || '(none)'}</code>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const DisabledItem: Story = {
  name: 'Disabled item',
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Accordion type="single" collapsible defaultValue="shipping">
        <AccordionItem value="shipping">
          <AccordionTrigger>Shipping</AccordionTrigger>
          <AccordionContent>
            <Text>Standard delivery is 3–5 business days.</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="returns" disabled>
          <AccordionTrigger>Returns (temporarily disabled)</AccordionTrigger>
          <AccordionContent>
            <Text>Policy details</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="support">
          <AccordionTrigger>Support</AccordionTrigger>
          <AccordionContent>
            <Text>Reach us via in-app chat.</Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const RichContent: Story = {
  name: 'Rich content (lists, images)',
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Accordion type="multiple" defaultValue={['checklist']}>
        <AccordionItem value="checklist">
          <AccordionTrigger>Launch checklist</AccordionTrigger>
          <AccordionContent>
            <List>
              <ListItem>Audit accessibility with axe-core</ListItem>
              <ListItem>Write migration guide for 2.x consumers</ListItem>
              <ListItem>Verify all components render under dark mode</ListItem>
              <ListItem>Publish release notes to the changelog</ListItem>
            </List>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="preview">
          <AccordionTrigger>Preview image</AccordionTrigger>
          <AccordionContent>
            <Stack gap="2">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=640&q=60"
                alt="Developer workstation"
                style={{
                  width: '100%',
                  borderRadius: 'var(--lumen-radius-md)',
                  display: 'block',
                }}
              />
              <Text size="sm" color="fg.muted">
                A typical developer setup.
              </Text>
            </Stack>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="cta">
          <AccordionTrigger>Ready to go?</AccordionTrigger>
          <AccordionContent>
            <Stack gap="3">
              <Text>Kick off the release once all items above are green.</Text>
              <Inline gap="2">
                <Button size="sm">Ship it</Button>
                <Button size="sm" variant="ghost">
                  Not yet
                </Button>
              </Inline>
            </Stack>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const LongContent: Story = {
  name: 'Edge case — long content',
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Accordion type="single" collapsible defaultValue="terms">
        <AccordionItem value="terms">
          <AccordionTrigger>Terms of service</AccordionTrigger>
          <AccordionContent>
            <Stack gap="2">
              {Array.from({ length: 4 }, (_, i) => (
                <Text key={`p-${i.toString()}`}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at suscipit metus,
                  ac lobortis nunc. Integer ornare pharetra orci, sit amet vehicula libero pulvinar
                  vel. Nulla facilisi. Cras sed ante quis nibh convallis bibendum.
                </Text>
              ))}
            </Stack>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
