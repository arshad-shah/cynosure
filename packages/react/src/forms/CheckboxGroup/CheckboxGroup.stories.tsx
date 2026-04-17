import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { Fieldset } from '../Fieldset/Fieldset.js';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '../Form/index.js';
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

export const HorizontalLayout: Story = {
  render: () => (
    <CheckboxGroup defaultValue={['en']} aria-label="Languages">
      <Inline gap="4">
        {LANGUAGES.map((l) => (
          <Checkbox key={l.value} value={l.value}>
            {l.label}
          </Checkbox>
        ))}
      </Inline>
    </CheckboxGroup>
  ),
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

export const IndividuallyDisabled: Story = {
  render: () => (
    <CheckboxGroup defaultValue={['fr']} aria-label="Languages">
      <Stack gap="2">
        <Checkbox value="en">English</Checkbox>
        <Checkbox value="fr">French</Checkbox>
        <Checkbox value="de" disabled>
          German (unavailable)
        </Checkbox>
        <Checkbox value="es">Spanish</Checkbox>
      </Stack>
    </CheckboxGroup>
  ),
};

export const InsideFieldset: Story = {
  name: 'With <Fieldset> + legend',
  render: () => (
    <Fieldset legend="Pick your languages">
      <CheckboxGroup defaultValue={['en']}>
        <Stack gap="2">
          {LANGUAGES.map((l) => (
            <Checkbox key={l.value} value={l.value}>
              {l.label}
            </Checkbox>
          ))}
        </Stack>
      </CheckboxGroup>
    </Fieldset>
  ),
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [value, setValue] = useState<string[]>([]);
      const invalid = value.length === 0;
      return (
        <Form>
          <Stack gap="4" width="360px">
            <FormField name="langs" invalid={invalid} required>
              <FormLabel>Languages you speak</FormLabel>
              <FormControl>
                <CheckboxGroup value={value} onChange={setValue}>
                  <Stack gap="2">
                    {LANGUAGES.map((l) => (
                      <Checkbox key={l.value} value={l.value}>
                        {l.label}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
              <FormDescription>Pick one or more.</FormDescription>
              <FormMessage>{invalid ? 'Pick at least one language.' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
