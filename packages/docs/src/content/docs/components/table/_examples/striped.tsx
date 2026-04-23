import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@arshad-shah/cynosure-react';

const transactions = [
  { id: 'TXN-001', merchant: 'Coffee Shop', amount: 4.5, date: '2024-01-15' },
  { id: 'TXN-002', merchant: 'Supermarket', amount: 62.3, date: '2024-01-16' },
  { id: 'TXN-003', merchant: 'Bookstore', amount: 18.99, date: '2024-01-17' },
  { id: 'TXN-004', merchant: 'Restaurant', amount: 34.0, date: '2024-01-18' },
  { id: 'TXN-005', merchant: 'Pharmacy', amount: 12.75, date: '2024-01-19' },
];

export default function Example() {
  return (
    <Table variant="striped">
      <TableHead>
        <TableRow>
          <TableHeader>Transaction</TableHeader>
          <TableHeader>Merchant</TableHeader>
          <TableHeader align="end">Amount</TableHeader>
          <TableHeader>Date</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>{tx.id}</TableCell>
            <TableCell>{tx.merchant}</TableCell>
            <TableCell align="end" numeric>
              ${tx.amount.toFixed(2)}
            </TableCell>
            <TableCell>{tx.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
