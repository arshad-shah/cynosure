import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
  SidebarSeparator,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>Cynosure</SidebarHeader>
        <SidebarBody>
          <SidebarNav aria-label="Primary">
            <SidebarItem label="Dashboard" isActive />
            <SidebarItem label="Projects" />
          </SidebarNav>
        </SidebarBody>
        <SidebarSeparator />
        <SidebarFooter>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--cynosure-radius-full)',
                background: 'var(--cynosure-color-accent-solid)',
              }}
              aria-hidden="true"
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Arshad</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--cynosure-color-fg-muted)' }}>
                Pro plan
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
