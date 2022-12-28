import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setLocales } from '../setLocales';
import { App } from './components/App';
import { GalleryContextProvider } from './providers/GalleryContext';
import './index.scss';

const initLocale = async () => {
  const locale = await window.myAPI.getLocale();
  setLocales(locale);
};

initLocale();

createRoot(document.getElementById('root') as Element).render(
  <StrictMode>
    <GalleryContextProvider>
      <App />
    </GalleryContextProvider>
  </StrictMode>,
);
