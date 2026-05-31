import { ThemeProvider, ThemeToggle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <ThemeProvider themes={['light', 'dark']} defaultTheme="light" storage={null}>
      <ThemeToggle variant="switch" />
    </ThemeProvider>
  );
}
