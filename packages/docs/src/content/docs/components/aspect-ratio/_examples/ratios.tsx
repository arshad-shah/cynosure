import { AspectRatio, Center, Inline, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Inline gap="3" align="start" wrap>
      {[
        { ratio: 16 / 9, label: '16 : 9' },
        { ratio: 4 / 3, label: '4 : 3' },
        { ratio: 1 / 1, label: '1 : 1' },
      ].map((r) => (
        <AspectRatio
          key={r.label}
          ratio={r.ratio}
          background="bg.subtle"
          borderRadius="md"
          width="160px"
        >
          <Center>
            <Text color="fg.muted">{r.label}</Text>
          </Center>
        </AspectRatio>
      ))}
    </Inline>
  );
}
