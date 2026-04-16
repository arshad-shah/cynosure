import type { Meta, StoryObj } from '@storybook/react';
import { VisuallyHidden } from './VisuallyHidden.js';

function IconOnlyButton() {
  return (
    <button
      type="button"
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 999,
        border: '1px solid #d4d4d4',
        background: '#fff',
        cursor: 'pointer',
      }}
    >
      <span aria-hidden>✕</span>
      <VisuallyHidden>Close dialog</VisuallyHidden>
    </button>
  );
}

const meta: Meta<typeof IconOnlyButton> = {
  title: 'Primitives/VisuallyHidden',
  component: IconOnlyButton,
  parameters: { layout: 'centered' },
};
export default meta;

export const Default: StoryObj<typeof IconOnlyButton> = {};
