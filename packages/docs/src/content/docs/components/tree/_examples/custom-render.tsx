import { Tree, TreeItemLabel, type TreeNode } from '@arshad-shah/cynosure-react';

const IconFolder = () => (
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
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
  </svg>
);

const IconFile = () => (
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
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
    <path d="M14 3v6h6" />
  </svg>
);

const items: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'src/App.tsx', label: 'App.tsx' },
      { id: 'src/main.tsx', label: 'main.tsx' },
    ],
  },
];

export default function Example() {
  return (
    <div style={{ maxWidth: 280 }}>
      <Tree items={items} defaultExpandedIds={['src']} aria-label="Project">
        {({ item }) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          return (
            <TreeItemLabel icon={hasChildren ? <IconFolder /> : <IconFile />}>
              {item.label}
            </TreeItemLabel>
          );
        }}
      </Tree>
    </div>
  );
}
