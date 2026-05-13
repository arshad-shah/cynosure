import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
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
          Right-click for nested actions
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Open</ContextMenuItem>
        <ContextMenuItem>Open in new tab</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copy link</ContextMenuItem>
            <ContextMenuItem>Email</ContextMenuItem>
            <ContextMenuItem>Send via chat</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="danger">Move to trash</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
