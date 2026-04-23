import { Checkbox } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [items, setItems] = useState([false, true, false]);

  const allChecked = items.every(Boolean);
  const someChecked = items.some(Boolean);
  const parentState = allChecked ? true : someChecked ? 'indeterminate' : false;

  const toggleAll = () => {
    const next = !allChecked;
    setItems(items.map(() => next));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Checkbox checked={parentState as boolean | 'indeterminate'} onCheckedChange={toggleAll}>
        Select all
      </Checkbox>
      <div
        style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        {['Apples', 'Bananas', 'Cherries'].map((label, i) => (
          <Checkbox
            key={label}
            checked={items[i]}
            onCheckedChange={(v) => {
              const next = [...items];
              next[i] = v === true;
              setItems(next);
            }}
          >
            {label}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}
