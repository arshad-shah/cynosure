import { Tree, type TreeNode } from '@arshad-shah/cynosure-react';

const items: TreeNode[] = [
  {
    id: 'docs',
    label: 'docs',
    children: [
      { id: 'docs/intro.md', label: 'intro.md' },
      { id: 'docs/install.md', label: 'install.md' },
    ],
  },
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'src/index.ts', label: 'index.ts' },
      { id: 'src/utils.ts', label: 'utils.ts' },
    ],
  },
];

export default function Example() {
  return (
    <div style={{ maxWidth: 280 }}>
      <Tree items={items} defaultExpandedIds={['docs', 'src']} aria-label="Project files" />
    </div>
  );
}
