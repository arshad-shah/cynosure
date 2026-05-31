import { ThemeProvider, ThemeToggle } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <ThemeProvider themes={['light', 'dark']} defaultTheme="system" storage={null}>
      <ThemeToggle variant="menu" />
    </ThemeProvider>
  );
}
