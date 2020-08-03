import React from 'react';
import ReactDOM from 'react-dom';

import i18next from 'i18next';
import en from './locales/en.json';
import ja from './locales/ja.json';

import App from './App';
import './styles.scss';

const locale =
  (window.navigator.languages && window.navigator.languages[0]) ||
  window.navigator.language;

i18next.init({
  lng: locale,
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
});

ReactDOM.render(<App />, document.getElementById('root'));
