import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table/index.js';

describe('Table', () => {
  it('renders semantic table structure', () => {
    render(
      <Table variant="striped" size="md">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader align="end">Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell numeric>10.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('data-variant', 'striped');
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    const amountHeader = screen.getByRole('columnheader', { name: 'Amount' });
    expect(amountHeader).toHaveAttribute('data-align', 'end');
    expect(amountHeader).toHaveAttribute('scope', 'col');
    expect(screen.getByRole('cell', { name: '10.00' })).toHaveAttribute('data-numeric', 'true');
  });
});
