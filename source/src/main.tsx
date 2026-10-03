import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/heebo/hebrew-400.css';
import '@fontsource/heebo/hebrew-700.css';
import '@fontsource/heebo/hebrew-800.css';
import '@fontsource/heebo/hebrew-900.css';
import '@fontsource/assistant/hebrew-400.css';
import '@fontsource/assistant/hebrew-600.css';
import '@fontsource/assistant/hebrew-700.css';
import '@fontsource/heebo/latin-400.css';
import '@fontsource/heebo/latin-700.css';
import '@fontsource/heebo/latin-800.css';
import '@fontsource/assistant/latin-400.css';
import '@fontsource/assistant/latin-700.css';
import './styles.css';
import './mdtable.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
