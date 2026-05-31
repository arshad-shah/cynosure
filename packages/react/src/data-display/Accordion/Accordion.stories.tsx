import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion.js';

const meta: Meta<typeof Accordion> = {
  title: 'Data display/Accordion',
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

export const Interaction: Story = {
  name: 'Interaction · toggle expands and collapses a panel',
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Accordion type="single" collapsible>
        {FAQ_ITEMS.slice(0, 3).map((item) => (
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shipping = canvas.getByRole('button', { name: FAQ_ITEMS[0].q });
    await expect(shipping).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(shipping);
    await expect(shipping).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => {
      expect(canvas.getByText(FAQ_ITEMS[0].a)).toBeVisible();
    });

    // Collapsible single mode lets the open item close again.
    await userEvent.click(shipping);
    await expect(shipping).toHaveAttribute('aria-expanded', 'false');
  },
};
