import { type ColumnDef, DataTable } from '@arshad-shah/cynosure-react';

type Product = { id: number; name: string; category: string; price: number };

const data: Product[] = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 89.99 },
  { id: 2, name: 'Leather Notebook', category: 'Stationery', price: 14.5 },
  { id: 3, name: 'USB-C Hub', category: 'Electronics', price: 45.0 },
  { id: 4, name: 'Desk Lamp', category: 'Office', price: 32.99 },
  { id: 5, name: 'Standing Mat', category: 'Office', price: 59.0 },
];

const columns: ColumnDef<Product>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Product' },
  { accessorKey: 'category', header: 'Category' },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ getValue }) => `$${(getValue() as number).toFixed(2)}`,
  },
];

export default function Example() {
  return (
    <DataTable
      data={data}
      columns={columns}
      sortable
      caption="Products — click a column header to sort"
    />
  );
}
