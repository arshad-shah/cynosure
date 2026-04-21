import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsIndicator />
      </TabsList>
      <TabsContent value="overview">
        <p>Your project overview and summary will appear here.</p>
      </TabsContent>
      <TabsContent value="analytics">
        <p>Analytics data and charts will appear here.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p>Project settings and configuration will appear here.</p>
      </TabsContent>
    </Tabs>
  );
}
