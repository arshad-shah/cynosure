import { Tree, type TreeNode } from '@arshad-shah/cynosure-react';

const items: TreeNode[] = [
  {
    id: 'departments',
    label: 'Departments',
    children: [
      { id: 'engineering', label: 'Engineering' },
      { id: 'design', label: 'Design' },
      { id: 'marketing', label: 'Marketing' },
    ],
  },
];

export default function Example() {
  return (
    <div style={{ maxWidth: 280 }}>
      <Tree
        items={items}
        defaultExpandedIds={['departments']}
        selectionMode="single"
        defaultSelectedIds={['design']}
        aria-label="Departments"
      />
    </div>
  );
}
