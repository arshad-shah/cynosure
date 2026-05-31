import { Stack, ThemeProvider, ThemeToggle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <ThemeProvider themes={['light', 'dark']} defaultTheme="system" storage={null}>
      <Stack gap="3" align="start">
        <ThemeToggle variant="segmented" />
        <ThemeToggle variant="segmented" showLabels />
      </Stack>
    </ThemeProvider>
  );
}
