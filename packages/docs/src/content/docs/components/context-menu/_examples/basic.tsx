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
          Right-click anywhere inside this box
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="danger">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
