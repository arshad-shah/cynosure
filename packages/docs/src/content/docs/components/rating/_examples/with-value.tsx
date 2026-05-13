import { Rating } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Rating
      allowHalf
      defaultValue={4.5}
      max={5}
      label="Quality"
      renderValue={(value, max, preview) => (
        <span style={{ fontSize: '0.875rem', color: 'var(--c-fg-muted)' }}>
          {(preview ?? value).toFixed(1)} / {max}
        </span>
      )}
    />
  );
}
