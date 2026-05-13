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
          <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '220px 220px',
                gap: '0.75rem',
                padding: '1rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>For teams</div>
                <NavigationMenuLink href="/teams/design">Design systems</NavigationMenuLink>
                <NavigationMenuLink href="/teams/engineering">Engineering</NavigationMenuLink>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>For individuals</div>
                <NavigationMenuLink href="/individuals/freelance">Freelancers</NavigationMenuLink>
                <NavigationMenuLink href="/individuals/students">Students</NavigationMenuLink>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
