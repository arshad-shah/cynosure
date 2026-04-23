import { Card, CardBody, CardDescription, CardTitle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Card style={{ maxWidth: '24rem' }}>
      <CardBody>
        <CardTitle>Getting started</CardTitle>
        <CardDescription>
          A basic card with a title and description inside the body.
        </CardDescription>
      </CardBody>
    </Card>
  );
}
