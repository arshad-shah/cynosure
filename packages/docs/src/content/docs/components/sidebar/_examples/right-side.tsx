import {
  Sidebar,
  SidebarBody,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <SidebarProvider side="right">
      <Sidebar>
        <SidebarHeader>Inspector</SidebarHeader>
        <SidebarBody>
          <SidebarNav aria-label="Inspector">
            <SidebarGroup label="Details">
              <SidebarItem label="Overview" isActive />
              <SidebarItem label="Activity" />
              <SidebarItem label="Files" />
            </SidebarGroup>
          </SidebarNav>
        </SidebarBody>
      </Sidebar>
    </SidebarProvider>
  );
}
