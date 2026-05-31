import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import type { TreeNode } from './Tree.js';
import { Tree, treeCollectIds } from './Tree.js';

const meta: Meta<typeof Tree> = {
  title: 'Data display/Tree',
  component: Tree,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Tree>;

const FolderIcon = (): React.ReactElement => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 5a2 2 0 0 1 2-2h4l2 3h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" />
  </svg>
);

const FileIcon = (): React.ReactElement => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="14 3 14 9 20 9" />
  </svg>
);

const FILE_TREE: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'src/components',
        label: 'components',
        children: [
          { id: 'src/components/Button.tsx', label: 'Button.tsx' },
          { id: 'src/components/Input.tsx', label: 'Input.tsx' },
          { id: 'src/components/Card.tsx', label: 'Card.tsx' },
        ],
      },
      {
        id: 'src/hooks',
        label: 'hooks',
        children: [
          { id: 'src/hooks/useClipboard.ts', label: 'useClipboard.ts' },
          { id: 'src/hooks/useDebouncedValue.ts', label: 'useDebouncedValue.ts' },
        ],
      },
      { id: 'src/index.ts', label: 'index.ts' },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      { id: 'public/favicon.ico', label: 'favicon.ico' },
      { id: 'public/robots.txt', label: 'robots.txt' },
    ],
  },
  { id: 'package.json', label: 'package.json' },
  { id: 'README.md', label: 'README.md' },
  { id: 'tsconfig.json', label: 'tsconfig.json', disabled: true },
];

const renderFileNode = (ctx: { item: TreeNode }): React.ReactElement => {
  const hasChildren = !!ctx.item.children?.length;
  return (
    <Inline gap="2" align="center">
      {hasChildren ? <FolderIcon /> : <FileIcon />}
      <span>{ctx.item.label as React.ReactNode}</span>
    </Inline>
  );
};

export const FileTree: Story = {
  name: 'File tree',
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Tree
        items={FILE_TREE}
        defaultExpandedIds={['src', 'src/components']}
        aria-label="Project files"
      >
        {renderFileNode}
      </Tree>
    </div>
  ),
};

export const Basic: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Tree items={FILE_TREE} aria-label="Files" />
    </div>
  ),
};

export const ControlledExpansion: Story = {
  name: 'Controlled expansion',
  render: () => {
    function Controlled(): React.ReactElement {
      const [expanded, setExpanded] = useState<string[]>(['src']);
      const allIds = treeCollectIds(FILE_TREE);
      return (
        <Stack gap="3">
          <Inline gap="2">
            <button type="button" onClick={() => setExpanded(allIds)} style={{ cursor: 'pointer' }}>
              Expand all
            </button>
            <button type="button" onClick={() => setExpanded([])} style={{ cursor: 'pointer' }}>
              Collapse all
            </button>
          </Inline>
          <div style={{ maxWidth: 360 }}>
            <Tree
              items={FILE_TREE}
              expandedIds={expanded}
              onExpandedChange={setExpanded}
              aria-label="Files"
            >
              {renderFileNode}
            </Tree>
          </div>
          <Text size="sm" color="fg.muted">
            Expanded: <code>{expanded.join(', ') || '(none)'}</code>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const SingleSelection: Story = {
  name: 'Single selection',
  render: () => {
    function Single(): React.ReactElement {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <Stack gap="3">
          <div style={{ maxWidth: 360 }}>
            <Tree
              items={FILE_TREE}
              defaultExpandedIds={['src', 'src/components']}
              selectionMode="single"
              selectedIds={selected}
              onSelectionChange={setSelected}
              aria-label="Files"
            >
              {renderFileNode}
            </Tree>
          </div>
          <Text size="sm" color="fg.muted">
            Selected: <strong>{selected[0] ?? '(none)'}</strong>
          </Text>
        </Stack>
      );
    }
    return <Single />;
  },
};

export const MultiSelection: Story = {
  name: 'Multi selection (ctrl/cmd-click)',
  render: () => {
    function Multi(): React.ReactElement {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <Stack gap="3">
          <div style={{ maxWidth: 360 }}>
            <Tree
              items={FILE_TREE}
              defaultExpandedIds={['src', 'src/components', 'src/hooks']}
              selectionMode="multiple"
              selectedIds={selected}
              onSelectionChange={setSelected}
              aria-label="Files"
            >
              {renderFileNode}
            </Tree>
          </div>
          <Text size="sm" color="fg.muted">
            Selected ({selected.length}): <code>{selected.join(', ') || '(none)'}</code>
          </Text>
        </Stack>
      );
    }
    return <Multi />;
  },
};

export const WithDisabledNode: Story = {
  name: 'Disabled node',
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Tree
        items={FILE_TREE}
        defaultExpandedIds={['src']}
        selectionMode="single"
        aria-label="Files"
      >
        {renderFileNode}
      </Tree>
    </div>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · expand a node, then select it',
  render: () => {
    function Demo(): React.ReactElement {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <div style={{ maxWidth: 360 }}>
          <Tree
            items={FILE_TREE}
            selectionMode="single"
            selectedIds={selected}
            onSelectionChange={setSelected}
            aria-label="Files"
          >
            {renderFileNode}
          </Tree>
        </div>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // "public" starts collapsed, so its children are not rendered.
    const publicItem = canvas.getByText('public').closest('[role="treeitem"]');
    await expect(publicItem).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('favicon.ico')).not.toBeInTheDocument();

    // Clicking the folder row expands it and reveals the children.
    await userEvent.click(canvas.getByText('public'));
    await expect(publicItem).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => {
      expect(canvas.getByText('favicon.ico')).toBeInTheDocument();
    });

    // Selecting a leaf marks it aria-selected.
    await userEvent.click(canvas.getByText('favicon.ico'));
    const leaf = canvas.getByText('favicon.ico').closest('[role="treeitem"]');
    await expect(leaf).toHaveAttribute('aria-selected', 'true');
  },
};
