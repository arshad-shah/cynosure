import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Badge } from '../../feedback/Badge/Badge.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeader,
  TableRow,
} from './Table.js';

const meta: Meta<typeof Table> = {
  title: 'Data display/Table',
  component: Table,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['line', 'striped', 'grid', 'minimal'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    stickyHeader: { control: 'boolean' },
    layout: { control: 'select', options: ['auto', 'fixed'] },
  },
};
export default meta;
type Story = StoryObj<typeof Table>;

interface InvoiceRow {
  id: string;
  customer: string;
  status: 'paid' | 'pending' | 'overdue';
  method: string;
  amount: number;
}

const INVOICES: InvoiceRow[] = [
  { id: 'INV-001', customer: 'Ava Thompson', status: 'paid', method: 'Credit card', amount: 250 },
  {
    id: 'INV-002',
    customer: 'Marcus Lin',
    status: 'pending',
    method: 'Bank transfer',
    amount: 150,
  },
  { id: 'INV-003', customer: 'Sara Park', status: 'overdue', method: 'PayPal', amount: 320 },
  { id: 'INV-004', customer: 'Dylan Moore', status: 'paid', method: 'Credit card', amount: 99 },
  { id: 'INV-005', customer: 'Nia Adebayo', status: 'paid', method: 'Credit card', amount: 480 },
];

const currency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const statusColor = (status: InvoiceRow['status']): 'success' | 'warning' | 'danger' => {
  if (status === 'paid') return 'success';
  if (status === 'pending') return 'warning';
  return 'danger';
};

export const Basic: Story = {
  args: { variant: 'line', size: 'md' },
  render: (args) => (
    <Table {...args}>
      <TableCaption>Recent invoices</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeader>Invoice</TableHeader>
          <TableHeader>Customer</TableHeader>
          <TableHeader>Method</TableHeader>
          <TableHeader align="end">Amount</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {INVOICES.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.customer}</TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell numeric>{currency(row.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell numeric>{currency(INVOICES.reduce((sum, r) => sum + r.amount, 0))}</TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="6">
      {(['line', 'striped', 'grid', 'minimal'] as const).map((variant) => (
        <Stack key={variant} gap="2">
          <Heading level={3} size="sm">
            variant="{variant}"
          </Heading>
          <Table variant={variant}>
            <TableHead>
              <TableRow>
                <TableHeader>Invoice</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader align="end">Amount</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {INVOICES.slice(0, 3).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell numeric>{currency(row.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Stack key={size} gap="2">
          <Heading level={3} size="sm">
            size="{size}"
          </Heading>
          <Table size={size}>
            <TableHead>
              <TableRow>
                <TableHeader>Invoice</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader align="end">Amount</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {INVOICES.slice(0, 3).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell numeric>{currency(row.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      ))}
    </Stack>
  ),
};

export const WithStatusBadges: Story = {
  name: 'With status badges',
  render: () => (
    <Table variant="striped">
      <TableHead>
        <TableRow>
          <TableHeader>Invoice</TableHeader>
          <TableHeader>Customer</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader align="end">Amount</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {INVOICES.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.customer}</TableCell>
            <TableCell>
              <Badge colorScheme={statusColor(row.status)} size="sm">
                {row.status}
              </Badge>
            </TableCell>
            <TableCell numeric>{currency(row.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const StickyHeader: Story = {
  name: 'Sticky header (scrollable)',
  render: () => (
    <div
      style={{
        maxHeight: 280,
        overflow: 'auto',
        border: '1px solid var(--cynosure-color-border-default)',
        borderRadius: 'var(--cynosure-radius-md)',
      }}
    >
      <Table variant="striped" stickyHeader>
        <TableHead>
          <TableRow>
            <TableHeader>Invoice</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader>Method</TableHeader>
            <TableHeader align="end">Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 40 }, (_, i) => {
            const row = INVOICES[i % INVOICES.length];
            if (!row) return null;
            return (
              <TableRow key={`sticky-${i.toString()}`}>
                <TableCell>{`${row.id}-${i.toString().padStart(2, '0')}`}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.method}</TableCell>
                <TableCell numeric>{currency(row.amount + i)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  ),
};

export const EmptyState: Story = {
  name: 'Empty state',
  render: () => (
    <Table variant="line">
      <TableHead>
        <TableRow>
          <TableHeader>Invoice</TableHeader>
          <TableHeader>Customer</TableHeader>
          <TableHeader align="end">Amount</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} align="center">
            <Stack gap="1" align="center">
              <Text weight="semibold">No invoices yet</Text>
              <Text size="sm" color="fg.muted">
                When customers pay you, their invoices will show up here.
              </Text>
            </Stack>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · renders semantic table structure',
  render: () => (
    <Table>
      <TableCaption>Recent invoices</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeader>Invoice</TableHeader>
          <TableHeader>Customer</TableHeader>
          <TableHeader align="end">Amount</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {INVOICES.slice(0, 3).map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.customer}</TableCell>
            <TableCell numeric>{currency(row.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The semantic table exposes a name from its caption.
    const table = canvas.getByRole('table', { name: 'Recent invoices' });
    await expect(table).toBeInTheDocument();

    // Three column headers, scoped to their column for assistive tech.
    const headers = canvas.getAllByRole('columnheader');
    await expect(headers).toHaveLength(3);
    await expect(headers[0]).toHaveAttribute('scope', 'col');

    // Body rows: 3 data rows + 1 header row = 4 total.
    await expect(canvas.getAllByRole('row')).toHaveLength(4);

    // Numeric cells are right-aligned via data-align.
    const amountCell = canvas.getByText('$250.00').closest('td');
    await expect(amountCell).toHaveAttribute('data-align', 'end');
  },
};
