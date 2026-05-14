import { Box, Inline } from '@arshad-shah/cynosure-react';

const ITEMS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

export default function Example() {
  return (
    <Inline gap="2" wrap padding="4" background="bg.subtle" borderRadius="md" maxWidth="320px">
      {ITEMS.map((label) => (
        <Box key={label} padding="2" background="bg.surface" borderRadius="sm" minWidth="80px">
          {label}
        </Box>
      ))}
    </Inline>
  );
}
