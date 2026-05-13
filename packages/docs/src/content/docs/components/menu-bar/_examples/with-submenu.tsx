import {
  MenuBar,
  MenuBarContent,
  MenuBarItem,
  MenuBarMenu,
  MenuBarSeparator,
  MenuBarSub,
  MenuBarSubContent,
  MenuBarSubTrigger,
  MenuBarTrigger,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <MenuBar>
      <MenuBarMenu>
        <MenuBarTrigger>File</MenuBarTrigger>
        <MenuBarContent>
          <MenuBarItem>New file</MenuBarItem>
          <MenuBarItem>Open…</MenuBarItem>
          <MenuBarSub>
            <MenuBarSubTrigger>Open recent</MenuBarSubTrigger>
            <MenuBarSubContent>
              <MenuBarItem>Q4 planning.md</MenuBarItem>
              <MenuBarItem>cynosure-app/README.md</MenuBarItem>
              <MenuBarItem>notes.md</MenuBarItem>
              <MenuBarSeparator />
              <MenuBarItem>Clear recent</MenuBarItem>
            </MenuBarSubContent>
          </MenuBarSub>
          <MenuBarSeparator />
          <MenuBarItem>Save</MenuBarItem>
        </MenuBarContent>
      </MenuBarMenu>
    </MenuBar>
  );
}
