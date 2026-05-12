import {
  Avatar,
  Badge,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Grid,
  Heading,
  Inline,
  Stack,
  Stat,
  StatHelp,
  StatLabel,
  StatValue,
  Tag,
  Text,
} from '@arshad-shah/cynosure-react';

const people = [
  { name: 'Aria Patel', role: 'Engineer' },
  { name: 'Bram Holt', role: 'Designer' },
  { name: 'Chen Liu', role: 'PM' },
];

export function DataDisplayPlayground() {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap="4">
      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Stats
          </Heading>
        </CardHeader>
        <CardBody>
          <Inline align="center" gap="3">
            <Stat>
              <StatLabel>Active users</StatLabel>
              <StatValue>12,438</StatValue>
              <StatHelp>+8.4% week over week</StatHelp>
            </Stat>
            <Stat>
              <StatLabel>Revenue</StatLabel>
              <StatValue>$84.2k</StatValue>
              <StatHelp>+12% MoM</StatHelp>
            </Stat>
            <Stat>
              <StatLabel>Churn</StatLabel>
              <StatValue>1.2%</StatValue>
              <StatHelp>-0.3pp</StatHelp>
            </Stat>
          </Inline>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Card
          </Heading>
        </CardHeader>
        <CardBody>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Quarterly review</CardTitle>
              <CardDescription>
                Cards compose freely. Switch the variant prop for elevated, filled, or ghost.
              </CardDescription>
            </CardHeader>
          </Card>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Badges &amp; tags
          </Heading>
        </CardHeader>
        <CardBody>
          <Inline align="center" gap="3">
            <Badge>Default</Badge>
            <Badge colorScheme="success">Success</Badge>
            <Badge colorScheme="danger">Danger</Badge>
            <Tag>Frontend</Tag>
            <Tag colorScheme="warning">Needs review</Tag>
          </Inline>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Avatars
          </Heading>
        </CardHeader>
        <CardBody>
          <Inline align="center" gap="3">
            {people.map((p) => (
              <Inline key={p.name} align="center" gap="2">
                <Avatar name={p.name} />
                <Stack gap="0">
                  <Text weight="medium">{p.name}</Text>
                  <Text size="sm" color="fg.muted">
                    {p.role}
                  </Text>
                </Stack>
              </Inline>
            ))}
          </Inline>
        </CardBody>
      </Card>
    </Grid>
  );
}
