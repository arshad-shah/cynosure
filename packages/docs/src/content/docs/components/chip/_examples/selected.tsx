import { Chip } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [filters, setFilters] = useState<Record<string, boolean>>({
    design: true,
    engineering: false,
    research: false,
  });

  const toggle = (key: string) => (next: boolean) =>
    setFilters((prev) => ({ ...prev, [key]: next }));

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <Chip colorScheme="accent" selected={filters.design} onSelectedChange={toggle('design')}>
        Design
      </Chip>
      <Chip
        colorScheme="accent"
        selected={filters.engineering}
        onSelectedChange={toggle('engineering')}
      >
        Engineering
      </Chip>
      <Chip colorScheme="accent" selected={filters.research} onSelectedChange={toggle('research')}>
        Research
      </Chip>
    </div>
  );
}
