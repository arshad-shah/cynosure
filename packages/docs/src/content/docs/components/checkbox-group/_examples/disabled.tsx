import { Checkbox, CheckboxGroup, Stack } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <Stack gap="5">
      <CheckboxGroup defaultValue={['en']} disabled aria-label="Disabled group">
        <Stack gap="2">
          <Checkbox value="en">English</Checkbox>
          <Checkbox value="fr">French</Checkbox>
          <Checkbox value="de">German</Checkbox>
        </Stack>
      </CheckboxGroup>
      <CheckboxGroup defaultValue={['fr']} aria-label="Individually disabled">
        <Stack gap="2">
          <Checkbox value="en">English</Checkbox>
          <Checkbox value="fr">French</Checkbox>
          <Checkbox value="de" disabled>
            German (unavailable)
          </Checkbox>
        </Stack>
      </CheckboxGroup>
    </Stack>
  );
}
