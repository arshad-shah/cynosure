import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tree, type TreeNode } from '../Tree/index.js';

const data: TreeNode[] = [
  {
    id: 'root',
    label: 'Root',
    children: [
      { id: 'a', label: 'A' },
      {
        id: 'b',
        label: 'B',
        children: [{ id: 'b1', label: 'B1' }],
      },
    ],
  },
];

function firstTreeItem(): HTMLElement {
  const items = screen.getAllByRole('treeitem');
  const first = items[0];
  if (!first) throw new Error('no treeitem found');
  return first;
}

describe('Tree', () => {
  it('exposes aria-tree semantics', () => {
    render(
      <Tree items={data} defaultExpandedIds={['root']}>
        {({ item }) => item.label as string}
      </Tree>,
    );
    expect(screen.getByRole('tree')).toBeInTheDocument();
    const items = screen.getAllByRole('treeitem');
    expect(items.length).toBeGreaterThan(0);
    const root = firstTreeItem();
    expect(root).toHaveAttribute('aria-expanded', 'true');
    expect(root).toHaveAttribute('aria-level', '1');
  });

  it('toggles expanded on click', () => {
    render(<Tree items={data}>{({ item }) => item.label as string}</Tree>);
    const root = firstTreeItem();
    expect(root).toHaveAttribute('aria-expanded', 'false');
    const row = root.querySelector('[data-slot="row"]') as HTMLElement;
    fireEvent.click(row);
    expect(root).toHaveAttribute('aria-expanded', 'true');
  });

  it('ArrowRight expands a collapsed node', () => {
    render(<Tree items={data}>{({ item }) => item.label as string}</Tree>);
    const root = firstTreeItem();
    root.focus();
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    expect(root).toHaveAttribute('aria-expanded', 'true');
  });

  it('supports single selection mode', () => {
    const onSelectionChange = vi.fn();
    render(
      <Tree
        items={data}
        defaultExpandedIds={['root']}
        selectionMode="single"
        onSelectionChange={onSelectionChange}
      >
        {({ item }) => item.label as string}
      </Tree>,
    );
    const items = screen.getAllByRole('treeitem');
    const a = items.find((el) => el.getAttribute('data-tree-id') === 'a');
    if (!a) throw new Error('missing node A');
    const row = a.querySelector('[data-slot="row"]') as HTMLElement;
    fireEvent.click(row);
    expect(onSelectionChange).toHaveBeenCalledWith(['a']);
    expect(a).toHaveAttribute('aria-selected', 'true');
  });
});
