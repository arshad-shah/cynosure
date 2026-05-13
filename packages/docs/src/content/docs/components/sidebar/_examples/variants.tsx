import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
} from '@arshad-shah/cynosure-react';

function Demo({ variant }: { variant: 'sidebar' | 'floating' | 'inset' }) {
  return (
    <SidebarProvider variant={variant}>
      <Sidebar>
        <SidebarHeader>{variant}</SidebarHeader>
        <SidebarBody>
          <SidebarNav aria-label="Demo">
            <SidebarItem label="Home" isActive />
            <SidebarItem label="Inbox" />
          </SidebarNav>
        </SidebarBody>
      </Sidebar>
    </SidebarProvider>
  );
}

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Demo variant="sidebar" />
      <Demo variant="floating" />
      <Demo variant="inset" />
    </div>
  );
}
