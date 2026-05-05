import {
  Button,
  Checkbox,
  Input,
  Label,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Slider,
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
    <div className="pg-grid-2">
      <div className="pg-card">
        <h3 className="pg-card-title">Buttons</h3>
        <div className="pg-row">
          <Button variant="solid">Solid</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button colorScheme="danger">Danger</Button>
          <Button colorScheme="success">Success</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      <div className="pg-card">
        <h3 className="pg-card-title">Inputs</h3>
        <div className="pg-stack">
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
        </div>
      </div>

      <div className="pg-card">
        <h3 className="pg-card-title">Choices</h3>
        <div className="pg-stack">
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
        </div>
      </div>

      <div className="pg-card">
        <h3 className="pg-card-title">Range &amp; select</h3>
        <div className="pg-stack">
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
        </div>
      </div>
    </div>
  );
}
