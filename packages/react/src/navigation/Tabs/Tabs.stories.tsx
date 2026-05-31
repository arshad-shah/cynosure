import type { Meta, StoryObj } from '@storybook/react';
import { type ReactElement, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs.js';

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['line', 'solid', 'enclosed', 'soft'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    colorScheme: { control: 'select', options: ['accent', 'neutral'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    fullWidth: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Text>Overview panel content.</Text>
      </TabsContent>
      <TabsContent value="activity">
        <Text>Activity panel content.</Text>
      </TabsContent>
      <TabsContent value="settings">
        <Text>Settings panel content.</Text>
      </TabsContent>
    </Tabs>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="6">
      {(['line', 'solid', 'enclosed', 'soft'] as const).map((variant) => (
        <Stack key={variant} gap="2">
          <Text size="sm" color="fg.muted">
            variant="{variant}"
          </Text>
          <Tabs defaultValue="one" variant={variant}>
            <TabsList>
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
              <TabsTrigger value="three">Three</TabsTrigger>
            </TabsList>
          </Tabs>
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
          <Tabs defaultValue="a" size={size} variant="soft">
            <TabsList>
              <TabsTrigger value="a">Alpha</TabsTrigger>
              <TabsTrigger value="b">Beta</TabsTrigger>
              <TabsTrigger value="c">Gamma</TabsTrigger>
            </TabsList>
          </Tabs>
        </Stack>
      ))}
    </Stack>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="draft" variant="soft">
      <TabsList>
        <TabsTrigger value="draft">Draft</TabsTrigger>
        <TabsTrigger value="review">In review</TabsTrigger>
        <TabsTrigger value="archived" disabled>
          Archived (locked)
        </TabsTrigger>
      </TabsList>
      <TabsContent value="draft">
        <Text>Editable draft.</Text>
      </TabsContent>
      <TabsContent value="review">
        <Text>Awaiting reviewer sign-off.</Text>
      </TabsContent>
      <TabsContent value="archived">
        <Text>Archived records are read-only.</Text>
      </TabsContent>
    </Tabs>
  ),
};

export const Controlled: Story = {
  render: () => {
    function ControlledTabs(): ReactElement {
      const [value, setValue] = useState('inbox');
      return (
        <Stack gap="3">
          <Inline gap="2">
            <Text size="sm" color="fg.muted">
              Active tab:
            </Text>
            <Text size="sm" weight="semibold">
              {value}
            </Text>
          </Inline>
          <Tabs value={value} onValueChange={setValue} variant="enclosed">
            <TabsList>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </TabsList>
            <TabsContent value="inbox">
              <Text>12 unread threads.</Text>
            </TabsContent>
            <TabsContent value="sent">
              <Text>No outgoing messages today.</Text>
            </TabsContent>
            <TabsContent value="drafts">
              <Text>3 drafts saved locally.</Text>
            </TabsContent>
          </Tabs>
        </Stack>
      );
    }
    return <ControlledTabs />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · click tab switches panel',
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Text>Overview panel content.</Text>
      </TabsContent>
      <TabsContent value="activity">
        <Text>Activity panel content.</Text>
      </TabsContent>
      <TabsContent value="settings">
        <Text>Settings panel content.</Text>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const activity = canvas.getByRole('tab', { name: 'Activity' });
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByText('Overview panel content.')).toBeVisible();
    // Inactive panels unmount, so Activity content is absent until selected.
    await expect(canvas.queryByText('Activity panel content.')).not.toBeInTheDocument();

    await userEvent.click(activity);
    await expect(activity).toHaveAttribute('aria-selected', 'true');
    await expect(overview).toHaveAttribute('aria-selected', 'false');
    await waitFor(() => {
      expect(canvas.getByText('Activity panel content.')).toBeVisible();
    });
    await expect(canvas.queryByText('Overview panel content.')).not.toBeInTheDocument();
  },
};
