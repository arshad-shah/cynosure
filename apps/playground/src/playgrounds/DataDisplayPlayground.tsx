import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardImage,
  CardTitle,
  Carousel,
  CarouselContainer,
  CarouselDots,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
  CarouselViewport,
  CircularProgress,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DataTable,
  Grid,
  Heading,
  Inline,
  LinearProgress,
  Resizable,
  ResizableHandle,
  ResizablePanel,
  ScrollArea,
  Skeleton,
  Spinner,
  Stack,
  Stat,
  StatArrow,
  StatHelp,
  StatLabel,
  StatValue,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  Tree,
} from '@arshad-shah/cynosure-react';
import type { ColumnDef, TreeNode } from '@arshad-shah/cynosure-react';
import { CodeBlock } from '@arshad-shah/cynosure-react/code-block';
import { Check, FileText, Folder, GitCommit, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

interface InvoiceRow {
  id: string;
  customer: string;
  status: 'paid' | 'pending' | 'overdue';
  method: string;
  amount: number;
}

const INVOICES: InvoiceRow[] = [
  { id: 'INV-001', customer: 'Ava Thompson', status: 'paid', method: 'Credit card', amount: 250 },
  {
    id: 'INV-002',
    customer: 'Marcus Lin',
    status: 'pending',
    method: 'Bank transfer',
    amount: 150,
  },
  { id: 'INV-003', customer: 'Sara Park', status: 'overdue', method: 'PayPal', amount: 320 },
  { id: 'INV-004', customer: 'Dylan Moore', status: 'paid', method: 'Credit card', amount: 99 },
  { id: 'INV-005', customer: 'Nia Adebayo', status: 'paid', method: 'Credit card', amount: 480 },
];

const currency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const invoiceStatusColor = (status: InvoiceRow['status']): 'success' | 'warning' | 'danger' => {
  if (status === 'paid') return 'success';
  if (status === 'pending') return 'warning';
  return 'danger';
};

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'guest';
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
}

const USERS: User[] = [
  {
    id: '1',
    name: 'Ava Thompson',
    email: 'ava@example.com',
    role: 'admin',
    status: 'active',
    lastActive: '2026-04-16',
  },
  {
    id: '2',
    name: 'Marcus Lin',
    email: 'marcus@example.com',
    role: 'member',
    status: 'active',
    lastActive: '2026-04-15',
  },
  {
    id: '3',
    name: 'Sara Park',
    email: 'sara@example.com',
    role: 'member',
    status: 'invited',
    lastActive: '2026-04-10',
  },
  {
    id: '4',
    name: 'Dylan Moore',
    email: 'dylan@example.com',
    role: 'guest',
    status: 'suspended',
    lastActive: '2026-03-14',
  },
  {
    id: '5',
    name: 'Nia Adebayo',
    email: 'nia@example.com',
    role: 'admin',
    status: 'active',
    lastActive: '2026-04-17',
  },
  {
    id: '6',
    name: 'Finn O’Brien',
    email: 'finn@example.com',
    role: 'member',
    status: 'active',
    lastActive: '2026-04-11',
  },
  {
    id: '7',
    name: 'Priya Narayan',
    email: 'priya@example.com',
    role: 'member',
    status: 'active',
    lastActive: '2026-04-12',
  },
];

const userStatusScheme = (status: User['status']): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (status === 'active') return 'success';
  if (status === 'invited') return 'warning';
  if (status === 'suspended') return 'danger';
  return 'neutral';
};

const userColumns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge colorScheme={userStatusScheme(row.original.status)} size="sm">
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: 'lastActive', header: 'Last active' },
];

const FILE_TREE: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'src/components',
        label: 'components',
        children: [
          { id: 'src/components/Button.tsx', label: 'Button.tsx' },
          { id: 'src/components/Card.tsx', label: 'Card.tsx' },
          { id: 'src/components/Tree.tsx', label: 'Tree.tsx' },
        ],
      },
      { id: 'src/index.ts', label: 'index.ts' },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      { id: 'public/favicon.ico', label: 'favicon.ico' },
      { id: 'public/robots.txt', label: 'robots.txt' },
    ],
  },
  { id: 'package.json', label: 'package.json' },
  { id: 'README.md', label: 'README.md' },
];

const renderFileNode = (ctx: { item: TreeNode }): React.ReactElement => {
  const hasChildren = !!ctx.item.children?.length;
  return (
    <Inline gap="2" align="center">
      {hasChildren ? (
        <Folder size={14} aria-hidden="true" />
      ) : (
        <FileText size={14} aria-hidden="true" />
      )}
      <span>{ctx.item.label as React.ReactNode}</span>
    </Inline>
  );
};

const FAQ_ITEMS = [
  {
    value: 'shipping',
    q: 'How long does shipping take?',
    a: 'Orders placed before 2pm typically ship the same business day. Standard delivery is 3–5 business days.',
  },
  {
    value: 'returns',
    q: 'What is your returns policy?',
    a: 'Unworn items with the original packaging can be returned for up to 30 days after delivery.',
  },
  {
    value: 'warranty',
    q: 'Do your products come with a warranty?',
    a: 'Yes — every item ships with a 2-year manufacturer warranty.',
  },
];

const slides = [
  {
    id: 1,
    title: 'Designed for clarity',
    body: 'A carousel slide demonstrating the carousel primitive.',
  },
  {
    id: 2,
    title: 'Themed via tokens',
    body: 'Every slide inherits Cynosure colour and spacing tokens.',
  },
  {
    id: 3,
    title: 'Composable parts',
    body: 'Viewport, container, slides, navigation, and dot indicators.',
  },
  {
    id: 4,
    title: 'Accessible by default',
    body: 'Keyboard, ARIA, and reduced-motion support are built in.',
  },
];

const TS_SNIPPET = `interface Greeting {
  name: string;
  language?: 'en' | 'fr' | 'de';
}

export function greet({ name, language = 'en' }: Greeting): string {
  switch (language) {
    case 'fr':
      return \`Bonjour, \${name}!\`;
    case 'de':
      return \`Hallo, \${name}!\`;
    default:
      return \`Hello, \${name}!\`;
  }
}
`;

function CollapsibleDemo(): React.ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm">
          {open ? 'Hide details' : 'Show details'}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Stack gap="2" paddingTop="3">
          <Text>
            This content only renders while the Collapsible is open — perfect for revealing
            supplementary detail without cluttering the default view.
          </Text>
          <Text size="sm" color="fg.muted">
            State: <strong>{open ? 'open' : 'closed'}</strong>
          </Text>
        </Stack>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DataDisplayPlayground() {
  return (
    <Stack gap="4">
      <Grid columns={{ base: 1, md: 2 }} gap="4">
        <Card variant="outlined">
          <CardHeader>
            <Heading level={3} size="md">
              Card
            </Heading>
          </CardHeader>
          <CardBody>
            <Card variant="elevated">
              <CardImage
                src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=60"
                aspectRatio={16 / 9}
                alt="A forested valley at sunrise"
              />
              <CardHeader>
                <CardTitle>The long road back</CardTitle>
                <CardDescription>Issue 42 — Outdoor journal</CardDescription>
              </CardHeader>
              <CardBody>
                <Text>
                  After three years away, the familiar ridgeline felt taller, the switchbacks
                  steeper.
                </Text>
              </CardBody>
              <CardFooter>
                <Inline gap="3" align="center" justify="between">
                  <Text size="sm" color="fg.muted">
                    6 min read
                  </Text>
                  <Button variant="ghost" size="sm">
                    Read article
                  </Button>
                </Inline>
              </CardFooter>
            </Card>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={3} size="md">
              Stat
            </Heading>
          </CardHeader>
          <CardBody>
            <Grid columns={{ base: 1, sm: 3 }} gap="4">
              <Stat>
                <StatLabel>Revenue</StatLabel>
                <StatValue>$48,290</StatValue>
                <StatHelp>
                  <StatArrow direction="increase" /> 12.4%
                </StatHelp>
              </Stat>
              <Stat>
                <StatLabel>Active users</StatLabel>
                <StatValue>9,820</StatValue>
                <StatHelp>
                  <StatArrow direction="increase" /> 3.1%
                </StatHelp>
              </Stat>
              <Stat>
                <StatLabel>Churn</StatLabel>
                <StatValue>2.1%</StatValue>
                <StatHelp>
                  <StatArrow direction="decrease" /> 0.4%
                </StatHelp>
              </Stat>
            </Grid>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={3} size="md">
              LinearProgress
            </Heading>
          </CardHeader>
          <CardBody>
            <Stack gap="3">
              <LinearProgress value={30} showValue label="Indexing" />
              <LinearProgress value={68} colorScheme="success" showValue />
              <LinearProgress value={88} colorScheme="warning" showValue />
              <LinearProgress
                size="lg"
                segments={[
                  { value: 40, colorScheme: 'accent', label: 'Photos' },
                  { value: 25, colorScheme: 'warning', label: 'Videos' },
                  { value: 10, colorScheme: 'neutral', label: 'Other' },
                ]}
              />
              <LinearProgress indeterminate label="Loading files" />
            </Stack>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={3} size="md">
              CircularProgress
            </Heading>
          </CardHeader>
          <CardBody>
            <Inline gap="4" align="center" wrap>
              <CircularProgress value={25} />
              <CircularProgress value={50} colorScheme="warning" />
              <CircularProgress size="xl" value={72}>
                <Text size="sm" weight="bold">
                  72%
                </Text>
              </CircularProgress>
              <CircularProgress size="xl" value={100}>
                <Check size={20} strokeWidth={3} aria-hidden="true" />
              </CircularProgress>
              <CircularProgress indeterminate colorScheme="accent" />
            </Inline>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={3} size="md">
              Spinner
            </Heading>
          </CardHeader>
          <CardBody>
            <Stack gap="3">
              <Inline gap="4" align="center">
                <Spinner variant="border" size="lg" colorScheme="accent" />
                <Spinner variant="dots" size="lg" colorScheme="accent" />
                <Spinner variant="ring" size="lg" colorScheme="accent" />
              </Inline>
              <Inline gap="2" align="center">
                <Spinner size="sm" colorScheme="accent" />
                <Text>Loading your dashboard…</Text>
              </Inline>
            </Stack>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={3} size="md">
              Skeleton
            </Heading>
          </CardHeader>
          <CardBody>
            <Stack gap="3">
              <Inline gap="3" align="center">
                <Skeleton variant="circle" width={48} height={48} />
                <Stack gap="2">
                  <Skeleton width={160} height={12} />
                  <Skeleton width={120} height={10} />
                </Stack>
              </Inline>
              <Skeleton width="100%" height={12} />
              <Skeleton width="92%" height={12} />
              <Skeleton width="65%" height={12} />
              <Skeleton variant="rect" width="100%" height={80} />
            </Stack>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={3} size="md">
              Tree
            </Heading>
          </CardHeader>
          <CardBody>
            <Tree
              items={FILE_TREE}
              defaultExpandedIds={['src', 'src/components']}
              selectionMode="single"
              aria-label="Project files"
            >
              {renderFileNode}
            </Tree>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={3} size="md">
              Timeline
            </Heading>
          </CardHeader>
          <CardBody>
            <Timeline>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot
                    colorScheme="success"
                    icon={<GitCommit size={12} aria-hidden="true" />}
                  />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Text weight="semibold">v2.1.0 released</Text>
                  <Text size="sm" color="fg.muted">
                    12 minutes ago · feat(react/chart): SwiftChart themes
                  </Text>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot colorScheme="accent" icon={<Check size={12} aria-hidden="true" />} />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Text weight="semibold">Merged PR #48</Text>
                  <Text size="sm" color="fg.muted">
                    1 hour ago · swap recharts for swift-chart
                  </Text>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot
                    colorScheme="warning"
                    icon={<TriangleAlert size={12} aria-hidden="true" />}
                  />
                </TimelineSeparator>
                <TimelineContent>
                  <Text weight="semibold">CI flaky on macOS runners</Text>
                  <Text size="sm" color="fg.muted">
                    Yesterday · Retry passed on second attempt
                  </Text>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={3} size="md">
              Accordion
            </Heading>
          </CardHeader>
          <CardBody>
            <Accordion type="single" collapsible defaultValue="shipping">
              {FAQ_ITEMS.map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>
                    <Text>{item.a}</Text>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={3} size="md">
              Collapsible
            </Heading>
          </CardHeader>
          <CardBody>
            <CollapsibleDemo />
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={3} size="md">
              ScrollArea
            </Heading>
          </CardHeader>
          <CardBody>
            <ScrollArea height={220} scrollbars="vertical">
              <Stack gap="2" padding="3">
                {Array.from({ length: 24 }, (_, i) => (
                  <Inline key={`row-${i.toString()}`} gap="3" align="center">
                    <Text size="sm" weight="medium">
                      #{(i + 1).toString().padStart(2, '0')}
                    </Text>
                    <Text size="sm" color="fg.muted">
                      Entry in a vertically scrolling region.
                    </Text>
                  </Inline>
                ))}
              </Stack>
            </ScrollArea>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <Heading level={3} size="md">
              Carousel
            </Heading>
          </CardHeader>
          <CardBody>
            <Carousel slidesPerView={1} align="start" loop>
              <CarouselViewport>
                <CarouselContainer>
                  {slides.map((s) => (
                    <CarouselSlide key={s.id}>
                      <Card variant="filled">
                        <CardBody>
                          <Stack gap="2">
                            <Heading level={4} size="sm">
                              {s.title}
                            </Heading>
                            <Text color="fg.muted">{s.body}</Text>
                          </Stack>
                        </CardBody>
                      </Card>
                    </CarouselSlide>
                  ))}
                </CarouselContainer>
              </CarouselViewport>
              <CarouselPrevious />
              <CarouselNext />
              <CarouselDots />
            </Carousel>
          </CardBody>
        </Card>
      </Grid>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Table
          </Heading>
        </CardHeader>
        <CardBody>
          <Table variant="striped">
            <TableCaption>Recent invoices</TableCaption>
            <TableHead>
              <TableRow>
                <TableHeader>Invoice</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Method</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader align="end">Amount</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {INVOICES.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell>
                    <Badge colorScheme={invoiceStatusColor(row.status)} size="sm">
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell numeric>{currency(row.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFoot>
              <TableRow>
                <TableCell colSpan={4}>Total</TableCell>
                <TableCell numeric>
                  {currency(INVOICES.reduce((sum, r) => sum + r.amount, 0))}
                </TableCell>
              </TableRow>
            </TableFoot>
          </Table>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            DataTable
          </Heading>
        </CardHeader>
        <CardBody>
          <DataTable<User>
            data={USERS}
            columns={userColumns}
            sortable
            pagination={{ pageSize: 5 }}
          />
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Resizable
          </Heading>
        </CardHeader>
        <CardBody>
          <Resizable direction="horizontal" style={{ height: 240 }}>
            <ResizablePanel defaultSize={35} minSize={20} maxSize={60}>
              <Stack gap="2" padding="4" height="100%" background="bg.muted">
                <Heading level={4} size="xs">
                  Sidebar
                </Heading>
                <Text size="sm" color="fg.muted">
                  Drag the handle to resize this panel.
                </Text>
              </Stack>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65}>
              <Stack gap="2" padding="4" height="100%">
                <Heading level={4} size="xs">
                  Content
                </Heading>
                <Text size="sm" color="fg.muted">
                  The main content area takes the remaining width and re-flows as the handle moves.
                </Text>
              </Stack>
            </ResizablePanel>
          </Resizable>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            CodeBlock
          </Heading>
        </CardHeader>
        <CardBody>
          <CodeBlock language="tsx" filename="src/utils/greet.ts" showLineNumbers copyable>
            {TS_SNIPPET}
          </CodeBlock>
        </CardBody>
      </Card>
    </Stack>
  );
}
