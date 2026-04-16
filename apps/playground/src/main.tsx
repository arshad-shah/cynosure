import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@lumen/tokens/css';
import '@lumen/tokens/css/dark';
import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element missing');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
