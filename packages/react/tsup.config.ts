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

    // Prepend `@property` declarations for every layout custom property so
    // none of them inherit. Without this, setting e.g. `position="fixed"` on
    // an outer Flex would set `--cynosure-lp-pos-base: fixed` on that
    // element, all descendants would inherit it, and every descendant's
    // `layoutPropsStyle` would resolve `position: fixed` — collapsing the
    // entire subtree to the same fixed rectangle. `inherits: false` scopes
    // each var to the element it's declared on; inline-style overrides on
    // children still apply because inline styles win against the @property
    // initial value.
    //
    // Generated from the same `LAYOUT_PROPS` × `BP_LADDERS` matrix used by
    // `layoutStyle.css.ts`, kept in lockstep at build time so a new layout
    // prop or breakpoint can't silently leak inheritance again.
    const LAYOUT_VAR_BASES = [
      'cynosure-lp-p',
      'cynosure-lp-px',
      'cynosure-lp-py',
      'cynosure-lp-pt',
      'cynosure-lp-pr',
      'cynosure-lp-pb',
      'cynosure-lp-pl',
      'cynosure-lp-m',
      'cynosure-lp-mx',
      'cynosure-lp-my',
      'cynosure-lp-mt',
      'cynosure-lp-mr',
      'cynosure-lp-mb',
      'cynosure-lp-ml',
      'cynosure-lp-w',
      'cynosure-lp-h',
      'cynosure-lp-minw',
      'cynosure-lp-maxw',
      'cynosure-lp-minh',
      'cynosure-lp-maxh',
      'cynosure-lp-bg',
      'cynosure-lp-fg',
      'cynosure-lp-bc',
      'cynosure-lp-bw',
      'cynosure-lp-bs',
      'cynosure-lp-br',
      'cynosure-lp-sh',
      'cynosure-lp-op',
      'cynosure-lp-ov',
      'cynosure-lp-ovx',
      'cynosure-lp-ovy',
      'cynosure-lp-d',
      'cynosure-lp-pos',
      'cynosure-lp-top',
      'cynosure-lp-right',
      'cynosure-lp-bottom',
      'cynosure-lp-left',
      'cynosure-lp-z',
      'cynosure-lp-gc',
      'cynosure-lp-gr',
      'cynosure-lp-ga',
      'cynosure-lp-flex',
      'cynosure-lp-fg',
      'cynosure-lp-fs',
      'cynosure-lp-fb',
      'cynosure-lp-as',
      'cynosure-lp-js',
      'cynosure-lp-order',
    ];
    const BREAKPOINTS = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];
    const propertyDecls: string[] = [
      '/* @property declarations — element-scoped layout custom properties.',
      ' * Generated by tsup.config.ts; keeps positional / sizing vars from',
      ' * inheriting onto descendants. */',
    ];
    // dedupe — some bases collide (e.g. flex-grow's `lp-fg` vs foreground's
    // `lp-fg`, though they're different aliases). The Set guards against
    // emitting duplicate @property rules which CSS treats as the same.
    const seen = new Set<string>();
    for (const base of LAYOUT_VAR_BASES) {
      for (const bp of BREAKPOINTS) {
        const name = `--${base}-${bp}`;
        if (seen.has(name)) continue;
        seen.add(name);
        propertyDecls.push(
          // syntax "*" allows initial-value to be omitted; that resolves to
          // "the guaranteed-invalid value" so `var(--x)` falls back exactly
          // as if the var were never set.
          `@property ${name} { syntax: "*"; inherits: false; }`,
        );
      }
    }
    chunks.unshift(propertyDecls.join('\n'));

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
    '@arshad-shah/swift-chart',
    '@arshad-shah/swift-chart/react',
    'react-is',
  ],
});
