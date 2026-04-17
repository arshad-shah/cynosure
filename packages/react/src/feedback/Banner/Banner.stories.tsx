import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Banner, BannerActions, BannerContent, clearBannerDismissal } from './Banner.js';

const meta: Meta<typeof Banner> = {
  title: 'Feedback/Banner',
  component: Banner,
  parameters: { layout: 'padded' },
  argTypes: {
    status: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
    variant: { control: 'select', options: ['solid', 'soft', 'outline', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    closable: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Banner>;

export const Playground: Story = {
  args: {
    status: 'info',
    variant: 'soft',
    size: 'md',
  },
  render: (args) => (
    <Banner {...args}>
      <BannerContent>
        <Text weight="semibold">Lumen UI</Text>
        <Text size="sm">A new feedback module is now available.</Text>
      </BannerContent>
    </Banner>
  ),
};

export const Announcement: Story = {
  name: 'Basic announcement',
  render: () => (
    <Banner status="info">
      <BannerContent>
        <Text weight="semibold">We have updated our terms of service.</Text>
        <Text size="sm">Please review the changes by August 30.</Text>
      </BannerContent>
    </Banner>
  ),
};

export const Statuses: Story = {
  render: () => (
    <Stack gap="3">
      <Banner status="info">
        <BannerContent>
          <Text weight="semibold">Info</Text>
          <Text size="sm">Scheduled maintenance tonight at 22:00 UTC.</Text>
        </BannerContent>
      </Banner>
      <Banner status="success">
        <BannerContent>
          <Text weight="semibold">Success</Text>
          <Text size="sm">All services are operating normally.</Text>
        </BannerContent>
      </Banner>
      <Banner status="warning">
        <BannerContent>
          <Text weight="semibold">Warning</Text>
          <Text size="sm">Your free trial ends in 3 days.</Text>
        </BannerContent>
      </Banner>
      <Banner status="danger">
        <BannerContent>
          <Text weight="semibold">Danger</Text>
          <Text size="sm">Your card was declined — update payment to continue.</Text>
        </BannerContent>
      </Banner>
    </Stack>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Banner status="warning">
      <BannerContent>
        <Text weight="semibold">Your free trial ends in 3 days</Text>
        <Text size="sm">Upgrade now to keep access to advanced features.</Text>
      </BannerContent>
      <BannerActions>
        <Button size="sm" variant="ghost">
          Later
        </Button>
        <Button size="sm" colorScheme="warning">
          Upgrade
        </Button>
      </BannerActions>
    </Banner>
  ),
};

export const Closable: Story = {
  name: 'Closable — controlled via useState',
  render: () => {
    function Demo(): React.ReactElement {
      const [open, setOpen] = useState(true);
      return (
        <Stack gap="3">
          {open ? (
            <Banner status="info" closable onClose={() => setOpen(false)}>
              <BannerContent>
                <Text weight="semibold">Heads up</Text>
                <Text size="sm">Dismiss me with the × button.</Text>
              </BannerContent>
            </Banner>
          ) : (
            <Inline gap="2" align="center">
              <Text size="sm" color="fg.muted">
                Banner dismissed.
              </Text>
              <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                Restore
              </Button>
            </Inline>
          )}
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const PersistentDismissal: Story = {
  name: 'Persistent dismissal — dismissKey + clearBannerDismissal',
  render: () => {
    const KEY = 'story-onboarding-banner';
    function Demo(): React.ReactElement {
      const [nonce, setNonce] = useState(0);
      const reset = (): void => {
        clearBannerDismissal(KEY);
        setNonce((n) => n + 1);
      };
      return (
        <Stack gap="3">
          <Banner key={nonce} status="info" closable dismissKey={KEY}>
            <BannerContent>
              <Text weight="semibold">Welcome to Lumen</Text>
              <Text size="sm">
                Dismissing this banner persists via <code>localStorage</code> under the key
                <code> lumen:banner:{KEY}</code>.
              </Text>
            </BannerContent>
          </Banner>
          <Inline gap="2" align="center">
            <Button size="sm" variant="outline" onClick={reset}>
              Reset dismissal
            </Button>
            <Text size="sm" color="fg.muted">
              Calls <code>clearBannerDismissal('{KEY}')</code> and remounts the banner.
            </Text>
          </Inline>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const FullWidth: Story = {
  name: 'Full-width layout — edge-to-edge banner at top of page',
  render: () => (
    <div
      style={{
        marginInline: 'calc(-1 * var(--lumen-space-6, 24px))',
        width: 'calc(100% + 2 * var(--lumen-space-6, 24px))',
      }}
    >
      <Banner status="danger" closable>
        <BannerContent>
          <Text weight="semibold">Degraded performance</Text>
          <Text size="sm">We are investigating elevated latency in the US-East region.</Text>
        </BannerContent>
        <BannerActions>
          <Button size="sm" variant="outline">
            Status page
          </Button>
        </BannerActions>
      </Banner>
    </div>
  ),
};

export const OnboardingBanner: Story = {
  name: 'Realistic — onboarding banner with CTA',
  render: () => (
    <Banner status="info" variant="soft">
      <BannerContent>
        <Text weight="semibold">Finish setting up your workspace</Text>
        <Text size="sm">Invite teammates and connect your repository.</Text>
      </BannerContent>
      <BannerActions>
        <Button size="sm" variant="ghost">
          Skip
        </Button>
        <Button size="sm">Continue setup</Button>
      </BannerActions>
    </Banner>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Banner key={size} size={size} status="info">
          <BannerContent>
            <Text weight="semibold">Size: {size}</Text>
            <Text size="sm">A {size} banner.</Text>
          </BannerContent>
        </Banner>
      ))}
    </Stack>
  ),
};
