import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Grid,
  Heading,
  Inline,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  Toaster,
  Tooltip,
  toast,
} from '@arshad-shah/cynosure-react';

export function OverlaysPlayground() {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap="4">
      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Dialog
          </Heading>
        </CardHeader>
        <CardBody>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm action</DialogTitle>
                <DialogDescription>
                  Dialogs in Cynosure trap focus, restore it on close, and lock background
                  scrolling.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost">Cancel</Button>
                <Button>Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Popover
          </Heading>
        </CardHeader>
        <CardBody>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <Text>Popovers anchor against their trigger and follow it on scroll.</Text>
            </PopoverContent>
          </Popover>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Tooltip
          </Heading>
        </CardHeader>
        <CardBody>
          <Tooltip content="Saves to your draft folder.">
            <Button variant="outline">Hover me</Button>
          </Tooltip>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Toast
          </Heading>
        </CardHeader>
        <CardBody>
          <Inline align="center" gap="3">
            <Button onClick={() => toast('Saved your changes.')}>Default</Button>
            <Button colorScheme="danger" onClick={() => toast.error('Could not save.')}>
              Error
            </Button>
            <Button onClick={() => toast.success('All set!')}>Success</Button>
          </Inline>
        </CardBody>
      </Card>
      <Toaster />
    </Grid>
  );
}
