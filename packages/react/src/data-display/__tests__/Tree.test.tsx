import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tree, type TreeNode, mapToTreeNodes } from '../Tree/index.js';

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

  it('toggles individual ids in multiple selection mode with ctrl-click', () => {
    const onSelectionChange = vi.fn();
    render(
      <Tree
        items={data}
        defaultExpandedIds={['root']}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
      >
        {({ item }) => item.label as string}
      </Tree>,
    );
    const items = screen.getAllByRole('treeitem');
    const a = items.find((el) => el.getAttribute('data-tree-id') === 'a');
    const b = items.find((el) => el.getAttribute('data-tree-id') === 'b');
    if (!a || !b) throw new Error('missing node');
    fireEvent.click(a.querySelector('[data-slot="row"]') as HTMLElement, { ctrlKey: true });
    fireEvent.click(b.querySelector('[data-slot="row"]') as HTMLElement, { ctrlKey: true });
    expect(onSelectionChange).toHaveBeenLastCalledWith(expect.arrayContaining(['a', 'b']));
  });

  it('honours arrow keys for navigation', () => {
    render(
      <Tree items={data} defaultExpandedIds={['root', 'b']}>
        {({ item }) => item.label as string}
      </Tree>,
    );
    const root = firstTreeItem();
    root.focus();
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    fireEvent.keyDown(root, { key: 'ArrowUp' });
    fireEvent.keyDown(root, { key: 'Home' });
    fireEvent.keyDown(root, { key: 'End' });
  });

  it('ArrowLeft on an expanded node collapses it', () => {
    render(
      <Tree items={data} defaultExpandedIds={['root']}>
        {({ item }) => item.label as string}
      </Tree>,
    );
    const root = firstTreeItem();
    root.focus();
    fireEvent.keyDown(root, { key: 'ArrowLeft' });
    expect(root).toHaveAttribute('aria-expanded', 'false');
  });

  it('Enter toggles expanded and selection together', () => {
    const onSelectionChange = vi.fn();
    render(
      <Tree items={data} selectionMode="single" onSelectionChange={onSelectionChange}>
        {({ item }) => item.label as string}
      </Tree>,
    );
    const root = firstTreeItem();
    root.focus();
    fireEvent.keyDown(root, { key: 'Enter' });
    expect(root).toHaveAttribute('aria-expanded', 'true');
    expect(onSelectionChange).toHaveBeenCalledWith(['root']);
  });

  it('* key expands every node at the same depth', () => {
    const onExpandedChange = vi.fn();
    render(
      <Tree items={data} defaultExpandedIds={['root']} onExpandedChange={onExpandedChange}>
        {({ item }) => item.label as string}
      </Tree>,
    );
    const root = firstTreeItem();
    root.focus();
    fireEvent.keyDown(root, { key: '*' });
    expect(onExpandedChange).toHaveBeenCalled();
  });

  it('renders defaults when no children render-function is supplied', () => {
    render(<Tree items={[{ id: 'a', label: 'A' }]} aria-label="t" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('reads node fields through accessor props when provided', () => {
    interface ApiNode {
      uuid: string;
      name: string;
      subItems?: ApiNode[];
      locked?: boolean;
    }
    const apiData: ApiNode[] = [
      {
        uuid: 'root',
        name: 'Root',
        subItems: [
          { uuid: 'a', name: 'A' },
          { uuid: 'b', name: 'B', locked: true },
        ],
      },
    ];
    const onSelectionChange = vi.fn();
    render(
      <Tree<ApiNode>
        items={apiData}
        getId={(n) => n.uuid}
        getLabel={(n) => n.name}
        getChildren={(n) => n.subItems}
        getDisabled={(n) => n.locked}
        defaultExpandedIds={['root']}
        selectionMode="single"
        onSelectionChange={onSelectionChange}
      />,
    );
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    const items = screen.getAllByRole('treeitem');
    const b = items.find((el) => el.getAttribute('data-tree-id') === 'b');
    if (!b) throw new Error('missing node B');
    expect(b).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(b.querySelector('[data-slot="row"]') as HTMLElement);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('forwards arbitrary T into the render function', () => {
    interface ApiNode {
      uuid: string;
      name: string;
      subItems?: ApiNode[];
    }
    const apiData: ApiNode[] = [{ uuid: 'x', name: 'X', subItems: [{ uuid: 'y', name: 'Y' }] }];
    render(
      <Tree<ApiNode>
        items={apiData}
        getId={(n) => n.uuid}
        getChildren={(n) => n.subItems}
        defaultExpandedIds={['x']}
      >
        {({ item }) => <span data-testid={`n-${item.uuid}`}>{item.name.toUpperCase()}</span>}
      </Tree>,
    );
    expect(screen.getByTestId('n-x')).toHaveTextContent('X');
    expect(screen.getByTestId('n-y')).toHaveTextContent('Y');
  });

  it('marks disabled nodes and skips selection on click', () => {
    const onSelectionChange = vi.fn();
    render(
      <Tree
        items={[{ id: 'a', label: 'A', disabled: true }]}
        selectionMode="single"
        onSelectionChange={onSelectionChange}
      />,
    );
    const items = screen.getAllByRole('treeitem');
    const a = items[0] as HTMLElement;
    fireEvent.click(a.querySelector('[data-slot="row"]') as HTMLElement);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(a).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('mapToTreeNodes', () => {
  interface ApiNode {
    uuid: string;
    name: string;
    subItems?: ApiNode[];
    locked?: boolean;
  }

  it('maps a foreign shape into TreeNode form', () => {
    const apiData: ApiNode[] = [
      {
        uuid: 'root',
        name: 'Root',
        subItems: [
          { uuid: 'a', name: 'A' },
          { uuid: 'b', name: 'B', locked: true },
        ],
      },
    ];
    const mapped = mapToTreeNodes(apiData, {
      getId: (n) => n.uuid,
      getLabel: (n) => n.name,
      getChildren: (n) => n.subItems,
      getDisabled: (n) => n.locked,
    });
    expect(mapped).toEqual([
      {
        id: 'root',
        label: 'Root',
        children: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B', disabled: true },
        ],
      },
    ]);
  });

  it('omits children when the source has none', () => {
    const result = mapToTreeNodes([{ uuid: 'x', name: 'X' } as ApiNode], {
      getId: (n) => n.uuid,
      getLabel: (n) => n.name,
      getChildren: (n) => n.subItems,
    });
    expect(result[0]).not.toHaveProperty('children');
  });

  it('feeds mapped data straight into <Tree>', () => {
    const apiData: ApiNode[] = [
      { uuid: 'root', name: 'Root', subItems: [{ uuid: 'a', name: 'A' }] },
    ];
    const mapped = mapToTreeNodes(apiData, {
      getId: (n) => n.uuid,
      getLabel: (n) => n.name,
      getChildren: (n) => n.subItems,
    });
    render(<Tree items={mapped} defaultExpandedIds={['root']} />);
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
