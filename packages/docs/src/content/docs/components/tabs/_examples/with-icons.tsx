import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from '@arshad-shah/cynosure-react';
import { BarChart3Icon, HomeIcon, SettingsIcon } from 'lucide-react';

export default function Example() {
  return (
    <Tabs defaultValue="home">
      <TabsList>
        <TabsTrigger value="home">
          <HomeIcon size={14} />
          Home
        </TabsTrigger>
        <TabsTrigger value="analytics">
          <BarChart3Icon size={14} />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="settings">
          <SettingsIcon size={14} />
          Settings
        </TabsTrigger>
        <TabsIndicator />
      </TabsList>
      <TabsContent value="home">
        <p>Welcome home! Here is your dashboard summary.</p>
      </TabsContent>
      <TabsContent value="analytics">
        <p>View your performance metrics and trends.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p>Configure your preferences and integrations.</p>
      </TabsContent>
    </Tabs>
  );
}
