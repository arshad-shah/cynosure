import { CynosureProvider } from '@arshad-shah/cynosure-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// The token CSS resolves `--cynosure-font-family-sans` to "Geist Variable"
// (and `--…-mono` to "JetBrains Mono Variable"). The framework doesn't bundle
// the webfonts — consumers load them. @fontsource-variable ships only the
// @font-face rules + the .woff2 files, so importing here registers the
// families without touching any component CSS.
import '@fontsource-variable/geist';
import '@fontsource-variable/jetbrains-mono';
// Cynosure ships a single-import bundle that contains both the design tokens
// (light + dark) and every component's CSS. Loading it once here lets every
// playground view render with the real production styling.
import '@arshad-shah/cynosure-react/all.css';
import { App } from './App.js';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('No #root element');

createRoot(rootEl).render(
  <StrictMode>
    <CynosureProvider theme={{ defaultTheme: 'light', enableSystem: false }}>
      <App />
    </CynosureProvider>
  </StrictMode>,
);
