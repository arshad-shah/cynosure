import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { Toaster, type ToasterPosition, toast } from './Toaster.js';

const meta: Meta<typeof Toaster> = {
  title: 'Overlays/Toast',
  component: Toaster,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Toaster>;

export const Variants: Story = {
  name: 'Success / error / warning / info',
  render: () => (
    <Stack gap="3">
      <Heading level={3} size="md">
        Semantic variants
      </Heading>
      <Inline gap="3" wrap>
        <Button
          variant="outline"
          onClick={() => {
            toast.success('Changes saved');
          }}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.error('Something went wrong');
          }}
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.warning('Disk usage is high');
          }}
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.info('A new version is available');
          }}
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast('Plain message');
          }}
        >
          Default
        </Button>
      </Inline>
    </Stack>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast.success('Invite sent', {
          description: 'alex@lumen.app will receive an email shortly.',
        });
      }}
    >
      Send invite
    </Button>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Inline gap="3">
      <Button
        onClick={() => {
          toast('Moved to trash', {
            action: {
              label: 'Undo',
              onClick: () => {
                toast.success('Restored');
              },
            },
          });
        }}
      >
        Delete item
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast('Unsaved changes', {
            description: 'You have modifications that have not been saved.',
            action: {
              label: 'Save',
              onClick: () => {
                toast.success('Saved');
              },
            },
            cancel: {
              label: 'Dismiss',
              onClick: () => {},
            },
          });
        }}
      >
        With cancel
      </Button>
    </Inline>
  ),
};

export const PromiseBased: Story = {
  name: 'Promise (loading → success/error)',
  render: () => (
    <Inline gap="3">
      <Button
        onClick={() => {
          const job = new Promise<{ id: number }>((resolve) => {
            setTimeout(() => resolve({ id: 42 }), 1500);
          });
          toast.promise(job, {
            loading: 'Deploying…',
            success: (data) => `Deployment #${data.id} is live`,
            error: 'Deployment failed',
          });
        }}
      >
        Deploy (resolves)
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          const job = new Promise<void>((_, reject) => {
            setTimeout(() => reject(new Error('timeout')), 1500);
          });
          toast.promise(job, {
            loading: 'Uploading…',
            success: 'Uploaded',
            error: (e) => `Upload failed: ${(e as Error).message}`,
          });
        }}
      >
        Upload (rejects)
      </Button>
    </Inline>
  ),
};

export const Positions: Story = {
  name: 'Position — per-story Toaster',
  render: () => {
    function Positions(): React.ReactElement {
      const [position, setPosition] = useState<ToasterPosition>('bottom-right');
      const options: ToasterPosition[] = [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ];
      return (
        <Stack gap="3">
          <Inline gap="2" wrap>
            {options.map((p) => (
              <Button
                key={p}
                size="sm"
                variant={position === p ? 'solid' : 'outline'}
                onClick={() => setPosition(p)}
              >
                {p}
              </Button>
            ))}
          </Inline>
          <Button
            onClick={() => {
              toast.success(`Position: ${position ?? 'default'}`);
            }}
          >
            Fire toast
          </Button>
          {/* Local Toaster overrides the decorator for this story. */}
          <Toaster position={position} />
        </Stack>
      );
    }
    return <Positions />;
  },
};

export const RichContent: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast.message(
          <Stack gap="1">
            <Text size="sm" weight="semibold">
              Deployment succeeded
            </Text>
            <Text size="xs" color="fg.muted">
              Deployed <code>lumen-app@1.20.0</code> to production in 34s.
            </Text>
          </Stack>,
        );
      }}
    >
      Show rich toast
    </Button>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast.info(
          'The new schema migration requires a brief read-only window. During this window users can still browse, but writes will be paused for up to two minutes.',
          {
            duration: 6000,
          },
        );
      }}
    >
      Long toast
    </Button>
  ),
};

export const ManualDismiss: Story = {
  name: 'Manual dismiss by id',
  render: () => {
    function Manual(): React.ReactElement {
      const [id, setId] = useState<string | number | null>(null);
      return (
        <Inline gap="3">
          <Button
            onClick={() => {
              const toastId = toast.loading('Saving…', { duration: Number.POSITIVE_INFINITY });
              setId(toastId);
            }}
          >
            Start loading
          </Button>
          <Button
            variant="outline"
            disabled={id === null}
            onClick={() => {
              if (id !== null) {
                toast.success('Saved', { id });
                setId(null);
              }
            }}
          >
            Resolve
          </Button>
          <Button
            variant="ghost"
            disabled={id === null}
            onClick={() => {
              if (id !== null) {
                toast.dismiss(id);
                setId(null);
              }
            }}
          >
            Dismiss
          </Button>
        </Inline>
      );
    }
    return <Manual />;
  },
};
