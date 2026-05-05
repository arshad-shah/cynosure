import {
  Avatar,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatHelp,
  StatLabel,
  StatValue,
  Tag,
} from '@arshad-shah/cynosure-react';

const people = [
  { name: 'Aria Patel', role: 'Engineer' },
  { name: 'Bram Holt', role: 'Designer' },
  { name: 'Chen Liu', role: 'PM' },
];

export function DataDisplayPlayground() {
  return (
    <div className="pg-grid-2">
      <div className="pg-card">
        <h3 className="pg-card-title">Stats</h3>
        <div className="pg-row">
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
        </div>
      </div>

      <div className="pg-card">
        <h3 className="pg-card-title">Card</h3>
        <Card variant="outlined">
          <CardHeader>
            <strong>Quarterly review</strong>
          </CardHeader>
          <CardBody>
            <p style={{ margin: 0 }}>
              Cards compose freely with any inner layout. Switch the variant prop for `elevated`,
              `filled`, or `ghost`.
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="pg-card">
        <h3 className="pg-card-title">Badges &amp; tags</h3>
        <div className="pg-row">
          <Badge>Default</Badge>
          <Badge colorScheme="success">Success</Badge>
          <Badge colorScheme="danger">Danger</Badge>
          <Tag>Frontend</Tag>
          <Tag colorScheme="warning">Needs review</Tag>
        </div>
      </div>

      <div className="pg-card">
        <h3 className="pg-card-title">Avatars</h3>
        <div className="pg-row">
          {people.map((p) => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar name={p.name} />
              <div>
                <div style={{ fontWeight: 500 }}>{p.name}</div>
                <div style={{ color: 'var(--cynosure-color-foreground-muted)', fontSize: 12 }}>
                  {p.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
