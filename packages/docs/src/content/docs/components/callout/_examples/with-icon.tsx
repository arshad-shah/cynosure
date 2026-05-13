import { Callout, CalloutContent, CalloutTitle } from '@arshad-shah/cynosure-react';

const InfoIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="8" />
    <polyline points="11 12 12 12 12 16 13 16" />
  </svg>
);

export default function Example() {
  return (
    <Callout colorScheme="accent" icon={<InfoIcon />}>
      <CalloutTitle>Tip</CalloutTitle>
      <CalloutContent>
        Pair an icon with a clear title so the callout reads well in scanning mode.
      </CalloutContent>
    </Callout>
  );
}
