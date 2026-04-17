import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
  Splitter,
  SplitterHandle,
  SplitterPanel,
} from '../Resizable/index.js';

describe('Resizable', () => {
  it('renders Panel + Handle + Panel structure', () => {
    const { container } = render(
      <Resizable direction="horizontal">
        <ResizablePanel defaultSize={30} minSize={10}>
          <span>left</span>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <span>right</span>
        </ResizablePanel>
      </Resizable>,
    );
    const group = container.querySelector('[data-orientation="horizontal"]');
    expect(group).toBeInTheDocument();
    // separator role from react-resizable-panels handle
    expect(container.querySelectorAll('[role="separator"]').length).toBe(1);
  });

  it('Splitter aliases Resizable', () => {
    expect(Splitter).toBe(Resizable);
    expect(SplitterPanel).toBe(ResizablePanel);
    expect(SplitterHandle).toBe(ResizableHandle);
  });
});
