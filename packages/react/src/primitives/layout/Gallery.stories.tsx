import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from './AspectRatio/AspectRatio.js';
import { Box } from './Box/Box.js';
import { Center } from './Center/Center.js';
import { Container } from './Container/Container.js';
import { Divider } from './Divider/Divider.js';
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

const Card = ({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
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
      <Box color="fg.muted">{title}</Box>
      <Box color="fg.default" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
        {value}
      </Box>
      <Box color="fg.subtle">{hint}</Box>
    </Stack>
  </Box>
);

/**
 * A dashboard-like layout built entirely from layout primitives — no component
 * from later phases is needed. Exit-criterion demo for Phase 05.
 */
export const Dashboard: Story = {
  render: () => (
    <Box background="bg.canvas" minHeight="screen">
      {/* Top bar */}
      <Box
        background="bg.surface"
        paddingY="3"
        paddingX={{ base: '4', md: '6' }}
        style={{ borderBottom: '1px solid var(--lumen-color-border-default)' }}
      >
        <Inline gap="3" align="center">
          <Box width="32px" height="32px" background="accent.solid" borderRadius="sm" />
          <Box color="fg.default">Lumen Admin</Box>
          <Spacer />
          <Inline gap="2">
            <Box
              paddingX="3"
              paddingY="1"
              borderRadius="sm"
              background="bg.subtle"
              color="fg.muted"
            >
              ⌘K Search
            </Box>
            <Box width="32px" height="32px" borderRadius="full" background="bg.muted" />
          </Inline>
        </Inline>
      </Box>

      <Section space="lg">
        <Container>
          <Stack gap="6">
            {/* Hero */}
            <Stack gap="2">
              <Box style={{ fontSize: '2rem', fontWeight: 700 }} color="fg.default">
                Overview
              </Box>
              <Box color="fg.muted">Your fleet at a glance.</Box>
            </Stack>
            <Divider />

            {/* Metric grid */}
            <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
              <Card title="Active users" value="12,482" hint="+4.1% vs last week" />
              <Card title="Errors" value="37" hint="-18% vs yesterday" />
              <Card title="Latency (p95)" value="312ms" hint="steady" />
              <Card title="Revenue" value="$84,120" hint="+6.4% MoM" />
            </Grid>

            {/* Wide content + side */}
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
                  <Box color="fg.default" style={{ fontWeight: 600 }}>
                    Requests per minute
                  </Box>
                  <AspectRatio ratio={16 / 6}>
                    <Center background="bg.subtle" borderRadius="sm">
                      <Box color="fg.muted">[chart placeholder]</Box>
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
                    <Box color="fg.default">api.prod</Box>
                    <Spacer />
                    <Box color="fg.muted">healthy</Box>
                  </Inline>
                  <Inline gap="2" align="center">
                    <Box
                      width="8px"
                      height="8px"
                      background="feedback.warning.solid"
                      borderRadius="full"
                    />
                    <Box color="fg.default">workers</Box>
                    <Spacer />
                    <Box color="fg.muted">degraded</Box>
                  </Inline>
                  <Inline gap="2" align="center">
                    <Box
                      width="8px"
                      height="8px"
                      background="feedback.danger.solid"
                      borderRadius="full"
                    />
                    <Box color="fg.default">scheduler</Box>
                    <Spacer />
                    <Box color="fg.muted">down</Box>
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
