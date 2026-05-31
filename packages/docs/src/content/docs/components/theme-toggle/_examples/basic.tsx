import {
  Card,
  CardBody,
  Stack,
  Text,
  ThemeProvider,
  ThemeToggle,
  useTheme,
} from '@arshad-shah/cynosure-react';

function Preview() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <Card variant="filled">
      <CardBody>
        <Stack gap="3" align="start">
          <ThemeToggle />
          <Text size="sm" color="fg.muted">
            theme: <strong>{theme}</strong> · resolved: <strong>{resolvedTheme}</strong>
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default function Example() {
  return (
    <ThemeProvider themes={['light', 'dark']} defaultTheme="system" storage={null}>
      <Preview />
    </ThemeProvider>
  );
}
