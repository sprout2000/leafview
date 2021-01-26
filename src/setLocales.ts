import i18next from 'i18next';

import en from './locales/en.json';
import ja from './locales/ja.json';
/** Merge the pull request sent by PetrTodorov. */
/** https://github.com/sprout2000/leafview/pull/68 */
import cs from './locales/cs.json';
/** Merge the pull request sent by DrDeee. */
/** https://github.com/sprout2000/leafview/pull/166 */
import de from './locales/de.json';
import es from './locales/es.json';

export const setLocales = (locale: string): void => {
  i18next.init({
    lng: locale,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      ja: { translation: ja },
      cs: { translation: cs },
      de: { translation: de },
      es: { translation: es },
    },
  });
};
