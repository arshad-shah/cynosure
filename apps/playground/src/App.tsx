import {
  Box,
  Container,
  Divider,
  Flex,
  Heading,
  IconButton,
  Inline,
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
  SidebarTrigger,
  Stack,
  Text,
  useColorScheme,
  useSidebar,
  useTheme,
} from '@arshad-shah/cynosure-react';
import {
  BarChart3,
  Bell,
  Compass,
  Layers,
  Moon,
  Pilcrow,
  Sun,
  Table as TableIcon,
  TextCursorInput,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { ChartsPlayground } from './playgrounds/ChartsPlayground.js';
import { DataDisplayPlayground } from './playgrounds/DataDisplayPlayground.js';
import { FeedbackPlayground } from './playgrounds/FeedbackPlayground.js';
import { FormsPlayground } from './playgrounds/FormsPlayground.js';
import { NavigationPlayground } from './playgrounds/NavigationPlayground.js';
import { OverlaysPlayground } from './playgrounds/OverlaysPlayground.js';
import { TypographyPlayground } from './playgrounds/TypographyPlayground.js';

interface PlaygroundEntry {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  render: () => ReactNode;
}

const PLAYGROUNDS: PlaygroundEntry[] = [
  {
    id: 'charts',
    label: 'Charts',
    description:
      'SwiftChart-powered chart wrappers. Resize the window to see the responsive Canvas reflow without a re-render.',
    icon: <BarChart3 size={18} aria-hidden />,
    render: () => <ChartsPlayground />,
  },
  {
    id: 'forms',
    label: 'Forms',
    description: 'Inputs, selects, sliders, and other interactive form primitives.',
    icon: <TextCursorInput size={18} aria-hidden />,
    render: () => <FormsPlayground />,
  },
  {
    id: 'overlays',
    label: 'Overlays',
    description: 'Dialog, drawer, popover, dropdown, tooltip — every floating surface.',
    icon: <Layers size={18} aria-hidden />,
    render: () => <OverlaysPlayground />,
  },
  {
    id: 'data-display',
    label: 'Data display',
    description: 'Cards, tables, badges, avatars, progress, and the rest of the static surfaces.',
    icon: <TableIcon size={18} aria-hidden />,
    render: () => <DataDisplayPlayground />,
  },
  {
    id: 'feedback',
    label: 'Feedback',
    description: 'Alerts, banners, callouts, and toast notifications.',
    icon: <Bell size={18} aria-hidden />,
    render: () => <FeedbackPlayground />,
  },
  {
    id: 'typography',
    label: 'Typography',
    description: 'Type ramp, headings, body sizes, and the inline text primitives.',
    icon: <Pilcrow size={18} aria-hidden />,
    render: () => <TypographyPlayground />,
  },
  {
    id: 'navigation',
    label: 'Navigation',
    description: 'Tabs, breadcrumbs, pagination, menus, steppers, and anchored navigation.',
    icon: <Compass size={18} aria-hidden />,
    render: () => <NavigationPlayground />,
  },
];

export function App() {
  const initial =
    (typeof window !== 'undefined' && window.location.hash.replace('#', '')) || 'charts';
  const [active, setActive] = useState<string>(
    PLAYGROUNDS.some((p) => p.id === initial) ? initial : 'charts',
  );
  const { setTheme } = useTheme();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHash = () => {
      const next = window.location.hash.replace('#', '');
      if (PLAYGROUNDS.some((p) => p.id === next)) setActive(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const current = PLAYGROUNDS.find((p) => p.id === active) ?? PLAYGROUNDS[0];
  const isDark = colorScheme === 'dark';

  // `collapsible="icon"` swaps the sidebar between full width and a narrow
  // icon rail when SidebarTrigger fires — the labels move into tooltips
  // automatically while the rail stays focusable. On `(max-width: 47.99em)`
  // viewports `useSidebar().isMobile` flips true; we then drop the Sidebar
  // entirely and render a fixed bottom-nav (Compose-style) instead.
  return (
    <SidebarProvider collapsible="icon">
      <Shell
        active={active}
        setActive={setActive}
        current={current}
        isDark={isDark}
        onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
      />
    </SidebarProvider>
  );
}

interface ShellProps {
  active: string;
  setActive: (id: string) => void;
  current: PlaygroundEntry;
  isDark: boolean;
  onToggleTheme: () => void;
}

function Shell({ active, setActive, current, isDark, onToggleTheme }: ShellProps) {
  const { isMobile } = useSidebar();

  const header = (
    <Inline
      as="header"
      align="center"
      justify="between"
      paddingX="8"
      paddingY="4"
      background="bg.raised"
    >
      <Inline align="center" gap="3">
        <Text weight="semibold">Cynosure · playground</Text>
      </Inline>
      <IconButton
        variant="ghost"
        size="md"
        label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        icon={isDark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
        onClick={onToggleTheme}
      />
    </Inline>
  );

  const main = (
    <Box
      as="main"
      flex="1"
      overflowY="auto"
      padding={isMobile ? '4' : '8'}
      paddingBottom={isMobile ? '24' : '8'}
    >
      <Container size="lg">
        <Stack gap="6">
          <Stack gap="2">
            <Heading level={1} size="2xl">
              {current.label}
            </Heading>
            <Text color="fg.muted">{current.description}</Text>
          </Stack>
          {current.render()}
        </Stack>
      </Container>
    </Box>
  );

  if (isMobile) {
    return (
      <Flex
        direction="column"
        position="fixed"
        top="0"
        right="0"
        bottom="0"
        left="0"
        background="bg.canvas"
        color="fg.default"
      >
        {header}
        <Divider />
        <Flex direction="column" flex="1" minHeight="0">
          {main}
        </Flex>
        <MobileBottomNav active={active} setActive={setActive} />
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      position="fixed"
      top="0"
      right="0"
      bottom="0"
      left="0"
      background="bg.canvas"
      color="fg.default"
    >
      {header}
      <Divider />

      {/*
       * `minHeight="0"` is required: without it, the default
       * `min-height: auto` on flex items lets this row stretch to its
       * children's intrinsic size, the Sidebar's `height: 100%` then
       * resolves against that stretched height, and SidebarFooter ends
       * up below the viewport.
       */}
      <Flex direction="row" flex="1" minHeight="0">
        <Sidebar aria-label="Playground sections">
          <SidebarBody>
            <SidebarNav aria-label="Playground sections">
              {PLAYGROUNDS.map((p) => (
                <SidebarItem
                  key={p.id}
                  asChild
                  icon={p.icon}
                  label={p.label}
                  isActive={p.id === active}
                >
                  <a href={`#${p.id}`} onClick={() => setActive(p.id)}>
                    {p.label}
                  </a>
                </SidebarItem>
              ))}
            </SidebarNav>
          </SidebarBody>
          <SidebarFooter>
            <SidebarTrigger />
          </SidebarFooter>
        </Sidebar>

        {main}
      </Flex>
    </Flex>
  );
}

interface MobileBottomNavProps {
  active: string;
  setActive: (id: string) => void;
}

// Compose-style NavigationBar: fixed strip at the bottom of the viewport,
// one slot per top-level destination, icon over short label, active slot
// gets a tinted pill behind the icon. Renders only when
// `useSidebar().isMobile` is true.
function MobileBottomNav({ active, setActive }: MobileBottomNavProps) {
  return (
    <Box
      as="nav"
      aria-label="Playground sections"
      background="bg.raised"
      borderColor="border.subtle"
      style={{ borderTopWidth: 1, borderTopStyle: 'solid' }}
    >
      <Inline align="stretch" justify="between" paddingX="2" paddingY="2" gap="0">
        {PLAYGROUNDS.map((p) => {
          const isActive = p.id === active;
          return (
            <Box
              key={p.id}
              as="a"
              href={`#${p.id}`}
              onClick={() => setActive(p.id)}
              flex="1"
              aria-current={isActive ? 'page' : undefined}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Stack align="center" gap="1" paddingY="1">
                <Inline
                  align="center"
                  justify="center"
                  paddingX="3"
                  paddingY="1"
                  borderRadius="full"
                  background={isActive ? 'accent.soft' : undefined}
                  color={isActive ? 'accent.solid' : 'fg.muted'}
                >
                  {p.icon}
                </Inline>
                <Text size="xs" color={isActive ? 'fg.default' : 'fg.muted'}>
                  {p.label}
                </Text>
              </Stack>
            </Box>
          );
        })}
      </Inline>
    </Box>
  );
}
