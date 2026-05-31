import { DirectionProvider, ThemeProvider, TooltipProvider } from '@arshad-shah/cynosure-react';
import type { Decorator, Preview } from '@storybook/react';
import '@arshad-shah/cynosure-tokens/fonts';
import '@arshad-shah/cynosure-tokens/css';
import '@arshad-shah/cynosure-tokens/css/dark';
import '@arshad-shah/cynosure-react/styles.css';
import '@arshad-shah/cynosure-themes/terminal';
import '@arshad-shah/cynosure-themes/high-contrast';
import './storybook.css';

const THEMES = ['system', 'light', 'dark', 'terminal', 'high-contrast'] as const;

const withProviders: Decorator = (Story, context) => {
  const theme = (context.globals.theme as (typeof THEMES)[number]) ?? 'light';
  const dir = (context.globals.direction as 'ltr' | 'rtl') ?? 'ltr';
  return (
    <ThemeProvider
      key={theme}
      defaultTheme={theme}
      themes={[...THEMES]}
      storage={null}
      disableTransitionOnChange
    >
      <TooltipProvider>
        <DirectionProvider dir={dir}>
          <div className="sb-canvas" data-dir={dir}>
            <Story />
          </div>
        </DirectionProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: { test: 'error' },
    layout: 'padded',
    backgrounds: { disable: true },
    options: {
      // Mirror the documentation site's sidebar so Storybook is familiar to
      // navigate: component groups appear in the same top-to-bottom order as
      // the docs, and components within each group follow manifest order rather
      // than Storybook's default alphabetical sort. Each group name is followed
      // by the ordered list of its component leaf names (the second segment of
      // every story `title`).
      //
      // This MUST be a static array literal: Storybook reads `storySort.order`
      // by statically parsing this file (`getStorySortParameter`) — it never
      // executes it — so spreads, imports, or `.flatMap` over the manifest fail
      // with "Unknown node type". The lists below are the rendered form of
      // `components.config.mjs` (`SIDEBAR_GROUPS` × `componentsBySidebarGroup()`),
      // the same source the docs sidebar derives from. Regenerate when the
      // manifest changes; if a new component is missed it still lands in the
      // right group (grouping comes from its story `title`), just ordered after
      // the names listed here.
      storySort: {
        order: [
          'Layout',
          [
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
            'SimpleGrid',
            'Wrap',
          ],
          'Typography',
          ['Blockquote', 'Code', 'Heading', 'Kbd', 'Link', 'List', 'Mark', 'Text'],
          'Buttons',
          ['Button', 'ButtonGroup', 'IconButton', 'Toggle', 'ToggleGroup'],
          'Forms',
          [
            'Input',
            'Textarea',
            'NumberInput',
            'SearchInput',
            'PinInput',
            'TagsInput',
            'Checkbox',
            'CheckboxGroup',
            'Radio',
            'RadioGroup',
            'Switch',
            'Select',
            'MultiSelect',
            'Combobox',
            'Slider',
            'RangeSlider',
            'Rating',
            'Calendar',
            'DatePicker',
            'DateRangePicker',
            'TimePicker',
            'ColorPicker',
            'FileUpload',
            'Label',
            'HelperText',
            'ErrorText',
            'Fieldset',
            'Form',
            'RHF',
          ],
          'Feedback',
          [
            'Alert',
            'Avatar',
            'AvatarGroup',
            'Badge',
            'Callout',
            'Chip',
            'EmptyState',
            'Indicator',
            'Notification',
            'Tag',
          ],
          'Overlays',
          [
            'AlertDialog',
            'CommandPalette',
            'ContextMenu',
            'Dialog',
            'Drawer',
            'DropdownMenu',
            'HoverCard',
            'MenuBar',
            'Popover',
            'Toast',
            'Tooltip',
          ],
          'Navigation',
          [
            'Anchor',
            'BackToTop',
            'Breadcrumb',
            'Menu',
            'NavigationMenu',
            'Pagination',
            'Sidebar',
            'Stepper',
            'Tabs',
          ],
          'Data display',
          [
            'Accordion',
            'Card',
            'Carousel',
            'Chart',
            'CircularProgress',
            'CodeBlock',
            'Collapsible',
            'DataTable',
            'LinearProgress',
            'Resizable',
            'ScrollArea',
            'Skeleton',
            'Spinner',
            'Stat',
            'Table',
            'Timeline',
            'Tree',
          ],
          // Internal dev-only primitives (Portal, Slot, VisuallyHidden) aren't
          // part of the public docs sidebar — keep them grouped at the end.
          'Primitives',
          '*',
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Cynosure theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: THEMES.map((t) => ({ value: t, title: t })),
        dynamicTitle: true,
      },
    },
    direction: {
      description: 'Text direction',
      defaultValue: 'ltr',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR' },
          { value: 'rtl', title: 'RTL' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withProviders],
  tags: ['autodocs'],
};

export default preview;
