import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Branded Storybook manager UI for the Cynosure docs site.
// Colours mirror the `@arshad-shah/cynosure-themes/terminal` palette so the manager chrome
// matches the canvas when the terminal theme is active, and stays legible
// against the other themes.
const theme = create({
  base: 'dark',
  brandTitle: 'Cynosure UI',
  brandUrl: 'https://cynosure.arshadshah.com',
  brandTarget: '_self',
  brandImage: './brand/cynosure-lockup.svg',

  colorPrimary: '#388bfd',
  colorSecondary: '#388bfd',

  appBg: '#0d0f14',
  appContentBg: '#161b22',
  appPreviewBg: '#0d0f14',
  appBorderColor: '#30363d',
  appBorderRadius: 6,

  textColor: '#e6edf3',
  textInverseColor: '#0d0f14',
  textMutedColor: '#8b949e',

  barTextColor: '#8b949e',
  barSelectedColor: '#388bfd',
  barHoverColor: '#e6edf3',
  barBg: '#161b22',

  inputBg: '#0d0f14',
  inputBorder: '#30363d',
  inputTextColor: '#e6edf3',
  inputBorderRadius: 4,

  fontBase: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontCode: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
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
