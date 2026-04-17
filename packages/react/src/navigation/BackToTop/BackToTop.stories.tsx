import type { Meta, StoryObj } from '@storybook/react';
import { type ReactElement, useRef } from 'react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { BackToTop } from './BackToTop.js';

const meta: Meta<typeof BackToTop> = {
  title: 'Navigation/BackToTop',
  component: BackToTop,
  parameters: { layout: 'padded' },
  argTypes: {
    showAfter: { control: { type: 'number', min: 0, max: 2000 } },
    position: {
      control: 'select',
      options: ['bottom-right', 'bottom-left', 'bottom-center'],
    },
    smooth: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof BackToTop>;

/**
 * Shared filler that provides enough content for the page to scroll. The
 * component listens on `window` scroll, so we need real document-level
 * overflow (not a scrolling container) to trigger visibility.
 */
const TallContent = ({ rows = 30 }: { rows?: number }): ReactElement => (
  <Stack gap="3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={`row-${i.toString()}`}
        style={{
          padding: 16,
          border: '1px solid var(--lumen-color-border-subtle, #e5e7eb)',
          borderRadius: 8,
        }}
      >
        <Text weight="semibold">Section {i + 1}</Text>
        <Text color="fg.muted">
          Scroll the page to reveal the Back-to-top button. Once it appears, click to scroll back to
          section 1.
        </Text>
      </div>
    ))}
  </Stack>
);

export const Default: Story = {
  render: () => (
    <Stack gap="3">
      <Heading level={3}>Start of page</Heading>
      <Text color="fg.muted">
        Scroll down a few hundred pixels to reveal the floating button in the bottom-right corner.
      </Text>
      <TallContent />
      <BackToTop />
    </Stack>
  ),
};

export const CustomThreshold: Story = {
  name: 'showAfter — custom scroll threshold',
  render: () => (
    <Stack gap="3">
      <Text size="sm" color="fg.muted">
        Button reveals after scrolling <strong>1000px</strong> — keep scrolling.
      </Text>
      <TallContent rows={60} />
      <BackToTop showAfter={1000} />
    </Stack>
  ),
};

export const Positions: Story = {
  name: 'Position presets',
  render: () => (
    <Stack gap="3">
      <Text size="sm" color="fg.muted">
        Three buttons, one per preset. In real usage you'd pick just one.
      </Text>
      <TallContent />
      <BackToTop position="bottom-left" showAfter={100} label="Back to top (left)" />
      <BackToTop position="bottom-center" showAfter={100} label="Back to top (center)" />
      <BackToTop position="bottom-right" showAfter={100} label="Back to top (right)" />
    </Stack>
  ),
};

export const CustomIcon: Story = {
  render: () => (
    <Stack gap="3">
      <TallContent />
      <BackToTop
        showAfter={120}
        icon={
          <span aria-hidden="true" style={{ fontWeight: 700 }}>
            ↑
          </span>
        }
      />
    </Stack>
  ),
};

export const CustomLabel: Story = {
  render: () => (
    <Stack gap="3">
      <TallContent />
      <BackToTop showAfter={120} label="Naar boven" />
    </Stack>
  ),
};

export const InstantScroll: Story = {
  name: 'smooth={false} — jump immediately',
  render: () => (
    <Stack gap="3">
      <Text size="sm" color="fg.muted">
        Disables smooth scrolling — jumps straight to the top.
      </Text>
      <TallContent />
      <BackToTop showAfter={120} smooth={false} />
    </Stack>
  ),
};

export const ContainedInPortalTarget: Story = {
  name: 'Portal target — render next to a custom element',
  render: () => {
    function Demo(): ReactElement {
      const containerRef = useRef<HTMLDivElement>(null);
      return (
        <Stack gap="3">
          <Text size="sm" color="fg.muted">
            The button is portaled into a labelled container below (handy for scoping z-index).
          </Text>
          <TallContent />
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              marginTop: 24,
              padding: 16,
              border: '1px dashed var(--lumen-color-border-subtle, #e5e7eb)',
              borderRadius: 8,
            }}
          >
            <Text size="sm" weight="semibold">
              Portal target
            </Text>
          </div>
          <BackToTop
            showAfter={80}
            container={() => containerRef.current ?? document.body}
            position="bottom-right"
          />
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const DisablePortal: Story = {
  name: 'disablePortal — render inline',
  render: () => (
    <Stack gap="3">
      <Text size="sm" color="fg.muted">
        Skips the portal and renders inline — useful for unit tests or shadow-DOM embedding.
      </Text>
      <TallContent />
      <BackToTop showAfter={100} disablePortal />
    </Stack>
  ),
};

export const DocsUseCase: Story = {
  name: 'Use case — long docs article',
  render: () => (
    <Stack gap="4">
      <Heading level={2}>Release notes</Heading>
      <Text color="fg.muted">
        Long-form articles benefit from a persistent return-to-top affordance so readers can get
        back to the table of contents without hammering on the scroll wheel.
      </Text>
      {Array.from({ length: 12 }).map((_, i) => (
        <Stack key={`entry-${i.toString()}`} gap="2">
          <Heading level={3}>v1.{i}.0</Heading>
          <Text>
            Release {i}: bug fixes and incremental improvements. Introduced the X feature, replaced
            Y with Z, and bumped the minimum Node requirement.
          </Text>
          <Text color="fg.muted">Published {i} weeks ago.</Text>
        </Stack>
      ))}
      <BackToTop showAfter={300} />
    </Stack>
  ),
};
