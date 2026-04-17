import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Chip } from './Chip.js';

const meta: Meta<typeof Chip> = {
  title: 'Feedback/Chip',
  component: Chip,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['solid', 'soft', 'outline', 'ghost'] },
    colorScheme: {
      control: 'select',
      options: ['accent', 'neutral', 'success', 'warning', 'danger', 'info'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md'] },
    shape: { control: 'select', options: ['default', 'pill', 'square'] },
  },
};
export default meta;
type Story = StoryObj<typeof Chip>;

const IconCheck = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconChevron = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconFilter = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const Playground: Story = {
  args: {
    children: 'Filter',
    variant: 'soft',
    colorScheme: 'neutral',
    size: 'md',
    shape: 'pill',
  },
};

export const BasicToggle: Story = {
  name: 'Basic toggle — uncontrolled selected state',
  render: () => {
    function Demo(): React.ReactElement {
      const [selected, setSelected] = useState(false);
      return (
        <Stack gap="3">
          <Chip
            selected={selected}
            onSelectedChange={setSelected}
            colorScheme="accent"
            variant={selected ? 'solid' : 'soft'}
            leftIcon={selected ? <IconCheck /> : null}
          >
            {selected ? 'Selected' : 'Select me'}
          </Chip>
          <Text size="sm" color="fg.muted">
            aria-pressed = <code>{String(selected)}</code>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const FilterGroup: Story = {
  name: 'Filter chip group — multi-select filter',
  render: () => {
    type Filter = 'design' | 'eng' | 'marketing' | 'sales' | 'ops';
    function Demo(): React.ReactElement {
      const [selected, setSelected] = useState<Set<Filter>>(new Set(['eng']));
      const toggle = (key: Filter): void => {
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(key)) {
            next.delete(key);
          } else {
            next.add(key);
          }
          return next;
        });
      };
      const options: { value: Filter; label: string }[] = [
        { value: 'design', label: 'Design' },
        { value: 'eng', label: 'Engineering' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
        { value: 'ops', label: 'Operations' },
      ];
      return (
        <Stack gap="3">
          <Inline gap="2" align="center">
            <IconFilter />
            <Text weight="medium">Teams</Text>
          </Inline>
          <Inline gap="2" wrap>
            {options.map((opt) => {
              const isOn = selected.has(opt.value);
              return (
                <Chip
                  key={opt.value}
                  selected={isOn}
                  onSelectedChange={() => toggle(opt.value)}
                  variant={isOn ? 'solid' : 'outline'}
                  colorScheme={isOn ? 'accent' : 'neutral'}
                  leftIcon={isOn ? <IconCheck /> : null}
                >
                  {opt.label}
                </Chip>
              );
            })}
          </Inline>
          <Text size="sm" color="fg.muted">
            {selected.size
              ? `Filtering by: ${Array.from(selected).join(', ')}`
              : 'No filters applied.'}
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const WithIcons: Story = {
  name: 'With leftIcon / rightIcon',
  render: () => (
    <Inline gap="2" wrap>
      <Chip leftIcon={<IconFilter />} colorScheme="accent">
        Filter
      </Chip>
      <Chip rightIcon={<IconChevron />} variant="outline">
        Sort by
      </Chip>
      <Chip leftIcon={<IconCheck />} rightIcon={<IconChevron />} colorScheme="success">
        Active
      </Chip>
    </Inline>
  ),
};

export const Removable: Story = {
  name: 'Removable — chip with onRemove also supports onSelectedChange',
  render: () => {
    type Item = { id: string; label: string; selected: boolean };
    function Demo(): React.ReactElement {
      const [items, setItems] = useState<Item[]>([
        { id: '1', label: 'React', selected: true },
        { id: '2', label: 'TypeScript', selected: false },
        { id: '3', label: 'Storybook', selected: false },
        { id: '4', label: 'vanilla-extract', selected: false },
      ]);
      return (
        <Stack gap="3">
          <Inline gap="2" wrap>
            {items.map((item) => (
              <Chip
                key={item.id}
                selected={item.selected}
                onSelectedChange={(sel) =>
                  setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, selected: sel } : x)))
                }
                onRemove={() => setItems((xs) => xs.filter((x) => x.id !== item.id))}
                variant={item.selected ? 'solid' : 'soft'}
                colorScheme={item.selected ? 'accent' : 'neutral'}
                leftIcon={item.selected ? <IconCheck /> : null}
              >
                {item.label}
              </Chip>
            ))}
          </Inline>
          <Text size="sm" color="fg.muted">
            Click the chip to toggle; click the × to remove it.
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="2" align="center">
      <Chip size="xs">xs</Chip>
      <Chip size="sm">sm</Chip>
      <Chip size="md">md</Chip>
    </Inline>
  ),
};

export const Variants: Story = {
  render: () => (
    <Inline gap="2" align="center">
      <Chip variant="solid" colorScheme="accent" selected>
        solid
      </Chip>
      <Chip variant="soft">soft</Chip>
      <Chip variant="outline">outline</Chip>
      <Chip variant="ghost">ghost</Chip>
    </Inline>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Inline gap="2">
      <Chip disabled>Disabled</Chip>
      <Chip disabled selected colorScheme="accent" variant="solid">
        Disabled selected
      </Chip>
      <Chip disabled onRemove={() => undefined}>
        Disabled + remove
      </Chip>
    </Inline>
  ),
};
