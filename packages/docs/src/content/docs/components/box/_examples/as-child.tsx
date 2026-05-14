import { Box } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Box asChild padding="3" background="accent.soft" borderRadius="md">
      <a href="https://cynosure.arshadshah.com">
        Box's layout class flows onto the &lt;a&gt; — no wrapper element added.
      </a>
    </Box>
  );
}
