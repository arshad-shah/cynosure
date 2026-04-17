import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
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
  },
};
export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Playground: Story = {
  args: {
    multiple: true,
    disabled: false,
    accept: 'image/*,application/pdf',
  },
  render: (args) => (
    <div style={{ width: '420px' }}>
      <FileUpload {...args} />
    </div>
  ),
};

export const SingleFile: Story = {
  render: () => (
    <div style={{ width: '420px' }}>
      <FileUpload />
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div style={{ width: '420px' }}>
      <FileUpload multiple />
    </div>
  ),
};

export const AcceptImagesOnly: Story = {
  render: () => (
    <div style={{ width: '420px' }}>
      <FileUpload multiple accept="image/*" />
    </div>
  ),
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

export const CustomRenderItem: Story = {
  name: 'Custom list renderItem',
  render: () => (
    <div style={{ width: '460px' }}>
      <FileUpload multiple>
        <FileUploadTrigger>Drop any files, then see the custom rendering below</FileUploadTrigger>
        <FileUploadList
          renderItem={(file, i) => (
            <li
              key={`${file.name}-${i}`}
              style={{
                padding: '6px 10px',
                border: '1px dashed rgba(0,0,0,0.15)',
                borderRadius: 6,
                marginTop: 6,
              }}
            >
              #{i + 1} — <code>{file.name}</code> ({file.type || 'unknown type'})
            </li>
          )}
        />
      </FileUpload>
    </div>
  ),
};

export const WithDefaultValue: Story = {
  name: 'Preloaded files (defaultValue)',
  render: () => {
    const seed = [
      new File(['hello'], 'hello.txt', { type: 'text/plain' }),
      new File(['world'], 'notes.md', { type: 'text/markdown' }),
    ];
    return (
      <div style={{ width: '420px' }}>
        <FileUpload multiple defaultValue={seed} />
      </div>
    );
  },
};
