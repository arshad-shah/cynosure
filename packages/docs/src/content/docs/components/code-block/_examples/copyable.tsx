import { CodeBlock } from '@arshad-shah/cynosure-react/code-block';

const snippet = `curl -fsSL https://cynosure.dev/install.sh | bash
`;

export default function Example() {
  return (
    <CodeBlock language="bash" copyable>
      {snippet}
    </CodeBlock>
  );
}
