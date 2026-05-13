import {
  Sidebar,
  SidebarBody,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
} from '@arshad-shah/cynosure-react';

const IconPlus = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function Example() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>Workspace</SidebarHeader>
        <SidebarBody>
          <SidebarNav aria-label="Primary">
            <SidebarGroup label="Pinned" collapsible defaultOpen>
              <SidebarItem label="Dashboard" isActive />
              <SidebarItem label="Tasks" />
            </SidebarGroup>
            <SidebarGroup
              label="Projects"
              collapsible
              defaultOpen={false}
              action={
                <button
                  type="button"
                  aria-label="New project"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--cynosure-color-fg-muted)',
                  }}
                >
                  <IconPlus />
                </button>
              }
            >
              <SidebarItem label="Cynosure" />
              <SidebarItem label="Studio" />
            </SidebarGroup>
          </SidebarNav>
        </SidebarBody>
      </Sidebar>
    </SidebarProvider>
  );
}
