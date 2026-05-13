import { ToggleGroup, ToggleGroupItem } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <ToggleGroup type="single" defaultValue="a" variant="ghost" aria-label="Ghost group">
        <ToggleGroupItem value="a">One</ToggleGroupItem>
        <ToggleGroupItem value="b">Two</ToggleGroupItem>
        <ToggleGroupItem value="c">Three</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" defaultValue="a" variant="outline" aria-label="Outline group">
        <ToggleGroupItem value="a">One</ToggleGroupItem>
        <ToggleGroupItem value="b">Two</ToggleGroupItem>
        <ToggleGroupItem value="c">Three</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" defaultValue="a" variant="solid" aria-label="Solid group">
        <ToggleGroupItem value="a">One</ToggleGroupItem>
        <ToggleGroupItem value="b">Two</ToggleGroupItem>
        <ToggleGroupItem value="c">Three</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
