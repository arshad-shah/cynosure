import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <DescriptionList>
      <DescriptionTerm>Framework</DescriptionTerm>
      <DescriptionDetails>React 18+</DescriptionDetails>
      <DescriptionTerm>Styling</DescriptionTerm>
      <DescriptionDetails>vanilla-extract with design tokens</DescriptionDetails>
      <DescriptionTerm>Bundling</DescriptionTerm>
      <DescriptionDetails>Tree-shakeable ESM</DescriptionDetails>
    </DescriptionList>
  );
}
