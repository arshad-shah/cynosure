import { BackToTop } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ minHeight: '200vh', padding: '1rem' }}>
      <p>The button is anchored to the bottom-left corner.</p>
      <BackToTop position="bottom-left" />
    </div>
  );
}
