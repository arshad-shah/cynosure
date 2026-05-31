import type { Meta, StoryObj } from '@storybook/react';
import { type ReactElement, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Pagination } from './Pagination.js';

const meta: Meta<typeof Pagination> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    siblingCount: { control: { type: 'number', min: 0, max: 4 } },
    boundaryCount: { control: { type: 'number', min: 0, max: 4 } },
    showFirstLast: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: () => {
    function Demo(): ReactElement {
      const [page, setPage] = useState(1);
      return <Pagination totalPages={5} currentPage={page} onPageChange={setPage} />;
    }
    return <Demo />;
  },
};

export const Sizes: Story = {
  render: () => {
    function Demo(): ReactElement {
      const [page, setPage] = useState(3);
      return (
        <Stack gap="4">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Stack key={size} gap="2">
              <Text size="sm" color="fg.muted">
                size="{size}"
              </Text>
              <Pagination totalPages={8} currentPage={page} onPageChange={setPage} size={size} />
            </Stack>
          ))}
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const LargeSetWithEllipsis: Story = {
  name: 'Large set — automatic ellipses',
  render: () => {
    function Demo(): ReactElement {
      const [page, setPage] = useState(7);
      return (
        <Stack gap="3">
          <Pagination totalPages={42} currentPage={page} onPageChange={setPage} />
          <Text size="sm" color="fg.muted">
            Current page: <strong>{page}</strong> of 42
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const ShowFirstLast: Story = {
  name: 'showFirstLast — extra nav buttons',
  render: () => {
    function Demo(): ReactElement {
      const [page, setPage] = useState(6);
      return (
        <Stack gap="3">
          <Text size="sm" color="fg.muted">
            <code>showFirstLast</code> adds First / Last buttons either side of Prev/Next.
          </Text>
          <Pagination totalPages={20} currentPage={page} onPageChange={setPage} showFirstLast />
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Controlled: Story = {
  render: () => {
    function ControlledPagination(): ReactElement {
      const [page, setPage] = useState(1);
      return (
        <Stack gap="3">
          <Inline gap="2" align="center">
            <Text size="sm" color="fg.muted">
              Current page:
            </Text>
            <Text size="sm" weight="semibold">
              {page}
            </Text>
            <button type="button" onClick={() => setPage(1)}>
              Reset
            </button>
            <button type="button" onClick={() => setPage((p) => Math.min(p + 5, 30))}>
              +5
            </button>
          </Inline>
          <Pagination totalPages={30} currentPage={page} onPageChange={setPage} siblingCount={2} />
        </Stack>
      );
    }
    return <ControlledPagination />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · clicking a page updates aria-current',
  render: () => {
    function Demo(): ReactElement {
      const [page, setPage] = useState(1);
      return <Pagination totalPages={5} currentPage={page} onPageChange={setPage} />;
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page1 = canvas.getByRole('button', { name: 'Page 1, current page' });
    await expect(page1).toHaveAttribute('aria-current', 'page');

    await userEvent.click(canvas.getByRole('button', { name: 'Go to page 3' }));
    const page3 = canvas.getByRole('button', { name: 'Page 3, current page' });
    await expect(page3).toHaveAttribute('aria-current', 'page');
    // The previously-current button drops aria-current once page 3 is active.
    await expect(canvas.getByRole('button', { name: 'Go to page 1' })).not.toHaveAttribute(
      'aria-current',
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(canvas.getByRole('button', { name: 'Page 4, current page' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};
