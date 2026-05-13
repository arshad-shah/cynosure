import { CodeBlock } from '@arshad-shah/cynosure-react/code-block';

const snippet = `// Debounce helper
export const debounce = (fn, wait = 200) => {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), wait);
  };
};
`;

export default function Example() {
  return <CodeBlock language="tsx">{snippet}</CodeBlock>;
}
