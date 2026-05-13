import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarGroup,
  Badge,
  Banner,
  BannerActions,
  BannerContent,
  Button,
  Callout,
  CalloutContent,
  CalloutTitle,
  Card,
  CardBody,
  CardHeader,
  Chip,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Heading,
  Indicator,
  Inline,
  Notification,
  Stack,
  Tag,
  Text,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from '@arshad-shah/cynosure-react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bell,
  Bold,
  CheckCircle2,
  Inbox,
  Italic,
  MessageSquare,
  Sparkles,
  Star,
  Underline,
} from 'lucide-react';
import { useState } from 'react';

const FEEDBACK_SCHEMES = ['accent', 'neutral', 'success', 'warning', 'danger', 'info'] as const;
const FEEDBACK_VARIANTS = ['solid', 'soft', 'outline', 'ghost'] as const;
const STATUSES = ['info', 'success', 'warning', 'danger'] as const;

const TEAM = [
  'Ada Lovelace',
  'Grace Hopper',
  'Barbara Liskov',
  'Katherine Johnson',
  'Margaret Hamilton',
  'Alan Turing',
  'Donald Knuth',
];

function ChipFilters(): React.ReactElement {
  const filters = ['design', 'engineering', 'marketing', 'sales', 'ops'] as const;
  const [selected, setSelected] = useState<Set<(typeof filters)[number]>>(
    new Set(['engineering', 'design']),
  );
  return (
    <Inline gap="2">
      {filters.map((f) => {
        const isSelected = selected.has(f);
        return (
          <Chip
            key={f}
            selected={isSelected}
            colorScheme="accent"
            variant={isSelected ? 'solid' : 'soft'}
            onSelectedChange={(next) => {
              setSelected((prev) => {
                const out = new Set(prev);
                if (next) out.add(f);
                else out.delete(f);
                return out;
              });
            }}
          >
            {f}
          </Chip>
        );
      })}
    </Inline>
  );
}

function RemovableTags(): React.ReactElement {
  const [tags, setTags] = useState(['react', 'typescript', 'vanilla-extract', 'design-systems']);
  return (
    <Inline gap="2">
      {tags.map((t) => (
        <Tag
          key={t}
          colorScheme="neutral"
          onRemove={() => setTags((p) => p.filter((x) => x !== t))}
        >
          {t}
        </Tag>
      ))}
      {tags.length === 0 ? (
        <Text size="sm" color="fg.muted">
          All cleared.
        </Text>
      ) : null}
    </Inline>
  );
}

function FormattingToolbar(): React.ReactElement {
  const [marks, setMarks] = useState<string[]>(['bold']);
  const [align, setAlign] = useState<string>('left');
  return (
    <Stack gap="3">
      <ToggleGroup type="multiple" value={marks} onValueChange={setMarks} variant="outline">
        <ToggleGroupItem value="bold" aria-label="Bold">
          <Bold size={14} />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <Italic size={14} />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <Underline size={14} />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="single"
        value={align}
        onValueChange={(v) => v && setAlign(v)}
        variant="outline"
        attached
      >
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft size={14} />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter size={14} />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight size={14} />
        </ToggleGroupItem>
        <ToggleGroupItem value="justify" aria-label="Justify">
          <AlignJustify size={14} />
        </ToggleGroupItem>
      </ToggleGroup>
    </Stack>
  );
}

function FavoriteToggle(): React.ReactElement {
  const [pressed, setPressed] = useState(true);
  return (
    <Inline gap="3">
      <Toggle pressed={pressed} onPressedChange={setPressed} aria-label="Toggle favorite">
        <Star size={14} />
      </Toggle>
      <Toggle defaultPressed variant="outline" aria-label="Toggle favorite outline">
        <Star size={14} />
      </Toggle>
      <Toggle variant="solid" aria-label="Toggle favorite solid">
        <Star size={14} />
      </Toggle>
      <Toggle disabled aria-label="Disabled">
        <Star size={14} />
      </Toggle>
    </Inline>
  );
}

function DismissibleBanner(): React.ReactElement {
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <Inline gap="2" align="center">
        <Text size="sm" color="fg.muted">
          Banner dismissed.
        </Text>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Bring it back
        </Button>
      </Inline>
    );
  }
  return (
    <Banner status="warning" closable onClose={() => setOpen(false)}>
      <BannerContent>
        <Text weight="semibold">Your free trial ends in 3 days</Text>
        <Text size="sm">Upgrade now to keep advanced features.</Text>
      </BannerContent>
      <BannerActions>
        <Button size="sm" variant="ghost">
          Later
        </Button>
        <Button size="sm" colorScheme="warning">
          Upgrade
        </Button>
      </BannerActions>
    </Banner>
  );
}

export function FeedbackPlayground(): React.ReactElement {
  return (
    <Stack gap="3">
      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Badge
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            {FEEDBACK_VARIANTS.map((variant) => (
              <Inline key={variant} gap="3" align="center">
                <Text size="sm" color="fg.muted">
                  {variant}
                </Text>
                {FEEDBACK_SCHEMES.map((scheme) => (
                  <Badge key={scheme} variant={variant} colorScheme={scheme}>
                    {scheme}
                  </Badge>
                ))}
              </Inline>
            ))}
            <Inline gap="3" align="center">
              <Badge size="xs">xs</Badge>
              <Badge size="sm">sm</Badge>
              <Badge size="md">md</Badge>
              <Badge shape="pill" colorScheme="accent">
                pill
              </Badge>
              <Badge shape="square" colorScheme="info">
                square
              </Badge>
            </Inline>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Tag
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Inline gap="2">
              <Tag>design</Tag>
              <Tag colorScheme="accent">engineering</Tag>
              <Tag colorScheme="success">shipped</Tag>
              <Tag colorScheme="warning">WIP</Tag>
              <Tag colorScheme="danger">blocked</Tag>
              <Tag colorScheme="info">info</Tag>
            </Inline>
            <RemovableTags />
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Chip
          </Heading>
        </CardHeader>
        <CardBody>
          <ChipFilters />
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Avatar
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Inline gap="3" align="center">
              <Avatar name="Ada Lovelace" size="xs" />
              <Avatar name="Ada Lovelace" size="sm" />
              <Avatar name="Ada Lovelace" size="md" />
              <Avatar name="Ada Lovelace" size="lg" />
              <Avatar name="Ada Lovelace" size="xl" />
              <Avatar name="Ada Lovelace" size="2xl" />
            </Inline>
            <Inline gap="3" align="center">
              <Avatar name="Grace Hopper" status="online" size="lg" />
              <Avatar name="Barbara Liskov" status="away" size="lg" />
              <Avatar name="Alan Turing" status="busy" size="lg" />
              <Avatar name="Katherine Johnson" status="offline" size="lg" />
              <Avatar name="Margaret Hamilton" shape="rounded" size="lg" />
              <Avatar name="Donald Knuth" shape="square" size="lg" />
            </Inline>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            AvatarGroup
          </Heading>
        </CardHeader>
        <CardBody>
          <Inline gap="3" align="center">
            <AvatarGroup max={4}>
              {TEAM.map((name) => (
                <Avatar key={name} name={name} />
              ))}
            </AvatarGroup>
            <Text size="sm" color="fg.muted">
              {TEAM.length} reviewers
            </Text>
          </Inline>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Alert
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            {STATUSES.map((status) => (
              <Alert key={status} status={status}>
                <AlertTitle>{status[0]?.toUpperCase() + status.slice(1)}</AlertTitle>
                <AlertDescription>
                  This is a {status} alert demonstrating the soft variant.
                </AlertDescription>
              </Alert>
            ))}
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
          <Stack gap="3">
            <Banner status="info">
              <BannerContent>
                <Text weight="semibold">We have updated our terms of service</Text>
                <Text size="sm">Please review the changes by August 30.</Text>
              </BannerContent>
            </Banner>
            <DismissibleBanner />
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Notification
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Notification
              unread
              icon={<Bell size={16} />}
              title="You have a new mention"
              description="Alan Turing mentioned you in #engineering."
              timestamp="just now"
            />
            <Notification
              icon={<CheckCircle2 size={16} />}
              title="Deployment succeeded"
              description="Your build of main was deployed to production."
              timestamp="3h ago"
            />
            <Notification
              unread
              icon={<MessageSquare size={16} />}
              title="Ada requested your review"
              description='"feat(feedback): polish Toggle styles"'
              timestamp="5m ago"
              actions={
                <Inline gap="2">
                  <Button size="sm">Review</Button>
                  <Button size="sm" variant="ghost">
                    Snooze
                  </Button>
                </Inline>
              }
            />
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Callout
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Callout colorScheme="accent">
              <CalloutTitle>Tip</CalloutTitle>
              <CalloutContent>
                <Text size="sm">
                  Cynosure callouts pair well with Markdown content for inline asides.
                </Text>
              </CalloutContent>
            </Callout>
            <Callout colorScheme="success">
              <CalloutTitle>Shipped</CalloutTitle>
              <CalloutContent>
                <Text size="sm">v2.1 of the feedback module is live.</Text>
              </CalloutContent>
            </Callout>
            <Callout colorScheme="warning">
              <CalloutTitle>Preview API</CalloutTitle>
              <CalloutContent>
                <Text size="sm">This surface may change before v2.</Text>
              </CalloutContent>
            </Callout>
            <Callout colorScheme="danger" variant="outline">
              <CalloutTitle>Deprecated</CalloutTitle>
              <CalloutContent>
                <Text size="sm">Use Alert for actionable surfaces.</Text>
              </CalloutContent>
            </Callout>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            EmptyState
          </Heading>
        </CardHeader>
        <CardBody>
          <EmptyState>
            <EmptyStateIcon>
              <Inbox />
            </EmptyStateIcon>
            <EmptyStateTitle>Inbox zero</EmptyStateTitle>
            <EmptyStateDescription>
              You are all caught up. New notifications will appear here.
            </EmptyStateDescription>
            <EmptyStateActions>
              <Button>
                <Inline gap="2" align="center">
                  <Sparkles size={14} />
                  <span>Start something new</span>
                </Inline>
              </Button>
            </EmptyStateActions>
          </EmptyState>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Toggle
          </Heading>
        </CardHeader>
        <CardBody>
          <FavoriteToggle />
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            ToggleGroup
          </Heading>
        </CardHeader>
        <CardBody>
          <FormattingToolbar />
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Indicator
          </Heading>
        </CardHeader>
        <CardBody>
          <Inline gap="6" align="center">
            <Indicator content="3" colorScheme="danger">
              <Button variant="outline" aria-label="Notifications">
                <Bell size={16} />
              </Button>
            </Indicator>
            <Indicator dot colorScheme="success" aria-label="Online">
              <Avatar name="Ada Lovelace" size="lg" />
            </Indicator>
            <Indicator content="99+" colorScheme="accent">
              <Button variant="outline" aria-label="Inbox">
                <Inbox size={16} />
              </Button>
            </Indicator>
          </Inline>
        </CardBody>
      </Card>
    </Stack>
  );
}
