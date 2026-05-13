import { Pagination } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [page, setPage] = useState(2);
  return (
    <Pagination
      totalPages={8}
      currentPage={page}
      onPageChange={setPage}
      labels={{
        previous: 'Page précédente',
        next: 'Page suivante',
        page: (p) => `Aller à la page ${p}`,
        current: (p) => `Page ${p}, page actuelle`,
      }}
      aria-label="Pagination des résultats"
    />
  );
}
