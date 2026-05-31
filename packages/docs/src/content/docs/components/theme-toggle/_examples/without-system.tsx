import { Stack, ThemeProvider, ThemeToggle } from '@arshad-shah/cynosure-react';

export default function Example() {
  // `enableSystem={false}` removes the system option; mirror it on the toggle
  // by limiting `modes` to light + dark.
  return (
    <ThemeProvider
      themes={['light', 'dark']}
      defaultTheme="light"
      enableSystem={false}
      storage={null}
    >
      <Stack gap="3" align="start">
        <ThemeToggle variant="segmented" modes={['light', 'dark']} showLabels />
        <ThemeToggle variant="icon" modes={['light', 'dark']} />
      </Stack>
    </ThemeProvider>
  );
}
