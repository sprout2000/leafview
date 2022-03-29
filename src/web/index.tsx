import React from 'react';
import { createRoot } from 'react-dom/client';

import { setLocales } from '../setLocales';

import { App } from './App';
import './index.scss';

const locale =
  (window.navigator.languages && window.navigator.languages[0]) ||
  window.navigator.language;

setLocales(locale);

const root = document.getElementById('root');
const app = root && createRoot(root);

app?.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
