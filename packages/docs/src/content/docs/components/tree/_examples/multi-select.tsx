import { Tree, type TreeNode } from '@arshad-shah/cynosure-react';

const items: TreeNode[] = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
      { id: 'cherry', label: 'Cherry' },
    ],
  },
  {
    id: 'veg',
    label: 'Vegetables',
    children: [
      { id: 'carrot', label: 'Carrot' },
      { id: 'kale', label: 'Kale' },
    ],
  },
];

export default function Example() {
  return (
    <div style={{ maxWidth: 280 }}>
      <Tree
        items={items}
        defaultExpandedIds={['fruit', 'veg']}
        selectionMode="multiple"
        defaultSelectedIds={['apple', 'kale']}
        aria-label="Groceries"
      />
    </div>
  );
}
