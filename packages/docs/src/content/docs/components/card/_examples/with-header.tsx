import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Card style={{ maxWidth: '24rem' }}>
      <CardHeader>
        <CardTitle>Project overview</CardTitle>
        <CardDescription>Last updated 2 hours ago</CardDescription>
      </CardHeader>
      <CardBody>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          This card uses separate header, body, and footer sections for a structured layout.
        </p>
      </CardBody>
      <CardFooter style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm">
          Cancel
        </Button>
        <Button variant="solid" size="sm">
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
