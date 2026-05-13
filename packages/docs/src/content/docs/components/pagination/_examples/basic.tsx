import { Pagination } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [page, setPage] = useState(1);
  return <Pagination totalPages={8} currentPage={page} onPageChange={setPage} />;
}
