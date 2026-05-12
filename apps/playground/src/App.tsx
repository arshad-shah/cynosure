import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  IconButton,
  Inline,
  Stack,
  Text,
  useColorScheme,
  useTheme,
} from '@arshad-shah/cynosure-react';
import { Moon, Sparkles, Sun } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { ChartsPlayground } from './playgrounds/ChartsPlayground.js';
import { DataDisplayPlayground } from './playgrounds/DataDisplayPlayground.js';
import { FeedbackPlayground } from './playgrounds/FeedbackPlayground.js';
import { FormsPlayground } from './playgrounds/FormsPlayground.js';
import { OverlaysPlayground } from './playgrounds/OverlaysPlayground.js';
import { TypographyPlayground } from './playgrounds/TypographyPlayground.js';

interface PlaygroundEntry {
  id: string;
  label: string;
  description: string;
  render: () => ReactNode;
}

const PLAYGROUNDS: PlaygroundEntry[] = [
  {
    id: 'charts',
    label: 'Charts',
    description:
      'SwiftChart-powered chart wrappers. Resize the window to see the responsive Canvas reflow without a re-render.',
    render: () => <ChartsPlayground />,
  },
  {
    id: 'forms',
    label: 'Forms',
    description: 'Inputs, selects, sliders, and other interactive form primitives.',
    render: () => <FormsPlayground />,
  },
  {
    id: 'overlays',
    label: 'Overlays',
    description: 'Dialog, drawer, popover, dropdown, tooltip — every floating surface.',
    render: () => <OverlaysPlayground />,
  },
  {
    id: 'data-display',
    label: 'Data display',
    description: 'Cards, tables, badges, avatars, progress, and the rest of the static surfaces.',
    render: () => <DataDisplayPlayground />,
  },
  {
    id: 'feedback',
    label: 'Feedback',
    description: 'Alerts, banners, callouts, and toast notifications.',
    render: () => <FeedbackPlayground />,
  },
  {
    id: 'typography',
    label: 'Typography',
    description: 'Type ramp, headings, body sizes, and the inline text primitives.',
    render: () => <TypographyPlayground />,
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

  const current = PLAYGROUNDS.find((p) => p.id === active) ?? PLAYGROUNDS[0]!;
  const isDark = colorScheme === 'dark';

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
      <Inline
        as="header"
        align="center"
        justify="between"
        paddingX="6"
        paddingY="3"
        background="bg.raised"
      >
        <Inline align="center" gap="3">
          <Sparkles size={20} aria-hidden />
          <Text weight="semibold">Cynosure · playground</Text>
        </Inline>
        <IconButton
          variant="ghost"
          size="sm"
          label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          icon={isDark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        />
      </Inline>
      <Divider />

      <Flex direction="row" flex="1" minHeight="0">
        <Stack as="aside" gap="1" padding="3" minWidth="14rem" maxWidth="14rem" overflowY="auto">
          {PLAYGROUNDS.map((p) => (
            <Button
              asChild
              key={p.id}
              variant={p.id === active ? 'soft' : 'ghost'}
              size="sm"
              fullWidth
            >
              <a
                href={`#${p.id}`}
                aria-current={p.id === active ? 'page' : undefined}
                onClick={() => setActive(p.id)}
              >
                {p.label}
              </a>
            </Button>
          ))}
        </Stack>
        <Divider orientation="vertical" />

        <Box as="main" flex="1" overflowY="auto" padding="8">
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
      </Flex>
    </Flex>
  );
}
