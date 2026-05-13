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
  Card,
  CardBody,
  CardHeader,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandMenu,
  CommandSeparator,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  Dialog,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTriggerButton,
  Grid,
  Heading,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Inline,
  Link,
  MenuBar,
  MenuBarContent,
  MenuBarItem,
  MenuBarMenu,
  MenuBarSeparator,
  MenuBarShortcut,
  MenuBarSub,
  MenuBarSubContent,
  MenuBarSubTrigger,
  MenuBarTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  Toaster,
  Tooltip,
  toast,
} from '@arshad-shah/cynosure-react';
import { ArrowRight, Copy, FileText, Pencil, Settings, Terminal, Trash2, User } from 'lucide-react';
import { useState } from 'react';

export function OverlaysPlayground() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <Grid columns={{ base: 1, md: 2 }} gap="4">
      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            AlertDialog
          </Heading>
        </CardHeader>
        <CardBody>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="soft" colorScheme="danger">
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes your workspace and all associated data. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="ghost">Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button colorScheme="danger">Yes, delete</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            CommandPalette
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Button onClick={() => setPaletteOpen(true)}>Open palette</Button>
            <CommandMenu open={paletteOpen} onOpenChange={setPaletteOpen}>
              <CommandInput />
              <CommandList>
                <CommandEmpty />
                <CommandGroup heading="Navigation">
                  <CommandItem icon={<FileText size={16} />} onSelect={() => setPaletteOpen(false)}>
                    Open file…
                  </CommandItem>
                  <CommandItem
                    icon={<User size={16} />}
                    shortcut="⌘ P"
                    onSelect={() => setPaletteOpen(false)}
                  >
                    Go to profile
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Actions">
                  <CommandItem
                    icon={<Terminal size={16} />}
                    description="Run a shell command in workspace"
                    shortcut="Ctrl+`"
                    onSelect={() => setPaletteOpen(false)}
                  >
                    Open terminal
                  </CommandItem>
                  <CommandItem
                    icon={<Settings size={16} />}
                    shortcut="⌘ ,"
                    onSelect={() => setPaletteOpen(false)}
                  >
                    Settings
                  </CommandItem>
                  <CommandItem icon={<ArrowRight size={16} />} disabled>
                    Deploy (disabled)
                  </CommandItem>
                </CommandGroup>
              </CommandList>
              <CommandFooter />
            </CommandMenu>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            ContextMenu
          </Heading>
        </CardHeader>
        <CardBody>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <Stack
                padding="6"
                minHeight="120px"
                borderRadius="md"
                borderWidth="1"
                borderStyle="dashed"
                borderColor="border.default"
                background="bg.subtle"
                align="center"
                justify="center"
              >
                <Text size="sm" color="fg.muted">
                  Right-click anywhere in this box
                </Text>
              </Stack>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>File</ContextMenuLabel>
              <ContextMenuItem>
                Open
                <ContextMenuShortcut>⌘O</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem>Rename</ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Open with</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem>Text editor</ContextMenuItem>
                  <ContextMenuItem>Preview</ContextMenuItem>
                  <ContextMenuItem>System default</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
              <ContextMenuItem variant="danger">
                Move to trash
                <ContextMenuShortcut>⌫</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Dialog
          </Heading>
        </CardHeader>
        <CardBody>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm action</DialogTitle>
                <DialogDescription>
                  Dialogs in Cynosure trap focus, restore it on close, and lock background
                  scrolling.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost">Cancel</Button>
                <Button>Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Drawer
          </Heading>
        </CardHeader>
        <CardBody>
          <Drawer>
            <DrawerTrigger asChild>
              <Button>Open drawer</Button>
            </DrawerTrigger>
            <DrawerContent side="right" size="md">
              <DrawerHeader>
                <DrawerTitle>Notifications</DrawerTitle>
                <DrawerDescription>Recent activity in your workspace.</DrawerDescription>
              </DrawerHeader>
              <Stack gap="3" paddingX="5" paddingBottom="3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Stack key={`n-${i.toString()}`} gap="1">
                    <Text size="sm" weight="medium">
                      Build #{1200 + i} completed
                    </Text>
                    <Text size="xs" color="fg.muted">
                      {i + 1}m ago
                    </Text>
                  </Stack>
                ))}
              </Stack>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="ghost">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            DropdownMenu
          </Heading>
        </CardHeader>
        <CardBody>
          <DropdownMenu>
            <DropdownMenuTriggerButton variant="outline">Document</DropdownMenuTriggerButton>
            <DropdownMenuContent>
              <DropdownMenuLabel>Document</DropdownMenuLabel>
              <DropdownMenuItem icon={<Pencil size={14} />}>
                Rename
                <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem icon={<Copy size={14} />}>
                Duplicate
                <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Copy link</DropdownMenuItem>
                  <DropdownMenuItem>Email</DropdownMenuItem>
                  <DropdownMenuItem>Slack</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={<Trash2 size={14} />} variant="danger">
                Delete
                <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            HoverCard
          </Heading>
        </CardHeader>
        <CardBody>
          <Text size="md">
            Assigned to{' '}
            <HoverCard>
              <HoverCardTrigger asChild>
                <Link href="#">@alex</Link>
              </HoverCardTrigger>
              <HoverCardContent>
                <Stack gap="3" padding="4" minWidth="280px">
                  <Inline gap="3" align="center">
                    <Stack
                      width="44px"
                      height="44px"
                      borderRadius="full"
                      background="accent.soft"
                      align="center"
                      justify="center"
                    >
                      <Text weight="semibold">AL</Text>
                    </Stack>
                    <Stack gap="0">
                      <Text size="sm" weight="semibold">
                        Alex Lane
                      </Text>
                      <Text size="xs" color="fg.muted">
                        Design systems lead
                      </Text>
                    </Stack>
                  </Inline>
                  <Text size="sm">
                    Works on tokens, primitives, and the overlay system. Based in Dublin.
                  </Text>
                  <Inline gap="4">
                    <Text size="xs" color="fg.muted">
                      <strong>128</strong> PRs
                    </Text>
                    <Text size="xs" color="fg.muted">
                      <strong>42</strong> issues
                    </Text>
                  </Inline>
                </Stack>
              </HoverCardContent>
            </HoverCard>{' '}
            for review.
          </Text>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            MenuBar
          </Heading>
        </CardHeader>
        <CardBody>
          <MenuBar>
            <MenuBarMenu>
              <MenuBarTrigger>File</MenuBarTrigger>
              <MenuBarContent>
                <MenuBarItem>
                  New file
                  <MenuBarShortcut>⌘N</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarItem>
                  Open…
                  <MenuBarShortcut>⌘O</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarSub>
                  <MenuBarSubTrigger>Open recent</MenuBarSubTrigger>
                  <MenuBarSubContent>
                    <MenuBarItem>Q4 planning.md</MenuBarItem>
                    <MenuBarItem>cynosure-app/README.md</MenuBarItem>
                    <MenuBarItem>notes.md</MenuBarItem>
                  </MenuBarSubContent>
                </MenuBarSub>
                <MenuBarSeparator />
                <MenuBarItem>
                  Save
                  <MenuBarShortcut>⌘S</MenuBarShortcut>
                </MenuBarItem>
              </MenuBarContent>
            </MenuBarMenu>
            <MenuBarMenu>
              <MenuBarTrigger>Edit</MenuBarTrigger>
              <MenuBarContent>
                <MenuBarItem>
                  Undo
                  <MenuBarShortcut>⌘Z</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarItem disabled>
                  Redo
                  <MenuBarShortcut>⇧⌘Z</MenuBarShortcut>
                </MenuBarItem>
                <MenuBarSeparator />
                <MenuBarItem>Cut</MenuBarItem>
                <MenuBarItem>Copy</MenuBarItem>
                <MenuBarItem>Paste</MenuBarItem>
              </MenuBarContent>
            </MenuBarMenu>
            <MenuBarMenu>
              <MenuBarTrigger>View</MenuBarTrigger>
              <MenuBarContent>
                <MenuBarItem>Zoom in</MenuBarItem>
                <MenuBarItem>Zoom out</MenuBarItem>
                <MenuBarSeparator />
                <MenuBarItem>Toggle sidebar</MenuBarItem>
              </MenuBarContent>
            </MenuBarMenu>
          </MenuBar>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Popover
          </Heading>
        </CardHeader>
        <CardBody>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <Stack gap="2" padding="4" minWidth="240px">
                <Text size="sm" weight="medium">
                  Anchored content
                </Text>
                <Text size="sm" color="fg.muted">
                  Popovers anchor against their trigger and follow it on scroll.
                </Text>
              </Stack>
            </PopoverContent>
          </Popover>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Toast
          </Heading>
        </CardHeader>
        <CardBody>
          <Inline align="center" gap="3" wrap>
            <Button onClick={() => toast('Saved your changes.')}>Default</Button>
            <Button onClick={() => toast.success('All set!')}>Success</Button>
            <Button colorScheme="danger" onClick={() => toast.error('Could not save.')}>
              Error
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.promise(new Promise((resolve) => setTimeout(resolve, 1400)), {
                  loading: 'Saving…',
                  success: 'Saved',
                  error: 'Failed to save',
                })
              }
            >
              Promise
            </Button>
          </Inline>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Tooltip
          </Heading>
        </CardHeader>
        <CardBody>
          <Inline gap="3">
            <Tooltip content="Saves to your draft folder.">
              <Button variant="outline">Hover me</Button>
            </Tooltip>
            <Tooltip content="Send the current draft to reviewers.">
              <Button variant="ghost">Send for review</Button>
            </Tooltip>
          </Inline>
        </CardBody>
      </Card>

      <Toaster />
    </Grid>
  );
}
