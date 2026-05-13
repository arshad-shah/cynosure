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

export default function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Open at top</Button>
      </AlertDialogTrigger>
      <AlertDialogContent position="top">
        <AlertDialogHeader>
          <AlertDialogTitle>Pinned near the top</AlertDialogTitle>
          <AlertDialogDescription>
            Useful on long pages where the user may have scrolled far from the trigger.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Dismiss</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button>Acknowledge</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
