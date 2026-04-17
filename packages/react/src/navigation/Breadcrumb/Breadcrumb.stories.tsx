import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './Breadcrumb.js';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  parameters: { layout: 'padded' },
  argTypes: {
    maxItems: { control: { type: 'number', min: 2, max: 10 } },
    itemsBeforeCollapse: { control: { type: 'number', min: 0, max: 5 } },
    itemsAfterCollapse: { control: { type: 'number', min: 0, max: 5 } },
  },
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

const IconHome = (): ReactElement => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconFolder = (): ReactElement => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const IconFile = (): ReactElement => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/library">Library</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>
        <BreadcrumbPage>Data</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">
          <IconHome />
          <span style={{ marginLeft: 6 }}>Home</span>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/projects">
          <IconFolder />
          <span style={{ marginLeft: 6 }}>Projects</span>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>
        <BreadcrumbPage>
          <IconFile />
          <span style={{ marginLeft: 6 }}>readme.md</span>
        </BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const CurrentPage: Story = {
  name: 'Current page vs. link styles',
  render: () => (
    <Stack gap="4">
      <Text size="sm" color="fg.muted">
        Links remain underlined on hover; the last item uses <code>BreadcrumbPage</code>.
      </Text>
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/billing">Billing</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/billing/invoices">Invoices</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          <BreadcrumbPage>Q3 2025</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
    </Stack>
  ),
};

export const MaxItemsCollapse: Story = {
  name: 'maxItems — collapse middle items',
  render: () => (
    <Stack gap="4">
      <Text size="sm" color="fg.muted">
        Without <code>maxItems</code>:
      </Text>
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a">Org</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a/b">Team</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a/b/c">Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a/b/c/d">Storefront</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          <BreadcrumbPage>Checkout</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
      <Text size="sm" color="fg.muted">
        With <code>maxItems=&#123;4&#125;</code> — middle items fold into an ellipsis button:
      </Text>
      <Breadcrumb maxItems={4}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a">Org</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a/b">Team</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a/b/c">Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a/b/c/d">Storefront</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          <BreadcrumbPage>Checkout</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
      <Text size="sm" color="fg.muted">
        <code>itemsBeforeCollapse=&#123;2&#125; itemsAfterCollapse=&#123;1&#125;</code>:
      </Text>
      <Breadcrumb maxItems={4} itemsBeforeCollapse={2} itemsAfterCollapse={1}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a">Org</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a/b">Team</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a/b/c">Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a/b/c/d">Storefront</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          <BreadcrumbPage>Checkout</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
    </Stack>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <Stack gap="4">
      <Text size="sm" color="fg.muted">
        Slashes:
      </Text>
      <Breadcrumb separator={<span aria-hidden>/</span>}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Docs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/guides">Guides</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          <BreadcrumbPage>Theming</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
      <Text size="sm" color="fg.muted">
        Bullet:
      </Text>
      <Breadcrumb separator={<span aria-hidden>•</span>}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Blog</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/2026">2026</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          <BreadcrumbPage>April</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
      <Text size="sm" color="fg.muted">
        Arrow:
      </Text>
      <Breadcrumb separator={<span aria-hidden>→</span>}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Shop</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/shoes">Shoes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          <BreadcrumbPage>Runners</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
    </Stack>
  ),
};

export const CustomCollapsedTrigger: Story = {
  name: 'renderCollapsed — custom trigger',
  render: () => (
    <Breadcrumb
      maxItems={3}
      renderCollapsed={(hidden) => (
        <BreadcrumbEllipsis label={`Show ${hidden.length.toString()} hidden items`} />
      )}
    >
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/docs/ref">Reference</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="/docs/ref/nav">Navigation</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>
        <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const ManualSeparators: Story = {
  name: 'Manual separators (opt-out of auto-interleave)',
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Root</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator>|</BreadcrumbSeparator>
      <BreadcrumbItem>
        <BreadcrumbLink href="/assets">Assets</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator>|</BreadcrumbSeparator>
      <BreadcrumbItem isCurrent>
        <BreadcrumbPage>Branding</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const ECommerce: Story = {
  name: 'Use case — e-commerce trail',
  render: () => (
    <Stack gap="3">
      <Breadcrumb aria-label="Category trail">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            <IconHome />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/women">Women</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/women/shoes">Shoes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/women/shoes/sneakers">Sneakers</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          <BreadcrumbPage>Air Runner 2</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
      <Text size="sm" color="fg.muted">
        Customers expect the last crumb to match the `&lt;h1&gt;` of the page.
      </Text>
    </Stack>
  ),
};

export const LongLabels: Story = {
  name: 'Edge — long labels & deep trail',
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Breadcrumb maxItems={5}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Marketing</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/q3">Q3 Planning Session Notes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/q3/field">Field enablement artifacts</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/q3/field/assets">Design system collaborations</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/q3/field/assets/ds">
            Component library migration status
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          <BreadcrumbPage>Breadcrumb revamp — RFC draft v2 (open)</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
    </div>
  ),
};
