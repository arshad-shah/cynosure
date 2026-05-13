import { Resizable, ResizableHandle, ResizablePanel } from '@arshad-shah/cynosure-react';

const paneStyle = {
  height: '100%',
  display: 'grid',
  placeItems: 'center',
  padding: '1rem',
  background: 'var(--cynosure-color-surface-2)',
};

export default function Example() {
  return (
    <div
      style={{
        height: 240,
        width: '100%',
        border: '1px solid var(--cynosure-color-border)',
        borderRadius: 'var(--cynosure-radius-md)',
        overflow: 'hidden',
      }}
    >
      <Resizable direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <div style={paneStyle}>Left</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <div style={paneStyle}>Right</div>
        </ResizablePanel>
      </Resizable>
    </div>
  );
}
