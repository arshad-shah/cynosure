import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Tabs defaultValue="profile" orientation="vertical">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsIndicator />
      </TabsList>
      <TabsContent value="profile">
        <p>Manage your public profile information.</p>
      </TabsContent>
      <TabsContent value="security">
        <p>Update your password and two-factor authentication settings.</p>
      </TabsContent>
      <TabsContent value="notifications">
        <p>Choose what notifications you receive and how.</p>
      </TabsContent>
    </Tabs>
  );
}
