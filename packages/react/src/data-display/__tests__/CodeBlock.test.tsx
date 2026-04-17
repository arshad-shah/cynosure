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
});
