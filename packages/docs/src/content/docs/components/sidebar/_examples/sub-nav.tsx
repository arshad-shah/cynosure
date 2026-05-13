import {
  Sidebar,
  SidebarBody,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
  SidebarSubItem,
  SidebarSubNav,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>Docs</SidebarHeader>
        <SidebarBody>
          <SidebarNav aria-label="Docs">
            <SidebarGroup>
              <SidebarSubNav
                parentLabel="Components"
                defaultOpen
                trigger={<SidebarItem label="Components" />}
              >
                <SidebarSubItem isActive>Tabs</SidebarSubItem>
                <SidebarSubItem>Stepper</SidebarSubItem>
                <SidebarSubItem>Pagination</SidebarSubItem>
              </SidebarSubNav>
              <SidebarItem label="Tokens" />
              <SidebarItem label="Recipes" />
            </SidebarGroup>
          </SidebarNav>
        </SidebarBody>
      </Sidebar>
    </SidebarProvider>
  );
}
