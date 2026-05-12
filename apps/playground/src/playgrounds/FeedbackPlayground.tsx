import {
  Alert,
  AlertDescription,
  AlertTitle,
  Banner,
  Callout,
  CalloutContent,
  CalloutTitle,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
} from '@arshad-shah/cynosure-react';

export function FeedbackPlayground() {
  return (
    <Stack gap="3">
      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Alerts
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Alert status="info">
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>The build pipeline finished in 1m 42s.</AlertDescription>
            </Alert>
            <Alert status="success">
              <AlertTitle>Deployed</AlertTitle>
              <AlertDescription>v2.1.0 is live in production.</AlertDescription>
            </Alert>
            <Alert status="warning">
              <AlertTitle>Quota approaching</AlertTitle>
              <AlertDescription>You're at 88% of your monthly limit.</AlertDescription>
            </Alert>
            <Alert status="danger">
              <AlertTitle>Build failed</AlertTitle>
              <AlertDescription>Type errors found in 3 files.</AlertDescription>
            </Alert>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Banner
          </Heading>
        </CardHeader>
        <CardBody>
          <Banner status="info">A new version of the docs is available — refresh to load.</Banner>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Callouts
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Callout colorScheme="accent">
              <CalloutTitle>Tip</CalloutTitle>
              <CalloutContent>
                Cynosure callouts pair well with Markdown content for inline asides.
              </CalloutContent>
            </Callout>
            <Callout colorScheme="warning">
              <CalloutTitle>Heads up</CalloutTitle>
              <CalloutContent>This API is in preview and may change before v2.</CalloutContent>
            </Callout>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
