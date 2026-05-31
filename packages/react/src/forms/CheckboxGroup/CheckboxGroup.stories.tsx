import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { CheckboxGroup } from './CheckboxGroup.js';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Forms/CheckboxGroup',
  component: CheckboxGroup,
  parameters: { layout: 'padded' },
  argTypes: {
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'es', label: 'Spanish' },
];

export const Playground: Story = {
  args: {
    defaultValue: ['en'],
    'aria-label': 'Languages',
  },
  render: (args) => (
    <CheckboxGroup {...args}>
      <Stack gap="2">
        {LANGUAGES.map((l) => (
          <Checkbox key={l.value} value={l.value}>
            {l.label}
          </Checkbox>
        ))}
      </Stack>
    </CheckboxGroup>
  ),
};

export const Uncontrolled: Story = {
  name: 'Uncontrolled (defaultValue)',
  render: () => (
    <CheckboxGroup defaultValue={['en', 'fr']} aria-label="Languages">
      <Stack gap="2">
        {LANGUAGES.map((l) => (
          <Checkbox key={l.value} value={l.value}>
            {l.label}
          </Checkbox>
        ))}
      </Stack>
    </CheckboxGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState<string[]>(['en']);
      return (
        <Stack gap="3">
          <CheckboxGroup value={value} onChange={setValue} aria-label="Languages">
            <Stack gap="2">
              {LANGUAGES.map((l) => (
                <Checkbox key={l.value} value={l.value}>
                  {l.label}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
          <Text size="sm">
            Selected: <code>{JSON.stringify(value)}</code>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const DisabledGroup: Story = {
  render: () => (
    <CheckboxGroup defaultValue={['en']} disabled aria-label="Languages">
      <Stack gap="2">
        {LANGUAGES.map((l) => (
          <Checkbox key={l.value} value={l.value}>
            {l.label}
          </Checkbox>
        ))}
      </Stack>
    </CheckboxGroup>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · toggling a box changes the group value',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<string[]>(['en']);
      return (
        <Stack gap="3">
          <CheckboxGroup value={value} onChange={setValue} aria-label="Languages">
            <Stack gap="2">
              {LANGUAGES.map((l) => (
                <Checkbox key={l.value} value={l.value}>
                  {l.label}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
          <Text size="sm" data-testid="value">
            {value.join(',')}
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const out = canvas.getByTestId('value');
    await expect(out).toHaveTextContent('en');
    // English starts checked; French does not.
    const [english, french] = canvas.getAllByRole('checkbox');
    await expect(english).toHaveAttribute('data-state', 'checked');
    await expect(french).toHaveAttribute('data-state', 'unchecked');
    await userEvent.click(french);
    await expect(french).toHaveAttribute('data-state', 'checked');
    await expect(out).toHaveTextContent('en,fr');
    await userEvent.click(english);
    await expect(out).toHaveTextContent('fr');
  },
};
