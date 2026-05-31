import { Inline, Stack, Text, ThemeProvider, ThemeToggle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <ThemeProvider themes={['light', 'dark']} defaultTheme="system" storage={null}>
      <Stack gap="4">
        <Inline gap="3" align="center">
          <Text size="sm" width="120px" color="fg.muted">
            icon
          </Text>
          <ThemeToggle variant="icon" />
        </Inline>
        <Inline gap="3" align="center">
          <Text size="sm" width="120px" color="fg.muted">
            switch
          </Text>
          <ThemeToggle variant="switch" />
        </Inline>
        <Inline gap="3" align="center">
          <Text size="sm" width="120px" color="fg.muted">
            segmented
          </Text>
          <ThemeToggle variant="segmented" />
        </Inline>
        <Inline gap="3" align="center">
          <Text size="sm" width="120px" color="fg.muted">
            menu
          </Text>
          <ThemeToggle variant="menu" />
        </Inline>
      </Stack>
    </ThemeProvider>
  );
}
