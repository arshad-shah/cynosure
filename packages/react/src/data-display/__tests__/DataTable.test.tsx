import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type ColumnDef, DataTable } from '../DataTable/index.js';

type Row = { id: string; name: string; amount: number };

const rows: Row[] = [
  { id: '1', name: 'Charlie', amount: 30 },
  { id: '2', name: 'Alice', amount: 10 },
  { id: '3', name: 'Bob', amount: 20 },
];

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'amount', header: 'Amount' },
];

describe('DataTable', () => {
  it('renders headers and rows', () => {
    render(<DataTable data={rows} columns={columns} />);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Charlie' })).toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    render(<DataTable data={[] as Row[]} columns={columns} emptyState="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('sort toggles aria-sort', () => {
    render(<DataTable data={rows} columns={columns} sortable />);
    const header = screen.getByRole('columnheader', { name: /name/i });
    expect(header).toHaveAttribute('aria-sort', 'none');
    const button = within(header).getByRole('button');
    fireEvent.click(button);
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    // Alice should now come before Charlie
    const cells = screen
      .getAllByRole('cell')
      .filter((c) => c.getAttribute('data-numeric') !== 'true');
    const names = cells
      .map((c) => c.textContent)
      .filter((v) => v === 'Alice' || v === 'Charlie' || v === 'Bob');
    expect(names[0]).toBe('Alice');
  });

  it('selection calls onSelectionChange', () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable data={rows} columns={columns} selectable onSelectionChange={onSelectionChange} />,
    );
    const [firstCheckbox] = screen.getAllByRole('checkbox', { name: 'Select row' });
    if (!firstCheckbox) throw new Error('missing checkbox');
    fireEvent.click(firstCheckbox);
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('renders loading skeletons when loading', () => {
    const { container } = render(
      <DataTable data={rows} columns={columns} loading loadingRows={3} />,
    );
    // Skeleton span elements live inside the table body
    const skeletons = container.querySelectorAll('span[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});
