import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CodeBlock } from '../CodeBlock/index.js';

describe('CodeBlock', () => {
  it('renders plain source with a <pre>', () => {
    render(<CodeBlock language="tsx">{'const x = 1;\nconst y = 2;'}</CodeBlock>);
    // language shown in header
    expect(screen.getByText('tsx')).toBeInTheDocument();
    expect(document.querySelector('pre[data-language="tsx"]')).toBeInTheDocument();
    expect(document.querySelector('code')?.textContent).toContain('const x = 1');
  });

  it('renders copy button when copyable', () => {
    render(
      <CodeBlock copyable language="tsx">
        {'code'}
      </CodeBlock>,
    );
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
  });

  it('applies highlightLines data attribute', () => {
    render(
      <CodeBlock language="tsx" highlightLines={[2]}>
        {'line 1\nline 2\nline 3'}
      </CodeBlock>,
    );
    const marked = document.querySelectorAll('[data-highlighted="true"]');
    expect(marked.length).toBe(1);
  });

  it('renders html passthrough when provided', () => {
    render(
      <CodeBlock language="tsx" html={'<pre><code><span class="line">x</span></code></pre>'}>
        {'x'}
      </CodeBlock>,
    );
    expect(document.querySelector('span.line')).toBeInTheDocument();
  });

  it('omits the header when language is text and copy/filename are not set', () => {
    const { container } = render(<CodeBlock>{'plain'}</CodeBlock>);
    expect(container.querySelector('button')).toBeNull();
  });

  it('renders the filename when supplied', () => {
    render(<CodeBlock filename="App.tsx">{'code'}</CodeBlock>);
    expect(screen.getByText('App.tsx')).toBeInTheDocument();
  });

  it('shows line numbers when enabled', () => {
    render(
      <CodeBlock showLineNumbers language="tsx">
        {'a\nb'}
      </CodeBlock>,
    );
    const numbers = document.querySelectorAll('[data-line-number]');
    expect(numbers.length).toBe(2);
  });

  it('strips a trailing newline before splitting lines', () => {
    render(<CodeBlock language="tsx">{'a\nb\n'}</CodeBlock>);
    const lines = document.querySelectorAll('[data-line-number]');
    expect(lines.length).toBe(2);
  });

  it('decorates html lines with highlightLines after render', () => {
    render(
      <CodeBlock
        language="tsx"
        highlightLines={[1]}
        html={'<pre><code><span class="line">a</span><span class="line">b</span></code></pre>'}
      >
        {'a\nb'}
      </CodeBlock>,
    );
    const highlighted = document.querySelectorAll('[data-highlighted="true"]');
    expect(highlighted.length).toBe(1);
  });

  it('accepts a numeric maxHeight via CSS custom property', () => {
    const { container } = render(
      <CodeBlock language="tsx" maxHeight={400}>
        {'x'}
      </CodeBlock>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--lumen-code-max-height')).toBe('400px');
  });

  it('accepts a string maxHeight value', () => {
    const { container } = render(
      <CodeBlock language="tsx" maxHeight="50vh">
        {'x'}
      </CodeBlock>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--lumen-code-max-height')).toBe('50vh');
  });
});
