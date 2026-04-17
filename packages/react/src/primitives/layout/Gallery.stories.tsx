import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { AspectRatio } from './AspectRatio/AspectRatio.js';
import { Box } from './Box/Box.js';
import { Center } from './Center/Center.js';
import { Container } from './Container/Container.js';
import { Divider } from './Divider/Divider.js';
import { Flex } from './Flex/Flex.js';
import { Grid } from './Grid/Grid.js';
import { Inline } from './Inline/Inline.js';
import { Section } from './Section/Section.js';
import { Spacer } from './Spacer/Spacer.js';
import { Stack } from './Stack/Stack.js';

const meta: Meta = {
  title: 'Layout/Gallery',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

// ── Reusable tile ─────────────────────────────────────────────────────

interface TileProps {
  readonly name: string;
  readonly description: string;
  readonly preview: React.ReactNode;
}

const Tile = ({ name, description, preview }: TileProps) => (
  <Box
    padding="4"
    background="bg.surface"
    borderWidth="1"
    borderStyle="solid"
    borderColor="border.default"
    borderRadius="md"
  >
    <Stack gap="3">
      <AspectRatio ratio={16 / 9}>
        <Center
          width="full"
          height="full"
          background="bg.subtle"
          borderRadius="sm"
          overflow="hidden"
          padding="2"
        >
          {preview}
        </Center>
      </AspectRatio>
      <Stack gap="1">
        <Heading level={4} size="md">
          {name}
        </Heading>
        <Text color="fg.muted" size="sm">
          {description}
        </Text>
      </Stack>
    </Stack>
  </Box>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <Box
    paddingX="2"
    paddingY="0.5"
    background="accent.soft"
    color="accent.solid"
    borderRadius="full"
  >
    <Text size="xs" weight="semibold">
      {children}
    </Text>
  </Box>
);

// ── Index ─────────────────────────────────────────────────────────────

export const Index: Story = {
  render: () => (
    <Box background="bg.canvas" minHeight="screen">
      <Section space="lg" paddingX={{ base: '4', md: '6' }}>
        <Container>
          <Stack gap="5">
            <Stack gap="2">
              <Heading level={1} size="4xl">
                Layout primitives
              </Heading>
              <Text size="lg" color="fg.muted">
                A catalogue of the layout system. Every primitive accepts the same
                <code> LayoutProps</code> surface plus its own opinionated props on top.
              </Text>
            </Stack>

            <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="4">
              <Tile
                name="Box"
                description="Zero-opinion div with the full LayoutProps surface."
                preview={
                  <Box padding="3" background="accent.soft" color="accent.solid" borderRadius="sm">
                    <Text weight="semibold">Box</Text>
                  </Box>
                }
              />
              <Tile
                name="Stack"
                description="Vertical flex with consistent gap."
                preview={
                  <Stack gap="1" width="full">
                    {['A', 'B', 'C'].map((l) => (
                      <Box
                        key={l}
                        padding="1"
                        background="accent.soft"
                        color="accent.solid"
                        borderRadius="sm"
                      >
                        <Text size="xs" weight="semibold">
                          {l}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                }
              />
              <Tile
                name="Inline"
                description="Horizontal flex that wraps by default."
                preview={
                  <Inline gap="1">
                    <Pill>one</Pill>
                    <Pill>two</Pill>
                    <Pill>three</Pill>
                  </Inline>
                }
              />
              <Tile
                name="Flex"
                description="Full-surface flex container with direction/grow/basis."
                preview={
                  <Flex gap="1" grow={1} width="full">
                    <Flex grow={1} background="accent.soft" padding="2" borderRadius="sm">
                      <Text size="xs">grow 1</Text>
                    </Flex>
                    <Flex grow={2} background="accent.soft" padding="2" borderRadius="sm">
                      <Text size="xs">grow 2</Text>
                    </Flex>
                  </Flex>
                }
              />
              <Tile
                name="Grid"
                description="CSS Grid with columns shorthand + raw templates."
                preview={
                  <Grid columns={3} gap="1" width="full">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <Box
                        key={n}
                        padding="2"
                        background="accent.soft"
                        color="accent.solid"
                        borderRadius="sm"
                      >
                        <Text size="xs" weight="semibold" align="center">
                          {n}
                        </Text>
                      </Box>
                    ))}
                  </Grid>
                }
              />
              <Tile
                name="Center"
                description="Centres children on both axes."
                preview={
                  <Center
                    background="accent.soft"
                    color="accent.solid"
                    width="full"
                    height="full"
                    borderRadius="sm"
                  >
                    <Text weight="semibold">•</Text>
                  </Center>
                }
              />
              <Tile
                name="Container"
                description="Max-width wrapper with size presets (sm/md/lg/xl/2xl/prose/full)."
                preview={
                  <Stack gap="1" width="full">
                    {(['sm', 'md', 'lg'] as const).map((s, i) => (
                      <Box
                        key={s}
                        padding="1"
                        background="accent.soft"
                        color="accent.solid"
                        borderRadius="sm"
                        width={`${40 + i * 25}%`}
                        marginX="auto"
                      >
                        <Text size="xs" align="center">
                          {s}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                }
              />
              <Tile
                name="Section"
                description="Semantic band with vertical rhythm."
                preview={
                  <Box width="full">
                    <Box padding="1" background="bg.canvas" width="full">
                      <Text size="xs" align="center" color="fg.muted">
                        canvas
                      </Text>
                    </Box>
                    <Box padding="2" background="accent.soft" color="accent.solid" width="full">
                      <Text size="xs" align="center">
                        section
                      </Text>
                    </Box>
                    <Box padding="1" background="bg.canvas" width="full">
                      <Text size="xs" align="center" color="fg.muted">
                        canvas
                      </Text>
                    </Box>
                  </Box>
                }
              />
              <Tile
                name="Divider"
                description="Horizontal or vertical rule, solid/dashed/dotted."
                preview={
                  <Stack gap="1" width="full">
                    <Text size="xs" color="fg.muted">
                      above
                    </Text>
                    <Divider />
                    <Text size="xs" color="fg.muted">
                      below
                    </Text>
                    <Divider variant="dashed" />
                    <Text size="xs" color="fg.muted">
                      dashed
                    </Text>
                  </Stack>
                }
              />
              <Tile
                name="Spacer"
                description="Flexible spacer that consumes leftover space."
                preview={
                  <Inline
                    width="full"
                    align="center"
                    padding="1"
                    background="accent.soft"
                    borderRadius="sm"
                  >
                    <Text size="xs" weight="semibold" color="accent.solid">
                      A
                    </Text>
                    <Spacer />
                    <Text size="xs" weight="semibold" color="accent.solid">
                      B
                    </Text>
                  </Inline>
                }
              />
              <Tile
                name="AspectRatio"
                description="Pins a child to a specific ratio (16/9, 1/1, 21/9…)."
                preview={
                  <AspectRatio ratio={16 / 9} width="full">
                    <Center
                      background="accent.soft"
                      color="accent.solid"
                      borderRadius="sm"
                      width="full"
                      height="full"
                    >
                      <Text size="xs" weight="semibold">
                        16 / 9
                      </Text>
                    </Center>
                  </AspectRatio>
                }
              />
            </Grid>
          </Stack>
        </Container>
      </Section>
    </Box>
  ),
};

// ── Realistic composition: dashboard ──────────────────────────────────

const DashboardCard = ({
  title,
  value,
  hint,
}: {
  readonly title: string;
  readonly value: string;
  readonly hint: string;
}) => (
  <Box
    padding="4"
    background="bg.surface"
    borderWidth="1"
    borderStyle="solid"
    borderColor="border.default"
    borderRadius="md"
  >
    <Stack gap="1">
      <Text color="fg.muted" size="sm">
        {title}
      </Text>
      <Heading level={3} size="2xl">
        {value}
      </Heading>
      <Text color="fg.subtle" size="sm">
        {hint}
      </Text>
    </Stack>
  </Box>
);

export const Dashboard: Story = {
  render: () => (
    <Box background="bg.canvas" minHeight="screen">
      <Box
        background="bg.surface"
        paddingY="3"
        paddingX={{ base: '4', md: '6' }}
        style={{ borderBottom: '1px solid var(--lumen-color-border-default)' }}
      >
        <Inline gap="3" align="center">
          <Box width="32px" height="32px" background="accent.solid" borderRadius="sm" />
          <Text weight="semibold">Lumen Admin</Text>
          <Spacer />
          <Inline gap="2">
            <Box
              paddingX="3"
              paddingY="1"
              borderRadius="sm"
              background="bg.subtle"
              color="fg.muted"
            >
              <Text size="sm">⌘K Search</Text>
            </Box>
            <Box width="32px" height="32px" borderRadius="full" background="bg.muted" />
          </Inline>
        </Inline>
      </Box>

      <Section space="lg">
        <Container>
          <Stack gap="6">
            <Stack gap="2">
              <Heading level={1} size="3xl">
                Overview
              </Heading>
              <Text color="fg.muted">Your fleet at a glance.</Text>
            </Stack>
            <Divider />

            <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
              <DashboardCard title="Active users" value="12,482" hint="+4.1% vs last week" />
              <DashboardCard title="Errors" value="37" hint="-18% vs yesterday" />
              <DashboardCard title="Latency (p95)" value="312ms" hint="steady" />
              <DashboardCard title="Revenue" value="$84,120" hint="+6.4% MoM" />
            </Grid>

            <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 280px' }} gap="4">
              <Box
                padding="4"
                background="bg.surface"
                borderRadius="md"
                borderWidth="1"
                borderStyle="solid"
                borderColor="border.default"
              >
                <Stack gap="3">
                  <Heading level={4} size="md">
                    Requests per minute
                  </Heading>
                  <AspectRatio ratio={16 / 6}>
                    <Center background="bg.subtle" borderRadius="sm" width="full" height="full">
                      <Text color="fg.muted">[chart placeholder]</Text>
                    </Center>
                  </AspectRatio>
                </Stack>
              </Box>
              <Box
                padding="4"
                background="bg.surface"
                borderRadius="md"
                borderWidth="1"
                borderStyle="solid"
                borderColor="border.default"
              >
                <Stack gap="2" dividers>
                  <Inline gap="2" align="center">
                    <Box
                      width="8px"
                      height="8px"
                      background="feedback.success.solid"
                      borderRadius="full"
                    />
                    <Text>api.prod</Text>
                    <Spacer />
                    <Text color="fg.muted">healthy</Text>
                  </Inline>
                  <Inline gap="2" align="center">
                    <Box
                      width="8px"
                      height="8px"
                      background="feedback.warning.solid"
                      borderRadius="full"
                    />
                    <Text>workers</Text>
                    <Spacer />
                    <Text color="fg.muted">degraded</Text>
                  </Inline>
                  <Inline gap="2" align="center">
                    <Box
                      width="8px"
                      height="8px"
                      background="feedback.danger.solid"
                      borderRadius="full"
                    />
                    <Text>scheduler</Text>
                    <Spacer />
                    <Text color="fg.muted">down</Text>
                  </Inline>
                </Stack>
              </Box>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </Box>
  ),
};
