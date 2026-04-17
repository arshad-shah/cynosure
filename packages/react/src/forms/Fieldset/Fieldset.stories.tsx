import type { Meta, StoryObj } from '@storybook/react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { CheckboxGroup } from '../CheckboxGroup/CheckboxGroup.js';
import { Input } from '../Input/Input.js';
import { Label } from '../Label/Label.js';
import { Radio } from '../Radio/Radio.js';
import { RadioGroup } from '../RadioGroup/RadioGroup.js';
import { Switch } from '../Switch/Switch.js';
import { Fieldset } from './Fieldset.js';

const meta: Meta<typeof Fieldset> = {
  title: 'Forms/Fieldset',
  component: Fieldset,
  parameters: { layout: 'padded' },
  argTypes: {
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Fieldset>;

export const Playground: Story = {
  args: {
    legend: 'Personal details',
    disabled: false,
  },
  render: (args) => (
    <Fieldset {...args}>
      <Stack gap="3" width="360px">
        <Stack gap="2">
          <Label htmlFor="fs-first">First name</Label>
          <Input id="fs-first" placeholder="Ada" />
        </Stack>
        <Stack gap="2">
          <Label htmlFor="fs-last">Last name</Label>
          <Input id="fs-last" placeholder="Lovelace" />
        </Stack>
      </Stack>
    </Fieldset>
  ),
};

export const WithLegend: Story = {
  render: () => (
    <Fieldset legend="Shipping address">
      <Stack gap="3" width="360px">
        <Stack gap="2">
          <Label htmlFor="fs-street">Street</Label>
          <Input id="fs-street" />
        </Stack>
        <Inline gap="3">
          <Stack gap="2" style={{ flex: 1 }}>
            <Label htmlFor="fs-city">City</Label>
            <Input id="fs-city" />
          </Stack>
          <Stack gap="2" style={{ width: '100px' }}>
            <Label htmlFor="fs-zip">ZIP</Label>
            <Input id="fs-zip" />
          </Stack>
        </Inline>
      </Stack>
    </Fieldset>
  ),
};

export const WithoutLegend: Story = {
  render: () => (
    <Fieldset>
      <Stack gap="3" width="360px">
        <Label htmlFor="fs-nl-email">Email</Label>
        <Input id="fs-nl-email" type="email" />
      </Stack>
    </Fieldset>
  ),
};

export const Disabled: Story = {
  name: 'Disabled — nested controls inherit',
  render: () => (
    <Fieldset legend="Account (read-only)" disabled>
      <Stack gap="3" width="360px">
        <Stack gap="2">
          <Label htmlFor="fs-d-email">Email</Label>
          <Input id="fs-d-email" defaultValue="ada@example.com" />
        </Stack>
        <Switch defaultChecked>Email notifications</Switch>
        <CheckboxGroup defaultValue={['news']} aria-label="Subscriptions">
          <Stack gap="2">
            <Checkbox value="news">Newsletter</Checkbox>
            <Checkbox value="tips">Weekly tips</Checkbox>
          </Stack>
        </CheckboxGroup>
      </Stack>
    </Fieldset>
  ),
};

export const WithRadioGroup: Story = {
  render: () => (
    <Fieldset legend="Delivery speed">
      <RadioGroup defaultValue="std">
        <Radio value="std">Standard (3–5 days)</Radio>
        <Radio value="exp">Express (1–2 days)</Radio>
        <Radio value="ovn">Overnight</Radio>
      </RadioGroup>
    </Fieldset>
  ),
};

export const WithCheckboxGroup: Story = {
  render: () => (
    <Fieldset legend="Dietary restrictions">
      <CheckboxGroup defaultValue={[]}>
        <Stack gap="2">
          <Checkbox value="veg">Vegetarian</Checkbox>
          <Checkbox value="vgn">Vegan</Checkbox>
          <Checkbox value="gf">Gluten-free</Checkbox>
          <Checkbox value="df">Dairy-free</Checkbox>
        </Stack>
      </CheckboxGroup>
    </Fieldset>
  ),
};

export const RichLegend: Story = {
  name: 'Legend with rich content',
  render: () => (
    <Fieldset
      legend={
        <Text as="span" weight="semibold">
          Contact details{' '}
          <Text as="span" size="xs" color="fg.muted" weight="regular">
            (optional)
          </Text>
        </Text>
      }
    >
      <Stack gap="3" width="360px">
        <Stack gap="2">
          <Label htmlFor="fs-rl-phone">Phone</Label>
          <Input id="fs-rl-phone" type="tel" />
        </Stack>
      </Stack>
    </Fieldset>
  ),
};

export const Empty: Story = {
  name: 'Empty fieldset',
  render: () => <Fieldset legend="Nothing here yet" />,
};
