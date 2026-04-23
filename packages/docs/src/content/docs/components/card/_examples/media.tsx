import { Card, CardBody, CardDescription, CardMedia, CardTitle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Card style={{ maxWidth: '24rem', overflow: 'hidden' }}>
      <CardMedia
        aspectRatio="16/9"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="1.5" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="white" />
          <path
            d="M21 15l-5-5L5 21"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </CardMedia>
      <CardBody>
        <CardTitle>Media card</CardTitle>
        <CardDescription>
          Use CardMedia to wrap any arbitrary media content — images, video, or coloured
          placeholders.
        </CardDescription>
      </CardBody>
    </Card>
  );
}
