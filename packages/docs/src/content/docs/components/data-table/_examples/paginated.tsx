import { type ColumnDef, DataTable } from '@arshad-shah/cynosure-react';

type Order = { id: string; customer: string; total: number; status: string };

const data: Order[] = Array.from({ length: 12 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(3, '0')}`,
  customer: ['Alice', 'Bob', 'Carol', 'Dan', 'Eva', 'Frank'][i % 6],
  total: Number(((i + 1) * 17.5).toFixed(2)),
  status: ['Shipped', 'Pending', 'Delivered', 'Cancelled'][i % 4],
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
