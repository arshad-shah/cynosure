import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  FileUpload,
  type FileUploadError,
  FileUploadList,
  FileUploadTrigger,
} from './FileUpload.js';

const meta: Meta<typeof FileUpload> = {
  title: 'Forms/FileUpload',
  component: FileUpload,
  parameters: { layout: 'padded' },
  argTypes: {
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    accept: { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'card', 'compact', 'minimal'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Playground: Story = {
  args: {
    multiple: true,
    disabled: false,
    accept: 'image/*,application/pdf',
    variant: 'default',
  },
  render: (args) => (
    <div style={{ width: '420px' }}>
      <FileUpload {...args} />
    </div>
  ),
};

export const Variants: Story = {
  name: 'All variants side-by-side',
  render: () => (
    <Stack gap="5" width="520px">
      <Stack gap="2">
        <Text size="xs" color="fg.muted" weight="medium">
          default
        </Text>
        <FileUpload multiple accept="image/*,application/pdf" />
      </Stack>
      <Stack gap="2">
        <Text size="xs" color="fg.muted" weight="medium">
          card
        </Text>
        <FileUpload multiple variant="card" accept="image/*,application/pdf" />
      </Stack>
      <Stack gap="2">
        <Text size="xs" color="fg.muted" weight="medium">
          compact
        </Text>
        <FileUpload multiple variant="compact" accept="image/*,application/pdf" />
      </Stack>
      <Stack gap="2">
        <Text size="xs" color="fg.muted" weight="medium">
          minimal
        </Text>
        <FileUpload multiple variant="minimal" />
      </Stack>
    </Stack>
  ),
};

export const WithPreview: Story = {
  name: 'onPreview handler',
  render: () => {
    function Demo(): React.ReactElement {
      const [last, setLast] = useState<string | null>(null);
      return (
        <Stack gap="3" width="460px">
          <FileUpload multiple>
            <FileUploadTrigger />
            <FileUploadList onPreview={(file) => setLast(file.name)} />
          </FileUpload>
          <Text size="sm" color="fg.muted">
            {last ? `Preview requested: ${last}` : 'Click the eye icon on a file to preview.'}
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const MaxCountAndSize: Story = {
  name: 'maxCount + maxSize validation',
  render: () => {
    function Demo(): React.ReactElement {
      const [error, setError] = useState<FileUploadError | null>(null);
      return (
        <Stack gap="3" width="420px">
          <FileUpload
            multiple
            maxCount={3}
            maxSize={1024 * 1024}
            onError={setError}
            onFilesChange={() => setError(null)}
          />
          <Text size="sm" color={error ? 'feedback.danger.foreground' : 'fg.muted'}>
            {error ? `Error (${error.reason}): ${error.message}` : 'Up to 3 files, 1 MB each.'}
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: '420px' }}>
      <FileUpload multiple disabled />
    </div>
  ),
};

export const CustomTrigger: Story = {
  name: 'Custom trigger content',
  render: () => (
    <div style={{ width: '420px' }}>
      <FileUpload multiple>
        <FileUploadTrigger>
          <Stack gap="1" align="center">
            <Text weight="medium">Drop images here</Text>
            <Text size="sm" color="fg.muted">
              or click to browse (PNG, JPG up to 5 MB each)
            </Text>
          </Stack>
        </FileUploadTrigger>
        <FileUploadList />
      </FileUpload>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [files, setFiles] = useState<File[]>([]);
      return (
        <Stack gap="3" width="420px">
          <FileUpload multiple value={files} onFilesChange={setFiles} />
          <Inline gap="2" align="center">
            <Text size="sm" color="fg.muted">
              {files.length === 0 ? 'No files selected.' : `Selected ${files.length} file(s)`}
            </Text>
            {files.length > 0 ? (
              <button
                type="button"
                onClick={() => setFiles([])}
                style={{
                  border: '1px solid rgba(0,0,0,0.15)',
                  background: 'transparent',
                  padding: '2px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Clear all
              </button>
            ) : null}
          </Inline>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · drop zone + file input present, browse opens dialog',
  render: () => (
    <div style={{ width: '420px' }}>
      <FileUpload multiple accept="image/*,application/pdf" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The keyboard-accessible drop zone is exposed as a button.
    const dropZone = canvas.getByRole('button');
    await expect(dropZone).toHaveAttribute('aria-controls');

    // The hidden native file input backs the drop zone.
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    await expect(input).not.toBeNull();
    await expect(input).toHaveAttribute('accept', 'image/*,application/pdf');
    await expect(input).toHaveAttribute('multiple');

    // Choosing a file through the input surfaces it in the list.
    const file = new File(['hello'], 'photo.png', { type: 'image/png' });
    await userEvent.upload(input as HTMLInputElement, file);
    await waitFor(() => expect(canvas.getByText('photo.png')).toBeInTheDocument());
  },
};
