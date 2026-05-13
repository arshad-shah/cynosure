import { CodeBlock } from '@arshad-shah/cynosure-react/code-block';

const snippet = `{
  "name": "my-app",
  "version": "0.1.0",
  "private": true
}
`;

export default function Example() {
  return (
    <CodeBlock language="json" filename="package.json" copyable showLineNumbers>
      {snippet}
    </CodeBlock>
  );
}
