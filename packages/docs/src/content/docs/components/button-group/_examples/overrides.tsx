import { Button, ButtonGroup } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <ButtonGroup variant="soft" colorScheme="neutral" aria-label="Inheritance demo">
      <Button>Inherits soft/neutral</Button>
      <Button colorScheme="success">Overrides color</Button>
      <Button variant="outline" colorScheme="danger">
        Overrides both
      </Button>
    </ButtonGroup>
  );
}
