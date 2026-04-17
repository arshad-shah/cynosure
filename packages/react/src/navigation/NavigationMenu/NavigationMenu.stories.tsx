import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from './NavigationMenu.js';

const meta: Meta<typeof NavigationMenu> = {
  title: 'Navigation/NavigationMenu',
  component: NavigationMenu,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof NavigationMenu>;

type LinkItem = { title: string; description: string; href: string };

const features: LinkItem[] = [
  {
    title: 'Analytics',
    description: 'Understand your audience without leaving the dashboard.',
    href: '#analytics',
  },
  {
    title: 'Automations',
    description: 'Stitch together workflows between your tools.',
    href: '#automations',
  },
  {
    title: 'Integrations',
    description: 'Over 40 partners with one-click install.',
    href: '#integrations',
  },
  {
    title: 'Experiments',
    description: 'Ship variants behind a feature flag.',
    href: '#experiments',
  },
];

const resources: LinkItem[] = [
  {
    title: 'Documentation',
    description: 'Guides, references, and tutorials.',
    href: '#docs',
  },
  {
    title: 'Changelog',
    description: 'See what just shipped.',
    href: '#changelog',
  },
  {
    title: 'Status',
    description: 'Live uptime and incident reports.',
    href: '#status',
  },
  {
    title: 'Community',
    description: 'Join the Discord.',
    href: '#community',
  },
];

const LinkList = ({ items }: { items: LinkItem[] }): ReactElement => (
  <ul
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 12,
      listStyle: 'none',
      margin: 0,
      padding: 16,
      minWidth: 480,
    }}
  >
    {items.map((item) => (
      <li key={item.href}>
        <NavigationMenuLink
          href={item.href}
          style={{
            display: 'block',
            padding: 12,
            borderRadius: 8,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Text weight="semibold" size="sm">
            {item.title}
          </Text>
          <Text size="sm" color="fg.muted">
            {item.description}
          </Text>
        </NavigationMenuLink>
      </li>
    ))}
  </ul>
);

export const SingleLevel: Story = {
  name: 'Single level — flat links',
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#home" active>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#blog">Blog</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const TriggerWithContent: Story = {
  name: 'Trigger → content panel',
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <LinkList items={features} />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <LinkList items={resources} />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithViewport: Story = {
  name: 'With shared viewport (animated)',
  render: () => (
    <div style={{ position: 'relative' }}>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Product</NavigationMenuTrigger>
            <NavigationMenuContent>
              <LinkList items={features} />
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <LinkList items={resources} />
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuIndicator />
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>
    </div>
  ),
};

export const MegaMenu: Story = {
  name: 'Mega-menu — featured column + grid',
  render: () => (
    <div style={{ position: 'relative' }}>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '240px 1fr',
                  gap: 16,
                  padding: 16,
                  minWidth: 640,
                }}
              >
                <NavigationMenuLink
                  href="#intro"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 16,
                    background:
                      'linear-gradient(135deg, var(--lumen-color-accent-9, #4f46e5), var(--lumen-color-accent-11, #312e81))',
                    color: '#fff',
                    borderRadius: 10,
                    textDecoration: 'none',
                  }}
                >
                  <Heading level={4} size="md" style={{ color: '#fff' }}>
                    Lumen Platform
                  </Heading>
                  <Text size="sm" style={{ color: '#fff' }}>
                    Everything you need to ship a polished UI.
                  </Text>
                </NavigationMenuLink>
                <LinkList items={features} />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <LinkList items={resources} />
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuIndicator />
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>
    </div>
  ),
};

export const HideChevron: Story = {
  name: 'Trigger without caret',
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger hideChevron>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <LinkList items={features} />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger hideChevron>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <LinkList items={resources} />
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const ActiveLink: Story = {
  name: 'active — current-page highlight',
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#home">Home</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#features">Features</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing" active>
            Pricing (current)
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#contact">Contact</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const TopNavUseCase: Story = {
  name: 'Use case — marketing site header',
  render: () => (
    <Stack gap="3">
      <Text size="sm" color="fg.muted">
        Full-width header strip with brand, primary nav, and CTA.
      </Text>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          border: '1px solid var(--lumen-color-border-subtle, #e5e7eb)',
          borderRadius: 12,
        }}
      >
        <Text weight="semibold">Acme</Text>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Product</NavigationMenuTrigger>
              <NavigationMenuContent>
                <LinkList items={features} />
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <LinkList items={resources} />
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#enterprise">Enterprise</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuIndicator />
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>
        <a href="#signup" style={{ fontWeight: 600 }}>
          Sign up →
        </a>
      </div>
    </Stack>
  ),
};
