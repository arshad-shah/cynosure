import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Grid,
  Heading,
  Inline,
  Input,
  Label,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Slider,
  Stack,
  Switch,
  Textarea,
} from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export function FormsPlayground() {
  const [text, setText] = useState('');
  const [agree, setAgree] = useState<boolean | 'indeterminate'>(false);
  const [pushed, setPushed] = useState(true);
  const [size, setSize] = useState('md');
  const [vol, setVol] = useState(40);
  const [region, setRegion] = useState('us');

  return (
    <Grid columns={{ base: 1, md: 2 }} gap="4">
      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Buttons
          </Heading>
        </CardHeader>
        <CardBody>
          <Inline align="center" gap="3">
            <Button variant="solid">Solid</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button colorScheme="danger">Danger</Button>
            <Button colorScheme="success">Success</Button>
            <Button disabled>Disabled</Button>
          </Inline>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Inputs
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Label>
              Email
              <Input
                type="email"
                placeholder="hello@example.com"
                value={text}
                onChange={(value) => setText(value)}
              />
            </Label>
            <Label>
              Notes
              <Textarea rows={3} placeholder="Type a note…" />
            </Label>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Choices
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Checkbox checked={agree} onCheckedChange={setAgree}>
              I agree to the terms
            </Checkbox>
            <Switch checked={pushed} onCheckedChange={setPushed}>
              Email me weekly summaries
            </Switch>
            <RadioGroup value={size} onValueChange={setSize}>
              <Radio value="sm">Small</Radio>
              <Radio value="md">Medium</Radio>
              <Radio value="lg">Large</Radio>
            </RadioGroup>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <Heading level={3} size="md">
            Range &amp; select
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="3">
            <Slider
              label={`Volume — ${vol}`}
              value={vol}
              onChange={(v) => setVol(typeof v === 'number' ? v : (v[0] ?? 0))}
              minValue={0}
              maxValue={100}
            />
            <Label>
              Region
              <Select value={region} onValueChange={setRegion}>
                <SelectItem id="us">United States</SelectItem>
                <SelectItem id="eu">European Union</SelectItem>
                <SelectItem id="apac">Asia-Pacific</SelectItem>
              </Select>
            </Label>
          </Stack>
        </CardBody>
      </Card>
    </Grid>
  );
}
