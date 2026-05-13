import { Resizable, ResizableHandle, ResizablePanel } from '@arshad-shah/cynosure-react';

const paneStyle = {
  height: '100%',
  width: '100%',
  display: 'grid',
  placeItems: 'center',
  padding: '1rem',
  background: 'var(--cynosure-color-surface-2)',
};

export default function Example() {
  return (
    <div
      style={{
        height: 320,
        width: '100%',
        border: '1px solid var(--cynosure-color-border)',
        borderRadius: 'var(--cynosure-radius-md)',
        overflow: 'hidden',
      }}
    >
      <Resizable direction="horizontal">
        <ResizablePanel defaultSize={25}>
          <div style={paneStyle}>Files</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <Resizable direction="vertical">
            <ResizablePanel defaultSize={65}>
              <div style={paneStyle}>Editor</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35}>
              <div style={paneStyle}>Terminal</div>
            </ResizablePanel>
          </Resizable>
        </ResizablePanel>
      </Resizable>
    </div>
  );
}
