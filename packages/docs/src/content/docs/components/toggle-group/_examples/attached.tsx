import { ToggleGroup, ToggleGroupItem } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <ToggleGroup
      type="single"
      defaultValue="day"
      variant="outline"
      attached
      aria-label="View range"
    >
      <ToggleGroupItem value="day">Day</ToggleGroupItem>
      <ToggleGroupItem value="week">Week</ToggleGroupItem>
      <ToggleGroupItem value="month">Month</ToggleGroupItem>
      <ToggleGroupItem value="year">Year</ToggleGroupItem>
    </ToggleGroup>
  );
}
