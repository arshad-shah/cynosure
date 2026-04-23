import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@arshad-shah/cynosure-react';

const users = [
  { id: 1, name: 'Alice Martin', role: 'Engineer', status: 'Active' },
  { id: 2, name: 'Bob Chen', role: 'Designer', status: 'Active' },
  { id: 3, name: 'Carol Smith', role: 'Product', status: 'Away' },
  { id: 4, name: 'Dan Kumar', role: 'Engineer', status: 'Inactive' },
];

export default function Example() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>ID</TableHeader>
          <TableHeader>Name</TableHeader>
          <TableHeader>Role</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell numeric>{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
