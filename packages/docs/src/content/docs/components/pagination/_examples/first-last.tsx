import { Pagination } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [page, setPage] = useState(5);
  return <Pagination totalPages={20} currentPage={page} onPageChange={setPage} showFirstLast />;
}
