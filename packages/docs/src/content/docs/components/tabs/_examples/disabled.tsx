import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="archived" disabled>
          Archived
        </TabsTrigger>
        <TabsIndicator />
      </TabsList>
      <TabsContent value="active">
        <p>These are your active items.</p>
      </TabsContent>
      <TabsContent value="pending">
        <p>These items are awaiting approval.</p>
      </TabsContent>
      <TabsContent value="archived">
        <p>Archived items are read-only.</p>
      </TabsContent>
    </Tabs>
  );
}
