import { type ColumnDef, DataTable } from '@arshad-shah/cynosure-react';

type User = { id: number; name: string; email: string; status: string };

const data: User[] = [
  { id: 1, name: 'Alice Martin', email: 'alice@example.com', status: 'Active' },
  { id: 2, name: 'Bob Chen', email: 'bob@example.com', status: 'Active' },
  { id: 3, name: 'Carol Smith', email: 'carol@example.com', status: 'Away' },
  { id: 4, name: 'Dan Kumar', email: 'dan@example.com', status: 'Inactive' },
  { id: 5, name: 'Eva Lopez', email: 'eva@example.com', status: 'Active' },
];

const columns: ColumnDef<User>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'status', header: 'Status' },
];

export default function Example() {
  return <DataTable data={data} columns={columns} caption="Team members" />;
}
