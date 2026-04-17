import type { Meta, StoryObj } from '@storybook/react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Badge } from './Badge.js';

const meta: Meta<typeof Badge> = {
  title: 'Feedback/Badge',
  component: Badge,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['solid', 'soft', 'outline', 'ghost'] },
    colorScheme: {
      control: 'select',
      options: ['accent', 'neutral', 'success', 'warning', 'danger', 'info'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md'] },
    shape: { control: 'select', options: ['default', 'pill', 'square'] },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

const IconCheck = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconStar = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconBolt = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const VARIANTS = ['solid', 'soft', 'outline', 'ghost'] as const;
const SCHEMES = ['accent', 'neutral', 'success', 'warning', 'danger', 'info'] as const;

export const Playground: Story = {
  args: {
    children: 'Badge',
    variant: 'soft',
    colorScheme: 'accent',
    size: 'md',
    shape: 'default',
  },
};

export const Variants: Story = {
  render: () => (
    <Inline gap="3">
      {VARIANTS.map((v) => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </Inline>
  ),
};

export const Matrix: Story = {
  name: 'Full matrix — variants x color schemes',
  render: () => (
    <Stack gap="3">
      {VARIANTS.map((variant) => (
        <Inline key={variant} gap="3" align="center">
          <Text size="sm" color="fg.muted" style={{ width: 64 }}>
            {variant}
          </Text>
          {SCHEMES.map((scheme) => (
            <Badge key={scheme} variant={variant} colorScheme={scheme}>
              {scheme}
            </Badge>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="3" align="center">
      <Badge size="xs">xs</Badge>
      <Badge size="sm">sm</Badge>
      <Badge size="md">md</Badge>
    </Inline>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Inline gap="3" align="center">
      <Badge shape="default">default</Badge>
      <Badge shape="pill">pill</Badge>
      <Badge shape="square">99+</Badge>
    </Inline>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Inline gap="3" align="center">
      <Badge icon={<IconCheck />} colorScheme="success">
        Verified
      </Badge>
      <Badge icon={<IconStar />} colorScheme="warning" variant="soft">
        Pro
      </Badge>
      <Badge icon={<IconBolt />} colorScheme="accent" variant="solid">
        Fast
      </Badge>
      <Badge icon={<IconStar />} colorScheme="neutral" variant="outline" shape="pill">
        Featured
      </Badge>
    </Inline>
  ),
};

export const Counts: Story = {
  name: 'Counts — numeric pills and squares',
  render: () => (
    <Stack gap="4">
      <Inline gap="3" align="center">
        <Badge variant="solid" colorScheme="danger" shape="pill" size="xs">
          3
        </Badge>
        <Badge variant="solid" colorScheme="danger" shape="pill" size="sm">
          12
        </Badge>
        <Badge variant="solid" colorScheme="danger" shape="pill" size="md">
          99+
        </Badge>
      </Inline>
      <Inline gap="3" align="center">
        <Badge variant="soft" colorScheme="accent" shape="square" size="xs">
          1
        </Badge>
        <Badge variant="soft" colorScheme="accent" shape="square" size="sm">
          42
        </Badge>
        <Badge variant="soft" colorScheme="accent" shape="square" size="md">
          1k
        </Badge>
      </Inline>
    </Stack>
  ),
};

export const Status: Story = {
  name: 'Status — online / new / beta',
  render: () => (
    <Stack gap="3">
      <Inline gap="2" align="center">
        <Badge variant="soft" colorScheme="success" shape="pill">
          Online
        </Badge>
        <Badge variant="soft" colorScheme="neutral" shape="pill">
          Offline
        </Badge>
        <Badge variant="soft" colorScheme="warning" shape="pill">
          Away
        </Badge>
        <Badge variant="soft" colorScheme="danger" shape="pill">
          Busy
        </Badge>
      </Inline>
      <Inline gap="2" align="center">
        <Badge variant="solid" colorScheme="accent" shape="pill" size="xs">
          NEW
        </Badge>
        <Badge variant="outline" colorScheme="info" shape="pill" size="xs">
          BETA
        </Badge>
        <Badge variant="solid" colorScheme="warning" shape="pill" size="xs">
          PREVIEW
        </Badge>
        <Badge variant="soft" colorScheme="danger" shape="pill" size="xs">
          DEPRECATED
        </Badge>
      </Inline>
    </Stack>
  ),
};

export const DotOnly: Story = {
  name: 'Dot — bare coloured dots',
  render: () => (
    <Stack gap="3">
      <Inline gap="3" align="center">
        {SCHEMES.map((scheme) => (
          <Inline key={scheme} gap="2" align="center">
            <Badge dot colorScheme={scheme} />
            <Text size="sm">{scheme}</Text>
          </Inline>
        ))}
      </Inline>
      <Inline gap="3" align="center">
        <Badge dot size="xs" colorScheme="success" />
        <Badge dot size="sm" colorScheme="success" />
        <Badge dot size="md" colorScheme="success" />
      </Inline>
    </Stack>
  ),
};

export const InContext: Story = {
  name: 'Realistic — labels with inline badges',
  render: () => (
    <Stack gap="3" width="420px">
      <Inline gap="2" align="center">
        <Text weight="medium">Dashboard</Text>
        <Badge variant="solid" colorScheme="accent" size="xs" shape="pill">
          NEW
        </Badge>
      </Inline>
      <Inline gap="2" align="center">
        <Text weight="medium">API tokens</Text>
        <Badge variant="soft" colorScheme="warning" size="xs" shape="pill">
          BETA
        </Badge>
      </Inline>
      <Inline gap="2" align="center">
        <Text weight="medium">Legacy exports</Text>
        <Badge variant="outline" colorScheme="danger" size="xs" shape="pill">
          DEPRECATED
        </Badge>
      </Inline>
      <Inline gap="2" align="center">
        <Text weight="medium">Messages</Text>
        <Badge variant="solid" colorScheme="danger" size="xs" shape="pill">
          7
        </Badge>
      </Inline>
    </Stack>
  ),
};

export const LongText: Story = {
  render: () => (
    <Inline gap="3" align="center">
      <Badge>A much longer label than usual</Badge>
      <Badge variant="outline" shape="pill">
        Label that gets truncated gracefully when space runs out
      </Badge>
    </Inline>
  ),
};
