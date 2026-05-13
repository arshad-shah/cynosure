import { CodeBlock } from '@arshad-shah/cynosure-react/code-block';

const snippet = `import { Button } from "@arshad-shah/cynosure-react/code-block";

export function SaveButton() {
  return (
    <Button variant="solid" colorScheme="accent">
      Save changes
    </Button>
  );
}
`;

export default function Example() {
  return (
    <CodeBlock language="tsx" showLineNumbers highlightLines={[4, 5, 6]}>
      {snippet}
    </CodeBlock>
  );
}
