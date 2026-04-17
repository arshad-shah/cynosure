import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { CodeBlock } from './CodeBlock.js';

const meta: Meta<typeof CodeBlock> = {
  title: 'Data Display/CodeBlock',
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

export const WithFilename: Story = {
  name: 'With custom filename',
  render: () => (
    <CodeBlock language="tsx" filename="src/utils/greet.ts" copyable>
      {TS_SNIPPET}
    </CodeBlock>
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

export const PreRenderedHtml: Story = {
  name: 'Pre-rendered html (Shiki-shaped)',
  render: () => {
    // Minimal hand-written Shiki-shaped HTML — in real usage this comes from
    // `shiki.codeToHtml`. The tokens below exercise the `.line` selector and
    // the `highlightLines` attribute pass.
    const html =
      '<pre class="shiki"><code>' +
      `<span class="line"><span style="color:#c678dd">const</span> <span style="color:#61afef">greet</span> = (<span style="color:#e06c75">name</span>) =&gt; \`Hello, \${name}!\`;</span>\n` +
      '<span class="line"><span style="color:#c678dd">export</span> <span style="color:#c678dd">default</span> greet;</span>' +
      '</code></pre>';
    return (
      <Stack gap="2">
        <Text size="sm" color="fg.muted">
          Passing pre-rendered HTML bypasses the plain renderer.
        </Text>
        <CodeBlock language="ts" html={html} highlightLines={[1]} copyable>
          {'const greet = (name) => `Hello, ${name}!`;\nexport default greet;'}
        </CodeBlock>
      </Stack>
    );
  },
};

export const InlineComposition: Story = {
  name: 'In-context usage',
  render: () => (
    <Stack gap="3" style={{ maxWidth: 640 }}>
      <Text>
        Install the package and import whatever primitives you need — every entry point is
        tree-shake friendly.
      </Text>
      <CodeBlock language="sh" copyable>
        {'pnpm add @lumen/react'}
      </CodeBlock>
      <Text>Then use the components directly:</Text>
      <CodeBlock language="tsx" filename="App.tsx" copyable showLineNumbers>
        {`import { Button } from '@lumen/react';\n\nexport default function App() {\n  return <Button>Click me</Button>;\n}\n`}
      </CodeBlock>
    </Stack>
  ),
};
