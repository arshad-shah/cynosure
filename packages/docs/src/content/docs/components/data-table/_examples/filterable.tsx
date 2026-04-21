'use client';

import { type ColumnDef, DataTable } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

type Employee = { id: number; name: string; department: string; status: string };

const data: Employee[] = [
  { id: 1, name: 'Alice Martin', department: 'Engineering', status: 'Active' },
  { id: 2, name: 'Bob Chen', department: 'Design', status: 'Active' },
  { id: 3, name: 'Carol Smith', department: 'Product', status: 'Away' },
  { id: 4, name: 'Dan Kumar', department: 'Engineering', status: 'Inactive' },
  { id: 5, name: 'Eva Lopez', department: 'Marketing', status: 'Active' },
];

const columns: ColumnDef<Employee>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'status', header: 'Status' },
];

export default function Example() {
  const [search, setSearch] = useState('');

  return (
    <DataTable
      data={data}
      columns={columns}
      filter={{ global: search, onGlobalFilterChange: setSearch }}
      toolbar={
        <input
          type="search"
          placeholder="Search employees…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid var(--color-border)',
            width: 220,
          }}
        />
      }
      caption="Employees"
    />
  );
}
