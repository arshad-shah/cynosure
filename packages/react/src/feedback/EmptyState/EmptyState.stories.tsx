import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from './EmptyState.js';

const meta: Meta<typeof EmptyState> = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['default', 'subtle'] },
  },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

const IconInbox = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 30V12a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v18" />
    <path d="M6 30h10l3 4h10l3-4h10v8a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4Z" />
  </svg>
);

const IconSearch = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="22" cy="22" r="12" />
    <line x1="42" y1="42" x2="31" y2="31" />
  </svg>
);

const IconLock = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="10" y="22" width="28" height="18" rx="3" />
    <path d="M16 22v-6a8 8 0 0 1 16 0v6" />
  </svg>
);

const IconError = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="24" cy="24" r="18" />
    <path d="M17 17l14 14M31 17L17 31" />
  </svg>
);

const IconSparkles = (): React.ReactElement => (
  <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 48 48" fill="currentColor">
    <path d="M24 4l4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12Z" />
  </svg>
);

export const Playground: Story = {
  args: { size: 'md', variant: 'default' },
  render: (args) => (
    <EmptyState {...args}>
      <EmptyStateIcon>
        <IconSparkles />
      </EmptyStateIcon>
      <EmptyStateTitle>Get started</EmptyStateTitle>
      <EmptyStateDescription>Create your first project to begin.</EmptyStateDescription>
      <EmptyStateActions>
        <Button>New project</Button>
      </EmptyStateActions>
    </EmptyState>
  ),
};

export const NoData: Story = {
  name: 'No data — primary empty state',
  render: () => (
    <EmptyState>
      <EmptyStateIcon>
        <IconInbox />
      </EmptyStateIcon>
      <EmptyStateTitle>Your inbox is empty</EmptyStateTitle>
      <EmptyStateDescription>
        You are all caught up. New notifications will appear here as they arrive.
      </EmptyStateDescription>
    </EmptyState>
  ),
};

export const NoResults: Story = {
  name: 'No results — after a search or filter',
  render: () => (
    <EmptyState>
      <EmptyStateIcon>
        <IconSearch />
      </EmptyStateIcon>
      <EmptyStateTitle>No results found</EmptyStateTitle>
      <EmptyStateDescription>
        We could not find anything matching “cynosure@2.0”. Try a different query or clear your
        filters.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Inline gap="2">
          <Button variant="outline">Clear filters</Button>
          <Button>Search again</Button>
        </Inline>
      </EmptyStateActions>
    </EmptyState>
  ),
};

export const NoPermissions: Story = {
  name: 'No permissions — gated surface',
  render: () => (
    <EmptyState>
      <EmptyStateIcon>
        <IconLock />
      </EmptyStateIcon>
      <EmptyStateTitle>You do not have access</EmptyStateTitle>
      <EmptyStateDescription>
        Ask an administrator to grant you access to this workspace, or switch to an account that has
        access.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Inline gap="2">
          <Button variant="ghost">Back to home</Button>
          <Button variant="outline">Request access</Button>
        </Inline>
      </EmptyStateActions>
    </EmptyState>
  ),
};

export const ErrorState: Story = {
  name: 'Error — something went wrong',
  render: () => (
    <EmptyState>
      <EmptyStateIcon>
        <IconError />
      </EmptyStateIcon>
      <EmptyStateTitle>Something went wrong</EmptyStateTitle>
      <EmptyStateDescription>
        We could not load this page. Please try again in a moment.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </EmptyStateActions>
    </EmptyState>
  ),
};

export const WithPrimaryAction: Story = {
  name: 'With primary action — first-run state',
  render: () => (
    <EmptyState>
      <EmptyStateIcon>
        <IconSparkles />
      </EmptyStateIcon>
      <EmptyStateTitle>Create your first project</EmptyStateTitle>
      <EmptyStateDescription>
        Projects keep issues, builds, and members organized in one place.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Inline gap="2">
          <Button variant="ghost">Learn more</Button>
          <Button>New project</Button>
        </Inline>
      </EmptyStateActions>
    </EmptyState>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="6">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <EmptyState key={size} size={size}>
          <EmptyStateIcon>
            <IconInbox />
          </EmptyStateIcon>
          <EmptyStateTitle>Size: {size}</EmptyStateTitle>
          <EmptyStateDescription>Same content, rendered at the {size} scale.</EmptyStateDescription>
        </EmptyState>
      ))}
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="4">
      <EmptyState variant="default">
        <EmptyStateIcon>
          <IconInbox />
        </EmptyStateIcon>
        <EmptyStateTitle>Default</EmptyStateTitle>
        <EmptyStateDescription>The standard empty state.</EmptyStateDescription>
      </EmptyState>
      <EmptyState variant="subtle">
        <EmptyStateIcon>
          <IconInbox />
        </EmptyStateIcon>
        <EmptyStateTitle>Subtle</EmptyStateTitle>
        <EmptyStateDescription>A dimmer variant for nested contexts.</EmptyStateDescription>
      </EmptyState>
    </Stack>
  ),
};
