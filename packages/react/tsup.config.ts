import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createConfig } from '@lumen/config/tsup.config.base';
import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';

const hookEntries = (): Record<string, string> => {
  const dir = join(process.cwd(), 'src/hooks');
  const entries: Record<string, string> = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.ts') || file === 'index.ts') continue;
    const name = file.replace(/\.ts$/, '');
    entries[`hooks/${name}`] = `src/hooks/${file}`;
  }
  entries['hooks/index'] = 'src/hooks/index.ts';
  return entries;
};

const layoutPrimitives = [
  'Box',
  'Stack',
  'Inline',
  'Flex',
  'Grid',
  'Center',
  'Spacer',
  'Divider',
  'AspectRatio',
  'Container',
  'Section',
] as const;

const primitiveEntries = (): Record<string, string> => {
  const entries: Record<string, string> = {};
  for (const name of layoutPrimitives) {
    entries[name.toLowerCase()] = `src/primitives/layout/${name}/index.ts`;
  }
  return entries;
};

const typographyComponents = [
  'Text',
  'Heading',
  'Code',
  'Kbd',
  'Link',
  'Blockquote',
  'List',
] as const;

const typographyEntries = (): Record<string, string> => {
  const entries: Record<string, string> = {};
  for (const name of typographyComponents) {
    entries[name.toLowerCase()] = `src/typography/${name}/index.ts`;
  }
  return entries;
};

const formsComponents = [
  'Button',
  'IconButton',
  'ButtonGroup',
  'Input',
  'Textarea',
  'NumberInput',
  'Checkbox',
  'CheckboxGroup',
  'Radio',
  'RadioGroup',
  'Switch',
  'Label',
  'HelperText',
  'ErrorText',
  'Fieldset',
  'Select',
  'Combobox',
  'MultiSelect',
  'Slider',
  'RangeSlider',
  'DatePicker',
  'DateRangePicker',
  'TimePicker',
  'ColorPicker',
  'FileUpload',
  'SearchInput',
  'PinInput',
  'TagsInput',
  'Rating',
] as const;

const formsEntries = (): Record<string, string> => {
  const entries: Record<string, string> = {};
  for (const name of formsComponents) {
    entries[name.toLowerCase()] = `src/forms/${name}/index.ts`;
  }
  return entries;
};

const overlayComponents = [
  'Dialog',
  'AlertDialog',
  'Drawer',
  'Popover',
  'HoverCard',
  'Tooltip',
  'Toast',
  'DropdownMenu',
  'ContextMenu',
  'MenuBar',
  'Modal',
] as const;

const overlayEntries = (): Record<string, string> => {
  const entries: Record<string, string> = {};
  for (const name of overlayComponents) {
    entries[name.toLowerCase()] = `src/overlay/${name}/index.ts`;
  }
  return entries;
};

const navigationComponents = [
  'Tabs',
  'Breadcrumb',
  'Pagination',
  'Menu',
  'NavigationMenu',
  'Sidebar',
  'Stepper',
  'Anchor',
  'BackToTop',
] as const;

const navigationEntries = (): Record<string, string> => {
  const entries: Record<string, string> = {};
  for (const name of navigationComponents) {
    entries[name.toLowerCase()] = `src/navigation/${name}/index.ts`;
  }
  return entries;
};

export default createConfig({
  entry: {
    index: 'src/index.ts',
    'theme/index': 'src/theme/index.ts',
    'primitives/index': 'src/primitives/index.ts',
    'typography/index': 'src/typography/index.ts',
    'forms/index': 'src/forms/index.ts',
    'overlay/index': 'src/overlay/index.ts',
    'navigation/index': 'src/navigation/index.ts',
    'utils/index': 'src/utils/index.ts',
    ...hookEntries(),
    ...primitiveEntries(),
    ...typographyEntries(),
    ...formsEntries(),
    ...overlayEntries(),
    ...navigationEntries(),
  },
  esbuildPlugins: [vanillaExtractPlugin()],
  // vanilla-extract emits real CSS — surface it as loose CSS alongside JS
  loader: { '.css': 'copy' },
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-context-menu',
    '@radix-ui/react-dialog',
    '@radix-ui/react-direction',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-hover-card',
    '@radix-ui/react-menubar',
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-radio-group',
    '@radix-ui/react-slot',
    '@radix-ui/react-tabs',
    '@radix-ui/react-switch',
    '@radix-ui/react-tooltip',
    'class-variance-authority',
    'react-aria-components',
    '@internationalized/date',
    'sonner',
  ],
});
