import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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
          border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
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

export const Interaction: Story = {
  name: 'Interaction · reveals on scroll, scrolls to top on click',
  render: () => (
    <Stack gap="3">
      <Heading level={3}>Start of page</Heading>
      <TallContent rows={40} />
      <BackToTop showAfter={100} smooth={false} disablePortal />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Back to top' });
    // Hidden at the top of the page.
    await expect(button).toHaveAttribute('data-visible', 'false');

    // Scroll past the threshold; the scroll listener flips visibility.
    window.scrollTo(0, 400);
    window.dispatchEvent(new Event('scroll'));
    await waitFor(() => {
      expect(button).toHaveAttribute('data-visible', 'true');
    });

    await userEvent.click(button);
    // smooth={false} → instant jump back to the top.
    await waitFor(() => {
      expect(window.scrollY).toBeLessThan(100);
    });
  },
};
