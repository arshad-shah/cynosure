import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from './Breadcrumb.js';

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

export const MaxItemsCollapse: Story = {
  name: 'maxItems — collapse middle items',
  render: () => (
    <Stack gap="4">
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
    </Stack>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <Stack gap="4">
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

export const Interaction: Story = {
  name: 'Interaction · links resolve, current page marked',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole('link', { name: 'Home' });
    const library = canvas.getByRole('link', { name: 'Library' });
    await expect(home).toHaveAttribute('href', '/');
    await expect(library).toHaveAttribute('href', '/library');
    // The current page renders as a non-link element carrying aria-current.
    const current = canvas.getByText('Data');
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(canvas.queryByRole('link', { name: 'Data' })).not.toBeInTheDocument();
    // Intermediate links are keyboard-focusable.
    await userEvent.tab();
    await expect(home).toHaveFocus();
    await userEvent.tab();
    await expect(library).toHaveFocus();
  },
};
