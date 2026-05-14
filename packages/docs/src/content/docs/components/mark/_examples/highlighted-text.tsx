import { HighlightedText, Text } from '@arshad-shah/cynosure-react';

const text = 'the quick brown fox jumps over the lazy dog';
const pattern = /\bthe\b|quick|lazy/gi;

function findRanges(source: string, re: RegExp) {
  const out: { start: number; length: number }[] = [];
  for (const m of source.matchAll(re)) {
    if (m.index != null) out.push({ start: m.index, length: m[0].length });
  }
  return out;
}

export default function Example() {
  return (
    <Text>
      <HighlightedText text={text} ranges={findRanges(text, pattern)} />
    </Text>
  );
}
