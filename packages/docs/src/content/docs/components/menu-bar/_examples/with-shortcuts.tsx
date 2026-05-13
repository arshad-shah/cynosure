import {
  MenuBar,
  MenuBarContent,
  MenuBarItem,
  MenuBarMenu,
  MenuBarSeparator,
  MenuBarShortcut,
  MenuBarTrigger,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
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
          <MenuBarSeparator />
          <MenuBarItem>
            Save
            <MenuBarShortcut>⌘S</MenuBarShortcut>
          </MenuBarItem>
          <MenuBarItem>
            Save as…
            <MenuBarShortcut>⇧⌘S</MenuBarShortcut>
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
          <MenuBarItem>
            Redo
            <MenuBarShortcut>⇧⌘Z</MenuBarShortcut>
          </MenuBarItem>
        </MenuBarContent>
      </MenuBarMenu>
    </MenuBar>
  );
}
