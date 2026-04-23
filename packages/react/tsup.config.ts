import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createConfig } from '@arshad-shah/cynosure-config/tsup.config.base';
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
  'Calendar',
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
  'CommandPalette',
] as const;

const overlayEntries = (): Record<string, string> => {
  const entries: Record<string, string> = {};
  for (const name of overlayComponents) {
    const key = name === 'CommandPalette' ? 'command-palette' : name.toLowerCase();
    entries[key] = `src/overlay/${name}/index.ts`;
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

const feedbackComponents = [
  'Badge',
  'Tag',
  'Chip',
  'Avatar',
  'AvatarGroup',
  'Alert',
  'Banner',
  'Notification',
  'Callout',
  'EmptyState',
  'Toggle',
  'ToggleGroup',
] as const;

const feedbackEntries = (): Record<string, string> => {
  const entries: Record<string, string> = {};
  for (const name of feedbackComponents) {
    const key =
      name === 'AvatarGroup'
        ? 'avatar-group'
        : name === 'EmptyState'
          ? 'empty-state'
          : name === 'ToggleGroup'
            ? 'toggle-group'
            : name.toLowerCase();
    entries[key] = `src/feedback/${name}/index.ts`;
  }
  return entries;
};

const dataDisplayComponents = [
  'Card',
  'Table',
  'DataTable',
  'Tree',
  'Timeline',
  'Stat',
  'LinearProgress',
  'CircularProgress',
  'Skeleton',
  'Spinner',
  'Accordion',
  'Collapsible',
  'ScrollArea',
  'Resizable',
  'CodeBlock',
  'Carousel',
  'Chart',
] as const;

const dataDisplayEntries = (): Record<string, string> => {
  const entries: Record<string, string> = {};
  for (const name of dataDisplayComponents) {
    // Kebab-cased entries for multi-word names so the build output matches
    // the subpath exports (`/linear-progress`, `/code-block`, etc.).
    const key =
      name === 'DataTable'
        ? 'data-table'
        : name === 'ScrollArea'
          ? 'scroll-area'
          : name === 'CodeBlock'
            ? 'code-block'
            : name === 'LinearProgress'
              ? 'linear-progress'
              : name === 'CircularProgress'
                ? 'circular-progress'
                : name.toLowerCase();
    entries[key] = `src/data-display/${name}/index.ts`;
  }
  return entries;
};

export default createConfig({
  entry: {
    index: 'src/index.ts',
    'theme/index': 'src/theme/index.ts',
    'primitives/index': 'src/primitives/index.ts',
    'typography/index': 'src/typography/index.ts',
    form: 'src/forms/Form/index.ts',
    rhf: 'src/forms/Form/rhf/index.ts',
    'forms/index': 'src/forms/index.ts',
    'overlay/index': 'src/overlay/index.ts',
    'navigation/index': 'src/navigation/index.ts',
    'data-display/index': 'src/data-display/index.ts',
    'feedback/index': 'src/feedback/index.ts',
    'utils/index': 'src/utils/index.ts',
    ...hookEntries(),
    ...primitiveEntries(),
    ...typographyEntries(),
    ...formsEntries(),
    ...overlayEntries(),
    ...navigationEntries(),
    ...dataDisplayEntries(),
    ...feedbackEntries(),
  },
  esbuildPlugins: [vanillaExtractPlugin()],
  loader: { '.css': 'copy' },
  async onSuccess() {
    const { readdir, readFile, writeFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const { createRequire } = await import('node:module');
    const dist = join(process.cwd(), 'dist');
    const files = (await readdir(dist))
      .filter((f) => f.endsWith('.css') && f !== 'styles.css' && f !== 'all.css')
      .sort();
    const chunks: string[] = [];
    for (const file of files) {
      chunks.push(`/* ${file} */`);
      chunks.push(await readFile(join(dist, file), 'utf8'));
    }
    const stylesCss = chunks.join('\n');
    await writeFile(join(dist, 'styles.css'), stylesCss);

    // Additionally emit `all.css`: a single-import bundle that includes design
    // tokens (light + dark overrides) alongside every component's CSS. This is
    // the zero-config path — consumers import one file instead of three.
    const require = createRequire(import.meta.url);
    const tokensPkgJson = require.resolve('@arshad-shah/cynosure-tokens/package.json');
    const tokensDist = join(tokensPkgJson, '..', 'dist', 'css');
    const baseCss = await readFile(join(tokensDist, 'base.css'), 'utf8');
    const darkCss = await readFile(join(tokensDist, 'dark.css'), 'utf8');
    const allCss = [
      '/* @arshad-shah/cynosure-tokens/css (base) */',
      baseCss,
      '/* @arshad-shah/cynosure-tokens/css/dark */',
      darkCss,
      '/* @arshad-shah/cynosure-react/styles.css */',
      stylesCss,
    ].join('\n');
    await writeFile(join(dist, 'all.css'), allCss);
  },
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
    '@radix-ui/react-accordion',
    '@radix-ui/react-collapsible',
    '@radix-ui/react-scroll-area',
    '@tanstack/react-table',
    '@radix-ui/react-avatar',
    '@radix-ui/react-toggle',
    '@radix-ui/react-toggle-group',
    'react-resizable-panels',
    'shiki',
    'react-hook-form',
    'cmdk',
    'embla-carousel-react',
    'embla-carousel',
    'recharts',
    'react-is',
  ],
});
