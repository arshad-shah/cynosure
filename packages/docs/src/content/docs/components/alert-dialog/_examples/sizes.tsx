import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@arshad-shah/cynosure-react';

const sizes = ['xs', 'sm', 'md', 'lg'] as const;

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      {sizes.map((size) => (
        <AlertDialog key={size}>
          <AlertDialogTrigger asChild>
            <Button variant="outline">{size}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent size={size}>
            <AlertDialogHeader>
              <AlertDialogTitle>Size: {size}</AlertDialogTitle>
              <AlertDialogDescription>
                AlertDialogContent uses size="{size}" to set its max-width.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="ghost">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button>OK</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </div>
  );
}
