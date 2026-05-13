import {
  MenuBar,
  MenuBarContent,
  MenuBarItem,
  MenuBarMenu,
  MenuBarTrigger,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <MenuBar>
      <MenuBarMenu>
        <MenuBarTrigger>File</MenuBarTrigger>
        <MenuBarContent>
          <MenuBarItem>New</MenuBarItem>
          <MenuBarItem>Open</MenuBarItem>
          <MenuBarItem>Save</MenuBarItem>
        </MenuBarContent>
      </MenuBarMenu>
      <MenuBarMenu>
        <MenuBarTrigger>Edit</MenuBarTrigger>
        <MenuBarContent>
          <MenuBarItem>Undo</MenuBarItem>
          <MenuBarItem>Redo</MenuBarItem>
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
        </MenuBarContent>
      </MenuBarMenu>
    </MenuBar>
  );
}
