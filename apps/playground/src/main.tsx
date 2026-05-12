import { CynosureProvider } from '@arshad-shah/cynosure-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
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
