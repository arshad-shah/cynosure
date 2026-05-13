import { Tree, type TreeNode } from '@arshad-shah/cynosure-react';

const items: TreeNode[] = [
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
          { id: 'src/hooks/useId.ts', label: 'useId.ts' },
          { id: 'src/hooks/useTheme.ts', label: 'useTheme.ts' },
        ],
      },
      { id: 'src/index.ts', label: 'index.ts' },
    ],
  },
  { id: 'README.md', label: 'README.md' },
  { id: 'package.json', label: 'package.json' },
];

export default function Example() {
  return (
    <div style={{ maxWidth: 320 }}>
      <Tree items={items} defaultExpandedIds={['src']} aria-label="Files" />
    </div>
  );
}
