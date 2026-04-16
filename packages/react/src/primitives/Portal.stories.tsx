import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Portal } from './Portal.js';

function PortalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen((prev) => !prev)}>
        {open ? 'Hide' : 'Show'} portaled overlay
      </button>
      {open ? (
        <Portal>
          <button
            type="button"
            aria-label="Close portal demo"
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              cursor: 'pointer',
              zIndex: 1000,
            }}
          >
            <span style={{ padding: '1.5rem', background: '#fff', borderRadius: '0.5rem' }}>
              Portaled into <code>document.body</code>. Click anywhere to dismiss.
            </span>
          </button>
        </Portal>
      ) : null}
    </div>
  );
}

const meta: Meta<typeof PortalDemo> = {
  title: 'Primitives/Portal',
  component: PortalDemo,
  parameters: { layout: 'centered' },
};
export default meta;

export const Default: StoryObj<typeof PortalDemo> = {};
