import {
  Anchor,
  BackToTop,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  Card,
  CardBody,
  CardHeader,
  Heading,
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
  NavigationMenuViewport,
  Pagination,
  Stack,
  Step,
  Stepper,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '@arshad-shah/cynosure-react';
import { Archive, ArrowUpRight, Copy, Pencil, Settings, Share2, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function NavigationPlayground() {
  return <NavigationPlaygroundInner />;
}

function NavigationPlaygroundInner() {
  const [page, setPage] = useState(7);

  return (
    <Stack gap="3">
      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Tabs
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="5">
            {(['line', 'solid', 'enclosed', 'soft'] as const).map((variant) => (
              <Stack key={variant} gap="2">
                <Text size="sm" color="fg.muted">
                  variant="{variant}"
                </Text>
                <Tabs defaultValue="overview" variant={variant}>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                    <Text size="sm" color="fg.muted">
                      Snapshot of workspace health, recent deployments, and outstanding review
                      requests.
                    </Text>
                  </TabsContent>
                  <TabsContent value="activity">
                    <Text size="sm" color="fg.muted">
                      14 commits, 3 merged pull requests, and 2 incident reports in the last 24
                      hours.
                    </Text>
                  </TabsContent>
                  <TabsContent value="settings">
                    <Text size="sm" color="fg.muted">
                      Manage workspace name, default branch, and collaborator permissions.
                    </Text>
                  </TabsContent>
                </Tabs>
              </Stack>
            ))}
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Breadcrumb
          </Heading>
        </CardHeader>
        <CardBody>
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="#home">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#settings">Settings</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrent>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </Breadcrumb>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Pagination
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Pagination totalPages={25} currentPage={page} onPageChange={setPage} showFirstLast />
            <Text size="sm" color="fg.muted">
              Showing page <strong>{page}</strong> of 25.
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Menu
          </Heading>
        </CardHeader>
        <CardBody>
          <Menu aria-label="Document actions">
            <MenuGroup label="Edit">
              <MenuItem icon={<Pencil size={16} aria-hidden />}>Rename</MenuItem>
              <MenuItem icon={<Copy size={16} aria-hidden />}>Duplicate</MenuItem>
              <MenuItem icon={<Share2 size={16} aria-hidden />} badge="New">
                Share
              </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup label="Organise">
              <MenuItem icon={<Archive size={16} aria-hidden />}>Archive</MenuItem>
              <MenuItem icon={<Settings size={16} aria-hidden />}>Properties</MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup label="Danger zone">
              <MenuItem icon={<Trash2 size={16} aria-hidden />}>Delete forever</MenuItem>
            </MenuGroup>
          </Menu>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            NavigationMenu
          </Heading>
        </CardHeader>
        <CardBody>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Product</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <Stack gap="2" padding="4">
                    <NavigationMenuLink href="#analytics">
                      <Text weight="semibold" size="sm">
                        Analytics
                      </Text>
                      <Text size="sm" color="fg.muted">
                        Understand your audience without leaving the dashboard.
                      </Text>
                    </NavigationMenuLink>
                    <NavigationMenuLink href="#automations">
                      <Text weight="semibold" size="sm">
                        Automations
                      </Text>
                      <Text size="sm" color="fg.muted">
                        Stitch workflows between your tools.
                      </Text>
                    </NavigationMenuLink>
                    <NavigationMenuLink href="#integrations">
                      <Text weight="semibold" size="sm">
                        Integrations
                      </Text>
                      <Text size="sm" color="fg.muted">
                        Over 40 partners with one-click install.
                      </Text>
                    </NavigationMenuLink>
                  </Stack>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <Stack gap="2" padding="4">
                    <NavigationMenuLink href="#docs">
                      <Text weight="semibold" size="sm">
                        Documentation
                      </Text>
                      <Text size="sm" color="fg.muted">
                        Guides, references, and tutorials.
                      </Text>
                    </NavigationMenuLink>
                    <NavigationMenuLink href="#changelog">
                      <Text weight="semibold" size="sm">
                        Changelog
                      </Text>
                      <Text size="sm" color="fg.muted">
                        See what just shipped.
                      </Text>
                    </NavigationMenuLink>
                    <NavigationMenuLink href="#community">
                      <Text weight="semibold" size="sm">
                        Community
                      </Text>
                      <Text size="sm" color="fg.muted">
                        Join the Discord.
                      </Text>
                    </NavigationMenuLink>
                  </Stack>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuViewport />
          </NavigationMenu>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Stepper
          </Heading>
        </CardHeader>
        <CardBody>
          <Stepper currentStep={1}>
            <Step title="Cart" description="3 items ready" />
            <Step title="Shipping" description="Enter your address" />
            <Step title="Payment" description="Card or invoice" />
            <Step title="Review" description="Confirm and place order" />
          </Stepper>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Anchor
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="4">
            <Text size="sm" color="fg.muted">
              Hover each heading to reveal the copy-link affordance.
            </Text>
            <Anchor id="nav-installation" level={2}>
              Installation
            </Anchor>
            <Anchor id="nav-anatomy" level={3}>
              Anatomy
            </Anchor>
            <Anchor id="nav-accessibility" level={3}>
              Accessibility
            </Anchor>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            BackToTop
          </Heading>
        </CardHeader>
        <CardBody>
          <Text>
            Scroll the page far enough and a floating button appears in the bottom-right corner.
          </Text>
        </CardBody>
      </Card>

      <BackToTop showAfter={200} icon={<ArrowUpRight size={16} aria-hidden />} />
    </Stack>
  );
}
