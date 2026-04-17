import type { Meta, StoryObj } from '@storybook/react';
import { type ReactElement, useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Code } from '../../typography/Code/Code.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { paginationRange } from '../shared/paginationRange.js';
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

export const BoundaryBehavior: Story = {
  name: 'Boundary behavior — first & last pages',
  render: () => {
    function Demo(): ReactElement {
      const [page, setPage] = useState(1);
      return (
        <Stack gap="4">
          <Text size="sm" color="fg.muted">
            Click Prev / Next to watch the window slide along the ends.
          </Text>
          <Pagination totalPages={25} currentPage={page} onPageChange={setPage} showFirstLast />
          <Inline gap="2">
            {[1, 2, 12, 13, 24, 25].map((p) => (
              <button key={p} type="button" onClick={() => setPage(p)}>
                Jump to {p}
              </button>
            ))}
          </Inline>
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

export const CustomLabels: Story = {
  name: 'Accessible labels — i18n',
  render: () => {
    function Demo(): ReactElement {
      const [page, setPage] = useState(2);
      return (
        <Pagination
          totalPages={10}
          currentPage={page}
          onPageChange={setPage}
          aria-label="Pagination du tableau"
          labels={{
            previous: 'Page précédente',
            next: 'Page suivante',
            first: 'Première page',
            last: 'Dernière page',
            page: (p) => `Aller à la page ${p.toString()}`,
            current: (p) => `Page ${p.toString()}, page actuelle`,
          }}
        />
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

export const SinglePage: Story = {
  name: 'Edge — single page (buttons disabled)',
  render: () => (
    <Pagination totalPages={1} currentPage={1} onPageChange={() => undefined} showFirstLast />
  ),
};

export const PaginationRangeHelper: Story = {
  name: 'paginationRange helper',
  render: () => {
    const examples = [
      { total: 5, current: 3, siblingCount: 1, boundaryCount: 1 },
      { total: 20, current: 1, siblingCount: 1, boundaryCount: 1 },
      { total: 20, current: 10, siblingCount: 1, boundaryCount: 1 },
      { total: 20, current: 20, siblingCount: 1, boundaryCount: 1 },
      { total: 40, current: 15, siblingCount: 2, boundaryCount: 2 },
      { total: 100, current: 50, siblingCount: 1, boundaryCount: 1 },
    ];
    return (
      <Stack gap="3">
        <Heading level={4}>paginationRange() examples</Heading>
        <Text size="sm" color="fg.muted">
          The helper returns the visible page buttons with <code>'ellipsis-start'</code> and{' '}
          <code>'ellipsis-end'</code> markers — use it if you want to render the paginator yourself.
        </Text>
        <Stack gap="2">
          {examples.map((ex) => (
            <Inline
              key={`${ex.total.toString()}-${ex.current.toString()}-${ex.siblingCount.toString()}-${ex.boundaryCount.toString()}`}
              gap="3"
              align="baseline"
            >
              <Text size="sm" width="340px">
                total=<strong>{ex.total}</strong>, current=<strong>{ex.current}</strong>, siblings=
                {ex.siblingCount}, boundary={ex.boundaryCount}
              </Text>
              <Code>
                [
                {paginationRange({
                  totalPages: ex.total,
                  currentPage: ex.current,
                  siblingCount: ex.siblingCount,
                  boundaryCount: ex.boundaryCount,
                })
                  .map((item) => (typeof item === 'number' ? item.toString() : `'${item}'`))
                  .join(', ')}
                ]
              </Code>
            </Inline>
          ))}
        </Stack>
      </Stack>
    );
  },
};

export const TableFooter: Story = {
  name: 'Use case — table footer paginator',
  render: () => {
    function Demo(): ReactElement {
      const pageSize = 10;
      const total = 137;
      const [page, setPage] = useState(3);
      const totalPages = Math.ceil(total / pageSize);
      const start = (page - 1) * pageSize + 1;
      const end = Math.min(page * pageSize, total);
      return (
        <Inline align="center" justify="between" gap="3">
          <Text size="sm" color="fg.muted">
            Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{total}</strong>{' '}
            records
          </Text>
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} size="sm" />
        </Inline>
      );
    }
    return <Demo />;
  },
};
