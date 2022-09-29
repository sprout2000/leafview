import React from 'react';
import ReactDOM from 'react-dom/client';

import { setLocales } from '../setLocales';

import { App } from './App';
import './index.scss';

const initLocale = async () => {
  const locale = await window.myAPI.getLocale();
  setLocales(locale);
};

initLocale();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
