import { Button, ButtonGroup } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <ButtonGroup aria-label="Document actions">
      <Button>Copy</Button>
      <Button>Paste</Button>
      <Button>Cut</Button>
    </ButtonGroup>
  );
}
