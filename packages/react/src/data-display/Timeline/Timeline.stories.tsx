import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from './Timeline.js';

const meta: Meta<typeof Timeline> = {
  title: 'Data display/Timeline',
  component: Timeline,
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<typeof Timeline>;

const IconCommit = (): React.ReactElement => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <line x1="3" y1="12" x2="9" y2="12" />
    <line x1="15" y1="12" x2="21" y2="12" />
  </svg>
);

const IconCheck = (): React.ReactElement => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconAlert = (): React.ReactElement => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const Basic: Story = {
  args: { orientation: 'vertical', size: 'md' },
  render: (args) => (
    <Timeline {...args}>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Signed up</Text>
          <Text size="sm" color="fg.muted">
            Jan 14, 2024
          </Text>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Upgraded to Pro</Text>
          <Text size="sm" color="fg.muted">
            Feb 02, 2024
          </Text>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Invited three teammates</Text>
          <Text size="sm" color="fg.muted">
            Feb 10, 2024
          </Text>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const ActivityLog: Story = {
  name: 'Activity log with icons',
  render: () => (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot colorScheme="success" icon={<IconCommit />} />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Pushed 3 commits to main</Text>
          <Text size="sm" color="fg.muted">
            12 minutes ago · feat(forms): add async validation
          </Text>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot colorScheme="accent" icon={<IconCheck />} />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Merged PR #423</Text>
          <Text size="sm" color="fg.muted">
            1 hour ago · Adds DataTable selection API
          </Text>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot colorScheme="warning" icon={<IconAlert />} />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">CI workflow failed</Text>
          <Text size="sm" color="fg.muted">
            3 hours ago · Retry passed on second attempt
          </Text>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot colorScheme="neutral" />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Opened draft PR</Text>
          <Text size="sm" color="fg.muted">
            Yesterday · Refactor Tree keyboard handling
          </Text>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const ColorSchemes: Story = {
  render: () => (
    <Timeline>
      {(['accent', 'neutral', 'success', 'warning', 'danger', 'info'] as const).map((scheme) => (
        <TimelineItem key={scheme}>
          <TimelineSeparator>
            <TimelineDot colorScheme={scheme} />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Text weight="semibold">colorScheme="{scheme}"</Text>
            <Text size="sm" color="fg.muted">
              Dot takes a semantic color scheme.
            </Text>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  ),
};

export const Variants: Story = {
  name: 'Solid vs outline dots',
  render: () => (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="solid" colorScheme="accent" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Solid (default)</Text>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="outline" colorScheme="accent" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Outline</Text>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="outline" colorScheme="success" icon={<IconCheck />} />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Outline with icon</Text>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="5">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Stack key={size} gap="2">
          <Heading level={3} size="sm">
            size="{size}"
          </Heading>
          <Timeline size={size}>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Text>Step one</Text>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Text>Step two</Text>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
              </TimelineSeparator>
              <TimelineContent>
                <Text>Step three</Text>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Horizontal: Story = {
  name: 'Horizontal orientation',
  render: () => (
    <Timeline orientation="horizontal">
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot colorScheme="success" icon={<IconCheck />} />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Order placed</Text>
          <Text size="sm" color="fg.muted">
            Mon
          </Text>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot colorScheme="success" icon={<IconCheck />} />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Picked</Text>
          <Text size="sm" color="fg.muted">
            Tue
          </Text>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot colorScheme="accent" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">In transit</Text>
          <Text size="sm" color="fg.muted">
            Wed
          </Text>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="outline" colorScheme="neutral" />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Delivered</Text>
          <Text size="sm" color="fg.muted">
            Thu
          </Text>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const LongDescriptions: Story = {
  name: 'Edge case — long descriptions',
  render: () => (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot colorScheme="accent" icon={<IconCommit />} />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">Release candidate shipped</Text>
          <Text size="sm" color="fg.muted">
            This release candidate bundles every user-facing change from the last two sprints. It
            includes a redesigned Tree component, a new DataTable selection API, and overhauled
            keyboard handling across every overlay primitive. Full notes are attached below along
            with a migration guide for breaking changes in the theme layer.
          </Text>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot colorScheme="success" icon={<IconCheck />} />
        </TimelineSeparator>
        <TimelineContent>
          <Text weight="semibold">QA sign-off received</Text>
          <Text size="sm" color="fg.muted">
            QA signed off on the full suite after completing a 48-hour regression pass. No new
            critical issues were uncovered; two minor visual regressions were filed and will be
            addressed in a follow-up patch release.
          </Text>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const Many: Story = {
  name: 'Edge case — many items',
  render: () => (
    <div style={{ maxHeight: 420, overflow: 'auto' }}>
      <Timeline>
        {Array.from({ length: 20 }, (_, i) => (
          <TimelineItem key={`item-${i.toString()}`}>
            <TimelineSeparator>
              <TimelineDot
                colorScheme={i % 3 === 0 ? 'accent' : i % 3 === 1 ? 'success' : 'neutral'}
              />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Text weight="medium">Event {(i + 1).toString()}</Text>
              <Text size="sm" color="fg.muted">
                {new Date(2026, 3, i + 1).toDateString()}
              </Text>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  ),
};
