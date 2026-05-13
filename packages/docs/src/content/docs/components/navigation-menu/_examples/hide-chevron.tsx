import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger hideChevron>More</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div style={{ padding: '0.75rem', minWidth: 200 }}>
              <NavigationMenuLink href="/changelog">Changelog</NavigationMenuLink>
              <NavigationMenuLink href="/blog">Blog</NavigationMenuLink>
              <NavigationMenuLink href="/support">Support</NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
