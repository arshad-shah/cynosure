import { Pagination } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [page, setPage] = useState(3);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Pagination totalPages={8} currentPage={page} onPageChange={setPage} size="sm" />
      <Pagination totalPages={8} currentPage={page} onPageChange={setPage} size="md" />
      <Pagination totalPages={8} currentPage={page} onPageChange={setPage} size="lg" />
    </div>
  );
}
