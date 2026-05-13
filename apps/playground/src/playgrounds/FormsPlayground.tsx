import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  type CheckboxState,
  ColorPicker,
  Combobox,
  DatePicker,
  DateRangePicker,
  ErrorText,
  Fieldset,
  FileUpload,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  Grid,
  Heading,
  HelperText,
  IconButton,
  Inline,
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
  SelectSection,
  Slider,
  Stack,
  Switch,
  TagsInput,
  Text,
  Textarea,
  TimePicker,
} from '@arshad-shah/cynosure-react';
import {
  Bold,
  Code as CodeIcon,
  Download,
  Italic,
  Link2,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'elderberry', label: 'Elderberry' },
];

const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
  { value: 'preact', label: 'Preact' },
];

const DEPARTMENTS = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'support', label: 'Support' },
  { value: 'sales', label: 'Sales' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'es', label: 'Spanish' },
];

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];

export function FormsPlayground() {
  // Buttons
  const [pressed, setPressed] = useState<'list' | 'grid' | 'board'>('list');

  // Inputs
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [qty, setQty] = useState<number>(1);

  // Choice
  const [agree, setAgree] = useState<CheckboxState>(false);
  const [langs, setLangs] = useState<string[]>(['en']);
  const [plan, setPlan] = useState('pro');
  const [notify, setNotify] = useState(true);

  // Pickers
  const [fruit, setFruit] = useState<string | null>('apple');
  const [framework, setFramework] = useState<string | null>('react');
  const [departments, setDepartments] = useState<string[]>(['design']);

  // Slider
  const [volume, setVolume] = useState<number>(40);
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 80]);

  // Other
  const [search, setSearch] = useState('');
  const [pin, setPin] = useState('');
  const [tags, setTags] = useState<string[]>(['design', 'system']);
  const [rating, setRating] = useState<number>(3);

  const emailInvalid = email.length > 0 && !email.includes('@');

  return (
    <Grid columns={{ base: 1, md: 2 }} gap="4">
      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Button
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Inline gap="3">
              <Button variant="solid">Solid</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </Inline>
            <Inline gap="3">
              <Button colorScheme="success" leftIcon={<Download size={16} aria-hidden />}>
                Download
              </Button>
              <Button
                colorScheme="danger"
                variant="soft"
                leftIcon={<Trash2 size={16} aria-hidden />}
              >
                Delete
              </Button>
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
            </Inline>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            IconButton
          </Heading>
        </CardHeader>
        <CardBody>
          <Inline gap="3" align="center">
            <IconButton icon={<Search size={16} aria-hidden />} label="Search" variant="solid" />
            <IconButton icon={<Pencil size={16} aria-hidden />} label="Edit" variant="soft" />
            <IconButton icon={<Search size={16} aria-hidden />} label="Search" variant="outline" />
            <IconButton icon={<Pencil size={16} aria-hidden />} label="Edit" variant="ghost" />
            <IconButton
              icon={<Trash2 size={16} aria-hidden />}
              label="Delete"
              colorScheme="danger"
              variant="soft"
            />
          </Inline>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            ButtonGroup
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <ButtonGroup attached variant="outline">
              {(['list', 'grid', 'board'] as const).map((key) => (
                <Button
                  key={key}
                  variant={pressed === key ? 'solid' : 'outline'}
                  onClick={() => setPressed(key)}
                  aria-pressed={pressed === key}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </ButtonGroup>
            <ButtonGroup variant="soft" colorScheme="accent">
              <Button>Reply</Button>
              <Button>Forward</Button>
              <Button>Archive</Button>
            </ButtonGroup>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Input
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Stack gap="2">
              <Label htmlFor="fp-email" required>
                Email
              </Label>
              <Input
                id="fp-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
                invalid={emailInvalid}
                clearable
                leadingSlot={<Search size={14} aria-hidden />}
              />
              {emailInvalid ? (
                <ErrorText>Must include an &quot;@&quot;.</ErrorText>
              ) : (
                <HelperText>We will never share your email.</HelperText>
              )}
            </Stack>
            <Input variant="filled" placeholder="Filled variant" />
            <Input placeholder="Disabled" disabled />
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Textarea
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Label htmlFor="fp-bio">Short bio</Label>
            <Textarea
              value={bio}
              onChange={setBio}
              placeholder="Tell us about yourself…"
              rows={4}
              limit={280}
              clearable
              toolbar={
                <>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={<Bold size={14} aria-hidden />}
                    label="Bold"
                  />
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={<Italic size={14} aria-hidden />}
                    label="Italic"
                  />
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={<Link2 size={14} aria-hidden />}
                    label="Link"
                  />
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={<CodeIcon size={14} aria-hidden />}
                    label="Code"
                  />
                </>
              }
            />
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            NumberInput
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <NumberInput
              value={qty}
              onChange={setQty}
              minValue={0}
              maxValue={99}
              aria-label="Quantity"
            />
            <NumberInput
              defaultValue={49.99}
              step={0.01}
              formatOptions={{ style: 'currency', currency: 'EUR' }}
              aria-label="Price"
            />
            <NumberInput
              defaultValue={80}
              suffix="%"
              minValue={0}
              maxValue={100}
              aria-label="Opacity"
            />
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Checkbox &amp; CheckboxGroup
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Checkbox checked={agree} onCheckedChange={setAgree}>
              I agree to the terms of service
            </Checkbox>
            <CheckboxGroup value={langs} onChange={setLangs} aria-label="Languages">
              <Stack gap="2">
                {LANGUAGES.map((l) => (
                  <Checkbox key={l.value} value={l.value}>
                    {l.label}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
            <Text size="sm" color="fg.muted">
              Selected: <code>{JSON.stringify(langs)}</code>
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Radio &amp; RadioGroup
          </Heading>
        </CardHeader>
        <CardBody>
          <RadioGroup value={plan} onValueChange={setPlan} aria-label="Plan">
            <Stack gap="3">
              {PLANS.map((p) => (
                <Radio key={p.value} value={p.value}>
                  {p.label}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Switch
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Switch checked={notify} onCheckedChange={setNotify}>
              Email notifications
            </Switch>
            <Switch defaultChecked>Two-factor auth</Switch>
            <Switch>Share usage data</Switch>
            <Switch disabled defaultChecked>
              Disabled (on)
            </Switch>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Label / HelperText / ErrorText
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Stack gap="2">
              <Label htmlFor="fp-handle" required>
                Handle
              </Label>
              <Input id="fp-handle" placeholder="ada" aria-describedby="fp-handle-help" />
              <HelperText id="fp-handle-help">Your public @handle on the platform.</HelperText>
            </Stack>
            <Stack gap="2">
              <Label htmlFor="fp-pw" disabled>
                Password (reset required)
              </Label>
              <Input id="fp-pw" type="password" disabled />
              <ErrorText>Reset before signing in again.</ErrorText>
            </Stack>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Fieldset
          </Heading>
        </CardHeader>
        <CardBody>
          <Fieldset legend="Shipping address">
            <Stack gap="3">
              <Stack gap="2">
                <Label htmlFor="fp-street">Street</Label>
                <Input id="fp-street" placeholder="123 Main St" />
              </Stack>
              <Inline gap="3">
                <Stack gap="2">
                  <Label htmlFor="fp-city">City</Label>
                  <Input id="fp-city" placeholder="Dublin" />
                </Stack>
                <Stack gap="2">
                  <Label htmlFor="fp-zip">ZIP</Label>
                  <Input id="fp-zip" placeholder="D02 X285" />
                </Stack>
              </Inline>
            </Stack>
          </Fieldset>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Select
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Select
              value={fruit}
              onValueChange={setFruit}
              items={FRUITS}
              aria-label="Favourite fruit"
              placeholder="Pick a fruit"
            />
            <Select placeholder="Pick a plan" aria-label="Plan">
              <SelectSection title="Personal">
                <SelectItem id="free">Free</SelectItem>
                <SelectItem id="pro">Pro</SelectItem>
              </SelectSection>
              <SelectSection title="Business">
                <SelectItem id="team">Team</SelectItem>
                <SelectItem id="enterprise">Enterprise</SelectItem>
              </SelectSection>
            </Select>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Combobox
          </Heading>
        </CardHeader>
        <CardBody>
          <Combobox
            items={FRAMEWORKS}
            value={framework}
            onValueChange={setFramework}
            placeholder="Search frameworks…"
            aria-label="Framework"
          />
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            MultiSelect
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <MultiSelect
              items={DEPARTMENTS}
              value={departments}
              onValueChange={setDepartments}
              placeholder="Add department…"
              aria-label="Departments"
            />
            <Text size="sm" color="fg.muted">
              Selected: <code>{JSON.stringify(departments)}</code>
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Slider
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Slider
              label="Volume"
              minValue={0}
              maxValue={100}
              value={volume}
              onChange={(v) => setVolume(typeof v === 'number' ? v : (v[0] ?? 0))}
              showValue
            />
            <Slider
              label="Confidence"
              minValue={0}
              maxValue={1}
              step={0.01}
              defaultValue={0.72}
              formatOptions={{ style: 'percent' }}
              showValue
            />
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            RangeSlider
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <RangeSlider
              label="Price range"
              minValue={0}
              maxValue={100}
              value={priceRange}
              onChange={setPriceRange}
              showValue
            />
            <Text size="sm" color="fg.muted">
              {priceRange[0]} – {priceRange[1]}
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            DatePicker
          </Heading>
        </CardHeader>
        <CardBody>
          <DatePicker label="Start date" aria-label="Start date" />
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            DateRangePicker
          </Heading>
        </CardHeader>
        <CardBody>
          <DateRangePicker label="Trip dates" aria-label="Trip dates" />
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            TimePicker
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <TimePicker label="Meeting time" aria-label="Meeting time" />
            <TimePicker label="Alarm (24h)" hourCycle={24} aria-label="Alarm" />
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            ColorPicker
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="4">
            <Inline gap="3">
              <ColorPicker label="Primary" defaultValue="#6366F1" />
              <ColorPicker label="Secondary" defaultValue="#EC4899" />
              <ColorPicker label="Tertiary" defaultValue="#10B981" />
            </Inline>
            <Inline gap="4" align="start" style={{ flexWrap: 'wrap' }}>
              <ColorPicker variant="inline" size="sm" defaultValue="#6366F1" />
              <ColorPicker
                variant="inline"
                size="md"
                defaultValue="#10B981"
                alpha
                swatches={['#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#6366f1', '#ec4899']}
                onSwatchesChange={() => {}}
              />
              <ColorPicker variant="inline" size="lg" defaultValue="#EC4899" alpha />
            </Inline>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            FileUpload
          </Heading>
        </CardHeader>
        <CardBody>
          <FileUpload
            multiple
            accept="image/*,application/pdf"
            maxCount={3}
            maxSize={1024 * 1024}
          />
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            SearchInput
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search…"
              aria-label="Search"
              debounceMs={250}
            />
            <Text size="sm" color="fg.muted">
              Value: <code>{JSON.stringify(search)}</code>
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            PinInput
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <PinInput length={6} value={pin} onChange={setPin} aria-label="Verification code" />
            <Text size="sm" color="fg.muted">
              Value: <code>{JSON.stringify(pin)}</code>
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            TagsInput
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <TagsInput
              value={tags}
              onValueChange={setTags}
              placeholder="Add a tag, press Enter…"
              suggestions={['design', 'engineering', 'marketing', 'support']}
              aria-label="Tags"
            />
            <Text size="sm" color="fg.muted">
              {tags.length} tag{tags.length === 1 ? '' : 's'}
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Rating
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Rating value={rating} onValueChange={setRating} allowHalf label="How was it?" />
            <Text size="sm" color="fg.muted">
              {rating} / 5
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Form composition
          </Heading>
        </CardHeader>
        <CardBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Stack gap="4">
              <FormField name="email" invalid={emailInvalid} required>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" value={email} onChange={setEmail} />
                </FormControl>
                <FormDescription>We will never share your email.</FormDescription>
                <FormMessage>{emailInvalid ? 'Needs an @' : undefined}</FormMessage>
              </FormField>
              <FormField name="bio">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea rows={3} value={bio} onChange={setBio} limit={140} />
                </FormControl>
                <FormDescription>Max 140 characters.</FormDescription>
                <FormMessage />
              </FormField>
              <Inline gap="3">
                <Button type="submit">Save</Button>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Inline>
            </Stack>
          </Form>
        </CardBody>
      </Card>
    </Grid>
  );
}
