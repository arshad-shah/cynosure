import { Inline, ThemeProvider, ThemeToggle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <ThemeProvider themes={['light', 'dark']} defaultTheme="system" storage={null}>
      <Inline gap="4" align="center">
        <ThemeToggle variant="segmented" size="sm" />
        <ThemeToggle variant="segmented" size="md" />
        <ThemeToggle variant="segmented" size="lg" />
      </Inline>
    </ThemeProvider>
  );
}
