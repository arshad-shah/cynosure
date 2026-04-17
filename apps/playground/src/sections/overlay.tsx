import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  MenuBar,
  MenuBarContent,
  MenuBarItem,
  MenuBarMenu,
  MenuBarTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  toast,
} from '@lumen/react';
import { Demo, SectionHeader } from './common';

export function OverlaySection() {
  return (
    <>
      <SectionHeader
        title="Overlays"
        description="Floating and portaled surfaces — dialogs, menus, tooltips."
      />
      <div className="showcase-grid">
        <Demo title="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm action</DialogTitle>
                <DialogDescription>This is a Lumen Dialog.</DialogDescription>
              </DialogHeader>
              <p>Body content goes here.</p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Confirm</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Demo>

        <Demo title="AlertDialog">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button colorScheme="danger">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="ghost">Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button colorScheme="danger">Delete</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Demo>

        <Demo title="Drawer">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Open drawer</Button>
            </DrawerTrigger>
            <DrawerContent side="right">
              <DrawerHeader>
                <DrawerTitle>Settings</DrawerTitle>
                <DrawerDescription>Drawer surface anchored to the right.</DrawerDescription>
              </DrawerHeader>
              <div style={{ padding: '1rem' }}>Drawer body</div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button>Done</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </Demo>

        <Demo title="Popover">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open popover</Button>
            </PopoverTrigger>
            <PopoverContent>Popover body</PopoverContent>
          </Popover>
        </Demo>

        <Demo title="DropdownMenu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Menu ▾</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>New file</DropdownMenuItem>
              <DropdownMenuItem>Open…</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Demo>

        <Demo title="ContextMenu">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                style={{
                  padding: '1rem',
                  border: '1px dashed var(--lumen-color-border-default)',
                  borderRadius: 'var(--lumen-radius-component-md)',
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                Right-click here
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Cut</ContextMenuItem>
              <ContextMenuItem>Copy</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </Demo>

        <Demo title="HoverCard">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost">@lumen</Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <strong>Lumen UI</strong>
              <p style={{ margin: '0.25rem 0 0' }}>Token-first design system.</p>
            </HoverCardContent>
          </HoverCard>
        </Demo>

        <Demo title="MenuBar">
          <MenuBar>
            <MenuBarMenu>
              <MenuBarTrigger>File</MenuBarTrigger>
              <MenuBarContent>
                <MenuBarItem>New</MenuBarItem>
                <MenuBarItem>Open</MenuBarItem>
              </MenuBarContent>
            </MenuBarMenu>
            <MenuBarMenu>
              <MenuBarTrigger>Edit</MenuBarTrigger>
              <MenuBarContent>
                <MenuBarItem>Undo</MenuBarItem>
                <MenuBarItem>Redo</MenuBarItem>
              </MenuBarContent>
            </MenuBarMenu>
          </MenuBar>
        </Demo>

        <Demo title="Tooltip">
          <Tooltip content="Tooltip text">
            <Button variant="outline">Hover me</Button>
          </Tooltip>
        </Demo>

        <Demo title="Toast">
          <Button
            onClick={() => toast.success('Saved!', { description: 'Your changes were saved.' })}
          >
            Show toast
          </Button>
        </Demo>
      </div>
    </>
  );
}
