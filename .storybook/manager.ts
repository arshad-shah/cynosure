import '@fontsource-variable/geist';
import '@fontsource-variable/jetbrains-mono';
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Branded Storybook manager UI for the Cynosure docs site.
// Accent colors mirror the default library theme (iris) so the manager
// chrome reads as Cynosure regardless of which canvas theme is selected.
const theme = create({
  base: 'dark',
  brandTitle: 'Cynosure UI',
  brandUrl: 'https://cynosure.arshadshah.com',
  brandTarget: '_self',
  brandImage: './brand/cynosure-lockup.svg',

  colorPrimary: '#8b9dff',
  colorSecondary: '#6d7ff5',

  appBg: '#0d0f14',
  appContentBg: '#161b22',
  appPreviewBg: '#0d0f14',
  appBorderColor: '#30363d',
  appBorderRadius: 6,

  textColor: '#e6edf3',
  textInverseColor: '#0d0f14',
  textMutedColor: '#8b949e',

  barTextColor: '#8b949e',
  barSelectedColor: '#8b9dff',
  barHoverColor: '#e6edf3',
  barBg: '#161b22',

  inputBg: '#0d0f14',
  inputBorder: '#30363d',
  inputTextColor: '#e6edf3',
  inputBorderRadius: 4,

  fontBase:
    '"Geist Variable", Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  fontCode:
    '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
});

addons.setConfig({
  theme,
  sidebar: { showRoots: true },
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: true },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});
