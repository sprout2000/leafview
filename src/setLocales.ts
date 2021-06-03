import i18next from 'i18next';

import en from './locales/en.json';
import ja from './locales/ja.json';
/** Merge the pull request sent by PetrTodorov. */
/** https://github.com/sprout2000/leafview/pull/68 */
import cs from './locales/cs.json';
/** Merge the pull request sent by DrDeee. */
/** https://github.com/sprout2000/leafview/pull/166 */
import de from './locales/de.json';
/** Merge the pull request sent by singuerinc */
/** https://github.com/sprout2000/leafview/pull/178 */
import es from './locales/es.json';
/** Merge the pull request sent by nukeop */
/** https://github.com/sprout2000/leafview/pull/214 */
import pl from './locales/pl.json';
/** Merge the pull request sent by kitt3911 */
/** https://github.com/sprout2000/leafview/pull/215 */
import ru from './locales/ru.json';
/** Merge the pull request sent by guaycuru */
/** https://github.com/sprout2000/leafview/pull/232 */
import pt from './locales/pt.json';
import zh_CN from './locales/zh_cn.json';

export const setLocales = (locale: string): void => {
  i18next.init({
    lng: locale,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      ja: { translation: ja },
      cs: { translation: cs },
      de: { translation: de },
      'de-AT': { translation: de },
      'de-CH': { translation: de },
      'de-DE': { translation: de },
      es: { translation: es },
      'es-419': { translation: es },
      pl: { translation: pl },
      ru: { translation: ru },
      pt: { translation: pt },
      'pt-PT': { translation: pt },
      'pt-BR': { translation: pt },
      zh: { translation: zh_CN },
    },
  });
};
