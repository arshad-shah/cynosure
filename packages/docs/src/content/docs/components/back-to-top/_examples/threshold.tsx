import { BackToTop } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ minHeight: '150vh', padding: '1rem' }}>
      <p>Scroll just 100px to reveal the button.</p>
      <BackToTop showAfter={100} />
    </div>
  );
}
