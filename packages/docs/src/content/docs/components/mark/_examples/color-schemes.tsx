import { Mark, Text } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Text>
      <Mark colorScheme="accent">accent</Mark>, <Mark colorScheme="success">success</Mark>,{' '}
      <Mark colorScheme="warning">warning</Mark>, <Mark colorScheme="danger">danger</Mark>,{' '}
      <Mark colorScheme="info">info</Mark>, <Mark colorScheme="neutral">neutral</Mark>.
    </Text>
  );
}
