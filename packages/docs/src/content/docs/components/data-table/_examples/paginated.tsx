import { type ColumnDef, DataTable } from '@arshad-shah/cynosure-react';

type Order = { id: string; customer: string; total: number; status: string };

const CUSTOMERS = ['Alice', 'Bob', 'Carol', 'Dan', 'Eva', 'Frank'] as const;
const STATUSES = ['Shipped', 'Pending', 'Delivered', 'Cancelled'] as const;

const data: Order[] = Array.from({ length: 12 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(3, '0')}`,
  customer: CUSTOMERS[i % CUSTOMERS.length] ?? 'Unknown',
  total: Number(((i + 1) * 17.5).toFixed(2)),
  status: STATUSES[i % STATUSES.length] ?? 'Pending',
}));

const columns: ColumnDef<Order>[] = [
  { accessorKey: 'id', header: 'Order' },
  { accessorKey: 'customer', header: 'Customer' },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ getValue }) => `$${(getValue() as number).toFixed(2)}`,
  },
  { accessorKey: 'status', header: 'Status' },
];

export default function Example() {
  return (
    <DataTable
      data={data}
      columns={columns}
      pagination={{ pageSize: 5 }}
      caption="Orders — 5 per page"
    />
  );
}
