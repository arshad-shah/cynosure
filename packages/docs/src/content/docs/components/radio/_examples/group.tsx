import { Radio, RadioGroup } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

const plans = [
  { value: 'free', label: 'Free — $0/month' },
  { value: 'pro', label: 'Pro — $12/month' },
  { value: 'team', label: 'Team — $29/month' },
];

export default function Example() {
  const [plan, setPlan] = useState('pro');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <RadioGroup value={plan} onValueChange={setPlan} aria-label="Subscription plan">
        {plans.map((p) => (
          <Radio key={p.value} value={p.value}>
            {p.label}
          </Radio>
        ))}
      </RadioGroup>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-fg-muted, #6b7280)', margin: 0 }}>
        Selected: {plan}
      </p>
    </div>
  );
}
