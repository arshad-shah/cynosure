import type { Meta, StoryObj } from '@storybook/react';
import { VERSION } from './index';

/**
 * Placeholder story so Storybook has something to index during Phase 01.
 * Delete this file when the first real component lands in Phase 05.
 */
function Placeholder() {
  return <div>Lumen {VERSION}</div>;
}

const meta: Meta<typeof Placeholder> = {
  title: 'Meta/Placeholder',
  component: Placeholder,
};

export default meta;

export const Default: StoryObj<typeof Placeholder> = {};
