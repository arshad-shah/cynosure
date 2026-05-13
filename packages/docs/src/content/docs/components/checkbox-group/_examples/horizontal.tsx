import { Checkbox, CheckboxGroup, Inline } from '@arshad-shah/cynosure-react';

export default function Example() {
  return (
    <CheckboxGroup defaultValue={['en']} aria-label="Languages">
      <Inline gap="4">
        <Checkbox value="en">English</Checkbox>
        <Checkbox value="fr">French</Checkbox>
        <Checkbox value="de">German</Checkbox>
        <Checkbox value="es">Spanish</Checkbox>
      </Inline>
    </CheckboxGroup>
  );
}
