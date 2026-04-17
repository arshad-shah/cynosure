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
  Chip,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Notification,
  Tag,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from '@lumen/react';
import { Demo, DemoCol, SectionHeader } from './common';

export function FeedbackSection() {
  return (
    <>
      <SectionHeader
        title="Feedback"
        description="Status, identity, and inline informational components."
      />
      <div className="showcase-grid">
        <Demo title="Badge">
          <Badge>Default</Badge>
          <Badge colorScheme="success">Live</Badge>
          <Badge colorScheme="danger" variant="soft">
            Error
          </Badge>
        </Demo>

        <Demo title="Tag">
          <Tag>design</Tag>
          <Tag colorScheme="accent">react</Tag>
          <Tag variant="outline">beta</Tag>
        </Demo>

        <Demo title="Chip">
          <Chip>Filter</Chip>
          <Chip colorScheme="accent">Selected</Chip>
          <Chip variant="outline">Tag</Chip>
        </Demo>

        <Demo title="Avatar">
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" colorScheme="violet" />
          <Avatar name="Alan Turing" status="online" />
        </Demo>

        <Demo title="AvatarGroup">
          <AvatarGroup max={3}>
            <Avatar name="Ada" />
            <Avatar name="Grace" />
            <Avatar name="Alan" />
            <Avatar name="Linus" />
            <Avatar name="Margaret" />
          </AvatarGroup>
        </Demo>

        <DemoCol title="Alert · info">
          <Alert status="info">
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>You can preview changes before publishing.</AlertDescription>
          </Alert>
        </DemoCol>

        <DemoCol title="Alert · danger">
          <Alert status="danger">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>Please try again in a moment.</AlertDescription>
          </Alert>
        </DemoCol>

        <DemoCol title="Banner">
          <Banner status="warning">
            <BannerContent>Scheduled maintenance Friday at 10pm UTC.</BannerContent>
            <BannerActions>
              <Button size="sm" variant="ghost">
                Dismiss
              </Button>
            </BannerActions>
          </Banner>
        </DemoCol>

        <DemoCol title="Notification">
          <Notification title="New message" description="Ada sent you a reply." />
        </DemoCol>

        <DemoCol title="Callout">
          <Callout colorScheme="accent">
            <CalloutTitle>Note</CalloutTitle>
            <CalloutContent>Callouts draw attention to inline context.</CalloutContent>
          </Callout>
        </DemoCol>

        <DemoCol title="EmptyState">
          <EmptyState>
            <EmptyStateIcon>📭</EmptyStateIcon>
            <EmptyStateTitle>Nothing here yet</EmptyStateTitle>
            <EmptyStateDescription>Create your first project to get started.</EmptyStateDescription>
            <EmptyStateActions>
              <Button>New project</Button>
            </EmptyStateActions>
          </EmptyState>
        </DemoCol>

        <Demo title="Toggle">
          <Toggle aria-label="Bold">B</Toggle>
          <Toggle aria-label="Italic" defaultPressed>
            I
          </Toggle>
        </Demo>

        <Demo title="ToggleGroup">
          <ToggleGroup type="single" defaultValue="left">
            <ToggleGroupItem value="left" aria-label="Left">
              ⬅
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Center">
              ⬌
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Right">
              ➡
            </ToggleGroupItem>
          </ToggleGroup>
        </Demo>
      </div>
    </>
  );
}
