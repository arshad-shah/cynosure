import {
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  ColorPicker,
  Combobox,
  ComboboxItem,
  DatePicker,
  DateRangePicker,
  ErrorText,
  Fieldset,
  FileUpload,
  HelperText,
  IconButton,
  Input,
  Label,
  MultiSelect,
  NumberInput,
  PinInput,
  Radio,
  RadioGroup,
  RangeSlider,
  Rating,
  SearchInput,
  Select,
  SelectItem,
  Slider,
  Switch,
  TagsInput,
  Textarea,
  TimePicker,
} from '@lumen/react';
import { Demo, DemoCol, SectionHeader } from './common';

export function FormsSection() {
  return (
    <>
      <SectionHeader title="Forms" description="Inputs, controls, and form composition." />
      <div className="showcase-grid">
        <Demo title="Button">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </Demo>

        <Demo title="Button · states">
          <Button colorScheme="danger">Danger</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Demo>

        <Demo title="ButtonGroup">
          <ButtonGroup>
            <Button>One</Button>
            <Button>Two</Button>
            <Button>Three</Button>
          </ButtonGroup>
        </Demo>

        <Demo title="IconButton">
          <IconButton aria-label="Star">★</IconButton>
          <IconButton aria-label="Remove" variant="outline">
            ×
          </IconButton>
        </Demo>

        <DemoCol title="Input">
          <Label htmlFor="demo-input">Email</Label>
          <Input id="demo-input" type="email" placeholder="you@example.com" />
        </DemoCol>

        <DemoCol title="Textarea">
          <Textarea placeholder="Tell us more…" rows={3} />
        </DemoCol>

        <DemoCol title="NumberInput">
          <NumberInput defaultValue={10} minValue={0} maxValue={100} />
        </DemoCol>

        <DemoCol title="SearchInput">
          <SearchInput placeholder="Search…" />
        </DemoCol>

        <Demo title="Checkbox">
          <Checkbox defaultChecked>Accept terms</Checkbox>
        </Demo>

        <DemoCol title="CheckboxGroup">
          <CheckboxGroup defaultValue={['a']}>
            <Checkbox value="a">Alpha</Checkbox>
            <Checkbox value="b">Bravo</Checkbox>
            <Checkbox value="c">Charlie</Checkbox>
          </CheckboxGroup>
        </DemoCol>

        <DemoCol title="RadioGroup">
          <RadioGroup defaultValue="one">
            <Radio value="one">One</Radio>
            <Radio value="two">Two</Radio>
            <Radio value="three">Three</Radio>
          </RadioGroup>
        </DemoCol>

        <Demo title="Switch">
          <Switch defaultChecked>Notifications</Switch>
        </Demo>

        <DemoCol title="Label · Helper · Error">
          <Label htmlFor="demo-le">Username</Label>
          <Input id="demo-le" placeholder="jdoe" />
          <HelperText>Lowercase, 3–20 chars</HelperText>
          <ErrorText>Username is already taken</ErrorText>
        </DemoCol>

        <DemoCol title="Fieldset">
          <Fieldset legend="Preferences">
            <Checkbox defaultChecked>Email digests</Checkbox>
            <Checkbox>Push notifications</Checkbox>
          </Fieldset>
        </DemoCol>

        <DemoCol title="Select">
          <Select label="Fruit" placeholder="Pick one" defaultValue="b">
            <SelectItem value="a">Apple</SelectItem>
            <SelectItem value="b">Banana</SelectItem>
            <SelectItem value="c">Cherry</SelectItem>
          </Select>
        </DemoCol>

        <DemoCol title="Combobox">
          <Combobox
            label="Fruit"
            defaultValue="apple"
            items={[
              { value: 'apple', label: 'Apple' },
              { value: 'banana', label: 'Banana' },
              { value: 'cherry', label: 'Cherry' },
            ]}
          >
            {(item) => <ComboboxItem value={item.value}>{item.label}</ComboboxItem>}
          </Combobox>
        </DemoCol>

        <DemoCol title="MultiSelect">
          <MultiSelect
            label="Tags"
            defaultValue={['x']}
            items={[
              { value: 'x', label: 'Xerox' },
              { value: 'y', label: 'Yoga' },
              { value: 'z', label: 'Zulu' },
            ]}
          />
        </DemoCol>

        <DemoCol title="Slider">
          <Slider label="Volume" defaultValue={40} showValue />
        </DemoCol>

        <DemoCol title="RangeSlider">
          <RangeSlider label="Price" defaultValue={[20, 70]} />
        </DemoCol>

        <DemoCol title="DatePicker">
          <DatePicker label="Date" />
        </DemoCol>

        <DemoCol title="DateRangePicker">
          <DateRangePicker label="Range" />
        </DemoCol>

        <DemoCol title="TimePicker">
          <TimePicker label="Time" />
        </DemoCol>

        <DemoCol title="ColorPicker">
          <ColorPicker label="Color" defaultValue="#3b82f6" />
        </DemoCol>

        <DemoCol title="FileUpload">
          <FileUpload multiple>
            <div
              style={{
                padding: '1rem',
                border: '1px dashed var(--lumen-color-border-default)',
                borderRadius: 'var(--lumen-radius-component-md)',
                textAlign: 'center',
              }}
            >
              Drop files or click
            </div>
          </FileUpload>
        </DemoCol>

        <DemoCol title="PinInput">
          <PinInput length={4} />
        </DemoCol>

        <DemoCol title="TagsInput">
          <TagsInput label="Tags" defaultValue={['react', 'design']} />
        </DemoCol>

        <Demo title="Rating">
          <Rating defaultValue={3} />
        </Demo>
      </div>
    </>
  );
}
