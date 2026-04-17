import {
  Anchor,
  BackToTop,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Menu,
  MenuDivider,
  MenuGroup,
  MenuItem,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Pagination,
  PaginationNext,
  PaginationPages,
  PaginationPrevious,
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  Step,
  Stepper,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@lumen/react';
import { useState } from 'react';
import { Demo, DemoCol, SectionHeader } from './common';

export function NavigationSection() {
  const [page, setPage] = useState(3);

  return (
    <>
      <SectionHeader
        title="Navigation"
        description="Wayfinding — tabs, breadcrumbs, menus, pagination, sidebar."
      />
      <div className="showcase-grid">
        <DemoCol title="Tabs">
          <Tabs defaultValue="one">
            <TabsList>
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
              <TabsTrigger value="three">Three</TabsTrigger>
            </TabsList>
            <TabsContent value="one">First panel</TabsContent>
            <TabsContent value="two">Second panel</TabsContent>
            <TabsContent value="three">Third panel</TabsContent>
          </Tabs>
        </DemoCol>

        <DemoCol title="Breadcrumb">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </Breadcrumb>
        </DemoCol>

        <DemoCol title="Pagination">
          <Pagination totalPages={10} currentPage={page} onPageChange={setPage}>
            <PaginationPrevious />
            <PaginationPages />
            <PaginationNext />
          </Pagination>
        </DemoCol>

        <DemoCol title="Menu">
          <Menu aria-label="Sidebar">
            <MenuGroup label="Main">
              <MenuItem>Dashboard</MenuItem>
              <MenuItem>Projects</MenuItem>
              <MenuItem>Tasks</MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup label="Account">
              <MenuItem>Settings</MenuItem>
              <MenuItem>Sign out</MenuItem>
            </MenuGroup>
          </Menu>
        </DemoCol>

        <DemoCol title="NavigationMenu">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div style={{ padding: '1rem', minWidth: '16rem' }}>
                    <NavigationMenuLink href="#">Overview</NavigationMenuLink>
                    <NavigationMenuLink href="#">Pricing</NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Docs</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </DemoCol>

        <DemoCol title="Stepper">
          <Stepper>
            <Step title="Account" description="Basic info" status="complete" />
            <Step title="Profile" description="About you" status="active" />
            <Step title="Review" description="Confirm" status="pending" />
          </Stepper>
        </DemoCol>

        <DemoCol title="Sidebar">
          <div
            style={{
              display: 'flex',
              height: '14rem',
              border: '1px solid var(--lumen-color-border-default)',
              borderRadius: 'var(--lumen-radius-component-md)',
              overflow: 'hidden',
              width: '100%',
            }}
          >
            <SidebarProvider>
              <Sidebar>
                <SidebarHeader>
                  <strong>App</strong>
                </SidebarHeader>
                <SidebarBody>
                  <Menu>
                    <MenuItem>Home</MenuItem>
                    <MenuItem>Inbox</MenuItem>
                    <MenuItem>Projects</MenuItem>
                  </Menu>
                </SidebarBody>
                <SidebarFooter>
                  <SidebarTrigger label="Toggle" />
                </SidebarFooter>
              </Sidebar>
              <div style={{ flex: 1, padding: '1rem' }}>Main content</div>
            </SidebarProvider>
          </div>
        </DemoCol>

        <Demo title="Anchor">
          <Anchor id="intro" level={3}>
            Section heading
          </Anchor>
        </Demo>

        <Demo title="BackToTop">
          <BackToTop />
        </Demo>
      </div>
    </>
  );
}
