import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          style={{
            padding: '2rem',
            border: '1px dashed var(--cynosure-color-border-default, #d4d4d4)',
            borderRadius: '0.5rem',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          Right-click to see shortcuts
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Undo
          <ContextMenuShortcut>⌘Z</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Redo
          <ContextMenuShortcut>⇧⌘Z</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          Find
          <ContextMenuShortcut>⌘F</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Replace
          <ContextMenuShortcut>⌥⌘F</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
