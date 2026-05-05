import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Toaster,
  Tooltip,
  TooltipProvider,
  toast,
} from '@arshad-shah/cynosure-react';

export function OverlaysPlayground() {
  return (
    <TooltipProvider>
      <div className="pg-grid-2">
        <div className="pg-card">
          <h3 className="pg-card-title">Dialog</h3>
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
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Popover</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p style={{ margin: 0 }}>
                Popovers anchor against their trigger and follow it on scroll.
              </p>
            </PopoverContent>
          </Popover>
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Tooltip</h3>
          <Tooltip content="Saves to your draft folder.">
            <Button variant="outline">Hover me</Button>
          </Tooltip>
        </div>

        <div className="pg-card">
          <h3 className="pg-card-title">Toast</h3>
          <div className="pg-row">
            <Button onClick={() => toast('Saved your changes.')}>Default</Button>
            <Button colorScheme="danger" onClick={() => toast.error('Could not save.')}>
              Error
            </Button>
            <Button onClick={() => toast.success('All set!')}>Success</Button>
          </div>
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
