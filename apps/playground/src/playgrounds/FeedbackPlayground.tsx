import {
  Alert,
  AlertDescription,
  AlertTitle,
  Banner,
  Callout,
  CalloutContent,
  CalloutTitle,
} from '@arshad-shah/cynosure-react';

export function FeedbackPlayground() {
  return (
    <div className="pg-stack">
      <div className="pg-card">
        <h3 className="pg-card-title">Alerts</h3>
        <div className="pg-stack">
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
        </div>
      </div>

      <div className="pg-card">
        <h3 className="pg-card-title">Banner</h3>
        <Banner status="info">A new version of the docs is available — refresh to load.</Banner>
      </div>

      <div className="pg-card">
        <h3 className="pg-card-title">Callouts</h3>
        <div className="pg-stack">
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
        </div>
      </div>
    </div>
  );
}
