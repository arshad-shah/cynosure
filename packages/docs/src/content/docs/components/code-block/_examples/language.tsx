import { CodeBlock } from '@arshad-shah/cynosure-react/code-block';

const bash = `pnpm add @arshad-shah/cynosure-react
pnpm add @arshad-shah/cynosure-tokens
`;

export default function Example() {
  return <CodeBlock language="bash">{bash}</CodeBlock>;
}
