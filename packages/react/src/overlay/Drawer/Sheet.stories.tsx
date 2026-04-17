import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../forms/Button/Button.js';
import { Input } from '../../forms/Input/Input.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './Drawer.js';

/**
 * `Sheet` is a naming alias for `Drawer` — the underlying component is the
 * same. The Sheet vocabulary is common on mobile-first surfaces.
 */
const meta: Meta<typeof Sheet> = {
  title: 'Overlays/Sheet',
  component: Sheet,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Sheet>;

export const AliasedToDrawer: Story = {
  name: 'Sheet === Drawer',
  render: () => (
    <Stack gap="3">
      <Text size="sm" color="fg.muted">
        The <code>Sheet*</code> exports re-export the <code>Drawer*</code> components — use
        whichever vocabulary fits the context.
      </Text>
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open filters</Button>
        </SheetTrigger>
        <SheetContent side="right" size="md">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine the results below.</SheetDescription>
          </SheetHeader>
          <Stack gap="3" paddingX="5" paddingBottom="3">
            <Stack gap="1">
              <Text as="label" size="sm" weight="medium">
                Search
              </Text>
              <Input placeholder="Search by name…" />
            </Stack>
            <Stack gap="1">
              <Text as="label" size="sm" weight="medium">
                Owner
              </Text>
              <Input placeholder="@someone" />
            </Stack>
          </Stack>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="ghost">Reset</Button>
            </SheetClose>
            <SheetClose asChild>
              <Button>Apply filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Stack>
  ),
};
