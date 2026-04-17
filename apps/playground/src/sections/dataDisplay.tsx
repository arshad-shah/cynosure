import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DataTable,
  Progress,
  ProgressCircle,
  Resizable,
  ResizableHandle,
  ResizablePanel,
  ScrollArea,
  Skeleton,
  Spinner,
  Stat,
  StatArrow,
  StatHelp,
  StatLabel,
  StatValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  Tree,
} from '@lumen/react';
import type { ColumnDef, TreeNode } from '@lumen/react';
import { Demo, DemoCol, SectionHeader } from './common';

interface Person {
  id: string;
  name: string;
  role: string;
  status: string;
}

const people: Person[] = [
  { id: '1', name: 'Ada Lovelace', role: 'Engineer', status: 'Active' },
  { id: '2', name: 'Grace Hopper', role: 'Admiral', status: 'Active' },
  { id: '3', name: 'Alan Turing', role: 'Cryptographer', status: 'Active' },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

const tree: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'components', label: 'components', children: [{ id: 'button', label: 'Button.tsx' }] },
      { id: 'hooks', label: 'hooks' },
      { id: 'index', label: 'index.ts' },
    ],
  },
  { id: 'package', label: 'package.json' },
];

export function DataDisplaySection() {
  return (
    <>
      <SectionHeader
        title="Data display"
        description="Containers, tables, trees, stats, and progress."
      />
      <div className="showcase-grid">
        <DemoCol title="Card">
          <Card>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Supporting copy goes here.</CardDescription>
            </CardHeader>
            <CardBody>Body content.</CardBody>
            <CardFooter>Footer</CardFooter>
          </Card>
        </DemoCol>

        <DemoCol title="Accordion">
          <Accordion type="single" collapsible defaultValue="a">
            <AccordionItem value="a">
              <AccordionTrigger>First</AccordionTrigger>
              <AccordionContent>First panel body.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Second</AccordionTrigger>
              <AccordionContent>Second panel body.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </DemoCol>

        <DemoCol title="Collapsible">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <button type="button">Toggle details</button>
            </CollapsibleTrigger>
            <CollapsibleContent>Hidden content revealed on click.</CollapsibleContent>
          </Collapsible>
        </DemoCol>

        <DemoCol title="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DemoCol>

        <DemoCol title="DataTable">
          <DataTable data={people} columns={columns} sortable />
        </DemoCol>

        <DemoCol title="Tree">
          <Tree items={tree} defaultExpandedIds={['src']} />
        </DemoCol>

        <DemoCol title="Timeline">
          <Timeline>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot colorScheme="success" />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <strong>Created</strong>
                <div>Just now</div>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
              </TimelineSeparator>
              <TimelineContent>
                <strong>Updated</strong>
                <div>2 min ago</div>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </DemoCol>

        <DemoCol title="Stat">
          <Stat>
            <StatLabel>Active users</StatLabel>
            <StatValue>12,480</StatValue>
            <StatHelp>
              <StatArrow direction="up" /> 23% vs last week
            </StatHelp>
          </Stat>
        </DemoCol>

        <DemoCol title="Progress">
          <Progress value={65} />
          <ProgressCircle value={65} />
        </DemoCol>

        <DemoCol title="Skeleton">
          <Skeleton style={{ height: '1rem', width: '80%' }} />
          <Skeleton style={{ height: '1rem', width: '60%' }} />
          <Skeleton style={{ height: '1rem', width: '70%' }} />
        </DemoCol>

        <Demo title="Spinner">
          <Spinner />
          <Spinner size="lg" />
        </Demo>

        <DemoCol title="ScrollArea">
          <ScrollArea style={{ height: '8rem', width: '100%' }}>
            <div style={{ padding: '0.5rem' }}>
              {Array.from({ length: 20 }, (_, i) => `row-${i}`).map((id, i) => (
                <div key={id}>Row {i + 1}</div>
              ))}
            </div>
          </ScrollArea>
        </DemoCol>

        <DemoCol title="Resizable">
          <Resizable
            direction="horizontal"
            style={{
              height: '6rem',
              width: '100%',
              border: '1px solid var(--lumen-color-border-default)',
              borderRadius: 'var(--lumen-radius-component-md)',
            }}
          >
            <ResizablePanel defaultSize={40}>
              <div style={{ padding: '0.5rem' }}>Left</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={60}>
              <div style={{ padding: '0.5rem' }}>Right</div>
            </ResizablePanel>
          </Resizable>
        </DemoCol>
      </div>
    </>
  );
}
