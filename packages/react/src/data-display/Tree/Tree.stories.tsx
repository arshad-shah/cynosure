import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
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

export const CustomLabels: Story = {
  name: 'Custom labels (render prop)',
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Tree
        items={FILE_TREE}
        defaultExpandedIds={['src', 'src/components']}
        selectionMode="single"
        aria-label="Files with counts"
      >
        {({ item }) => {
          const count = (item.children as TreeNode[] | undefined)?.length;
          return (
            <Inline gap="2" align="center" justify="between" style={{ width: '100%' }}>
              <Inline gap="2" align="center">
                {item.children ? <FolderIcon /> : <FileIcon />}
                <span>{item.label as React.ReactNode}</span>
              </Inline>
              {count !== undefined ? (
                <Text size="xs" color="fg.muted">
                  {count}
                </Text>
              ) : null}
            </Inline>
          );
        }}
      </Tree>
    </div>
  ),
};

const LARGE_TREE: TreeNode[] = Array.from({ length: 6 }, (_, topIdx) => ({
  id: `group-${topIdx.toString()}`,
  label: `Group ${(topIdx + 1).toString()}`,
  children: Array.from({ length: 4 }, (_, midIdx) => ({
    id: `group-${topIdx.toString()}-sub-${midIdx.toString()}`,
    label: `Section ${(topIdx + 1).toString()}.${(midIdx + 1).toString()}`,
    children: Array.from({ length: 3 }, (_, leafIdx) => ({
      id: `group-${topIdx.toString()}-sub-${midIdx.toString()}-item-${leafIdx.toString()}`,
      label: `Item ${(topIdx + 1).toString()}.${(midIdx + 1).toString()}.${(leafIdx + 1).toString()}`,
    })),
  })),
}));

export const LargeTree: Story = {
  name: 'Large tree (72 nodes)',
  render: () => (
    <div style={{ maxWidth: 360, maxHeight: 420, overflow: 'auto' }}>
      <Tree items={LARGE_TREE} defaultExpandedIds={['group-0']} aria-label="Large tree">
        {renderFileNode}
      </Tree>
    </div>
  ),
};

export const DeepNesting: Story = {
  name: 'Deep nesting',
  render: () => {
    const deep = (depth: number, prefix = 'root'): TreeNode => ({
      id: prefix,
      label: `Level ${depth.toString()}`,
      children: depth > 0 ? [deep(depth - 1, `${prefix}/child`)] : undefined,
    });
    return (
      <div style={{ maxWidth: 360 }}>
        <Tree
          items={[deep(8)]}
          defaultExpandedIds={treeCollectIds([deep(8)])}
          aria-label="Deep tree"
        />
      </div>
    );
  },
};

interface ApiCollectionItem {
  uuid: string;
  name: string;
  kind: 'collection' | 'request';
  items?: ApiCollectionItem[];
}

const API_DATA: ApiCollectionItem[] = [
  {
    uuid: 'col-1',
    name: 'Auth',
    kind: 'collection',
    items: [
      { uuid: 'req-1', name: 'POST /login', kind: 'request' },
      { uuid: 'req-2', name: 'POST /logout', kind: 'request' },
    ],
  },
  {
    uuid: 'col-2',
    name: 'Users',
    kind: 'collection',
    items: [
      { uuid: 'req-3', name: 'GET /users', kind: 'request' },
      {
        uuid: 'col-3',
        name: 'Profile',
        kind: 'collection',
        items: [{ uuid: 'req-4', name: 'PATCH /users/:id', kind: 'request' }],
      },
    ],
  },
];

export const CustomDataShape: Story = {
  name: 'Custom data shape via accessor props',
  parameters: {
    docs: {
      description: {
        story:
          'When your data does not match the `{ id, label, children }` shape, point at your own fields with `getId` / `getLabel` / `getChildren` — no remapping required. Useful when consuming an API response that uses different field names (here: `uuid`, `name`, `items`).',
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Tree<ApiCollectionItem>
        items={API_DATA}
        getId={(n) => n.uuid}
        getLabel={(n) => n.name}
        getChildren={(n) => n.items}
        defaultExpandedIds={['col-1', 'col-2']}
        selectionMode="single"
        aria-label="API collections"
      >
        {({ item, expanded }) => (
          <Inline gap="2" align="center">
            <Text size="sm" weight={item.kind === 'collection' ? 'medium' : 'regular'}>
              {item.name}
            </Text>
            {item.kind === 'collection' ? (
              <Text size="xs" color="fg.muted">
                {expanded ? '(open)' : '(closed)'}
              </Text>
            ) : null}
          </Inline>
        )}
      </Tree>
    </div>
  ),
};
