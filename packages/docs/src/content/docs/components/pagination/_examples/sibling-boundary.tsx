import { Pagination } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [page, setPage] = useState(10);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--cynosure-color-fg-muted)' }}>
        siblingCount=2, boundaryCount=2
      </span>
      <Pagination
        totalPages={30}
        currentPage={page}
        onPageChange={setPage}
        siblingCount={2}
        boundaryCount={2}
      />
      <span style={{ fontSize: '0.875rem', color: 'var(--cynosure-color-fg-muted)' }}>
        siblingCount=0, boundaryCount=1
      </span>
      <Pagination
        totalPages={30}
        currentPage={page}
        onPageChange={setPage}
        siblingCount={0}
        boundaryCount={1}
      />
    </div>
  );
}
