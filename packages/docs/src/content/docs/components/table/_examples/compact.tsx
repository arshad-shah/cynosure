import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@arshad-shah/cynosure-react';

const logs = [
  { level: 'INFO', message: 'Server started', timestamp: '10:00:01' },
  { level: 'INFO', message: 'Database connected', timestamp: '10:00:02' },
  { level: 'WARN', message: 'High memory usage', timestamp: '10:05:14' },
  { level: 'ERROR', message: 'Request timeout', timestamp: '10:07:33' },
  { level: 'INFO', message: 'Cache cleared', timestamp: '10:10:00' },
];

export default function Example() {
  return (
    <Table size="sm">
      <TableHead>
        <TableRow>
          <TableHeader>Level</TableHeader>
          <TableHeader>Message</TableHeader>
          <TableHeader>Timestamp</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {logs.map((log, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable static list
          <TableRow key={i}>
            <TableCell>{log.level}</TableCell>
            <TableCell>{log.message}</TableCell>
            <TableCell>{log.timestamp}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
