import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { CodeBlock } from './CodeBlock.js';

const meta: Meta<typeof CodeBlock> = {
  title: 'Data display/CodeBlock',
  component: CodeBlock,
  parameters: { layout: 'padded' },
  argTypes: {
    language: { control: 'text' },
    showLineNumbers: { control: 'boolean' },
    copyable: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof CodeBlock>;

const TS_SNIPPET = `interface Greeting {
  name: string;
  language?: 'en' | 'fr' | 'de';
}

export function greet({ name, language = 'en' }: Greeting): string {
  switch (language) {
    case 'fr':
      return \`Bonjour, \${name}!\`;
    case 'de':
      return \`Hallo, \${name}!\`;
    default:
      return \`Hello, \${name}!\`;
  }
}
`;

const JS_SNIPPET = `// Debounce helper
export const debounce = (fn, wait = 200) => {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), wait);
  };
};
`;

const LONG_SNIPPET = Array.from(
  { length: 30 },
  (_, i) => `const value_${i.toString()} = compute(${i.toString()});`,
).join('\n');

export const Plain: Story = {
  name: 'Plain TypeScript snippet',
  render: () => <CodeBlock language="tsx">{TS_SNIPPET}</CodeBlock>,
};

export const WithLanguageLabel: Story = {
  name: 'With language label',
  render: () => (
    <Stack gap="4">
      <CodeBlock language="ts">{TS_SNIPPET}</CodeBlock>
      <CodeBlock language="js">{JS_SNIPPET}</CodeBlock>
    </Stack>
  ),
};

export const WithLineNumbers: Story = {
  name: 'With line numbers',
  render: () => (
    <CodeBlock language="ts" showLineNumbers>
      {TS_SNIPPET}
    </CodeBlock>
  ),
};

export const HighlightedLines: Story = {
  name: 'Highlighted lines',
  render: () => (
    <CodeBlock language="ts" showLineNumbers highlightLines={[6, 7, 8]}>
      {TS_SNIPPET}
    </CodeBlock>
  ),
};

export const Copyable: Story = {
  name: 'Copy to clipboard',
  render: () => (
    <CodeBlock language="js" copyable>
      {JS_SNIPPET}
    </CodeBlock>
  ),
};

export const MaxHeight: Story = {
  name: 'Max height (scrollable)',
  render: () => (
    <CodeBlock language="ts" showLineNumbers maxHeight={180}>
      {LONG_SNIPPET}
    </CodeBlock>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · copy button copies the source',
  render: () => (
    <CodeBlock language="js" copyable>
      {JS_SNIPPET}
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const copyButton = canvas.getByRole('button', { name: 'Copy code' });
    await expect(copyButton).toBeInTheDocument();

    await userEvent.click(copyButton);
    // A successful copy flips the button's label to "Copied".
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    });
    // The clipboard holds the verbatim snippet.
    await expect(await navigator.clipboard.readText()).toBe(JS_SNIPPET);
  },
};
