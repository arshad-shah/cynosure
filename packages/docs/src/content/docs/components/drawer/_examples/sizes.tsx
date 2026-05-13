import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@arshad-shah/cynosure-react';

const sizes = ['sm', 'md', 'lg', 'xl'] as const;

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      {sizes.map((size) => (
        <Drawer key={size}>
          <DrawerTrigger asChild>
            <Button variant="outline">Size {size}</Button>
          </DrawerTrigger>
          <DrawerContent side="right" size={size}>
            <DrawerHeader>
              <DrawerTitle>size="{size}"</DrawerTitle>
              <DrawerDescription>
                For horizontal sides, size controls the panel width.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="ghost">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}
