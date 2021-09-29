import ReactDOM from 'react-dom';

import { setLocales } from '../setLocales';

import { App } from './components/App';
import './index.scss';

const locale =
  (window.navigator.languages && window.navigator.languages[0]) ||
  window.navigator.language;

setLocales(locale);

ReactDOM.render(<App />, document.getElementById('root'));
