import { ToggleGroup, ToggleGroupItem } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}
    >
      <ToggleGroup type="single" defaultValue="a" size="xs" aria-label="Extra small">
        <ToggleGroupItem value="a">One</ToggleGroupItem>
        <ToggleGroupItem value="b">Two</ToggleGroupItem>
        <ToggleGroupItem value="c">Three</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" defaultValue="a" size="sm" aria-label="Small">
        <ToggleGroupItem value="a">One</ToggleGroupItem>
        <ToggleGroupItem value="b">Two</ToggleGroupItem>
        <ToggleGroupItem value="c">Three</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" defaultValue="a" size="md" aria-label="Medium">
        <ToggleGroupItem value="a">One</ToggleGroupItem>
        <ToggleGroupItem value="b">Two</ToggleGroupItem>
        <ToggleGroupItem value="c">Three</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" defaultValue="a" size="lg" aria-label="Large">
        <ToggleGroupItem value="a">One</ToggleGroupItem>
        <ToggleGroupItem value="b">Two</ToggleGroupItem>
        <ToggleGroupItem value="c">Three</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
