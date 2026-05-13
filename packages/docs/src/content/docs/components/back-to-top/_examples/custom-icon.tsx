import { BackToTop } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ minHeight: '200vh', padding: '1rem' }}>
      <p>Scroll to reveal a custom-iconed back-to-top button.</p>
      <BackToTop
        icon={
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        }
        label="Scroll to top"
      />
    </div>
  );
}
