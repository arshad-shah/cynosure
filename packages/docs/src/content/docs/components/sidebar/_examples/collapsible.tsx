import {
  Sidebar,
  SidebarBody,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
  SidebarTrigger,
} from '@arshad-shah/cynosure-react';

const IconHome = () => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5h-2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);
const IconInbox = () => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export default function Example() {
  return (
    <SidebarProvider defaultCollapsed collapsible="icon">
      <Sidebar>
        <SidebarHeader>
          <SidebarTrigger hideLabel />
        </SidebarHeader>
        <SidebarBody>
          <SidebarNav aria-label="Primary">
            <SidebarGroup>
              <SidebarItem icon={<IconHome />} label="Dashboard" isActive />
              <SidebarItem icon={<IconInbox />} label="Inbox" />
            </SidebarGroup>
          </SidebarNav>
        </SidebarBody>
      </Sidebar>
    </SidebarProvider>
  );
}
