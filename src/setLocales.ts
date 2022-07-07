import i18next from 'i18next';

import en from './locales/en.json';
import ja from './locales/ja.json';
import zh_TW from './locales/zh_tw.json';
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
/** Merge the pull request sent by ArcherGu */
/** https://github.com/sprout2000/leafview/pull/235 */
import zh_CN from './locales/zh_cn.json';
/** Merge the pull request sent by SuhaibAtef */
/** https://github.com/sprout2000/leafview/pull/274 */
import ar from './locales/ar.json';
/** Merge the pull request sent by Levminer */
/** https://github.com/sprout2000/leafview/pull/305 */
import hu from './locales/hu.json';
/** Merge the pull request sent by BackSpace54 */
/** https://github.com/sprout2000/leafview/pull/312 */
import fr from './locales/fr.json';

export const setLocales = (locale: string) => {
  i18next.init({
    lng: locale,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      'en-AU': { translation: en },
      'en-BZ': { translation: en },
      'en-CA': { translation: en },
      'en-IE': { translation: en },
      'en-JM': { translation: en },
      'en-NZ': { translation: en },
      'en-PH': { translation: en },
      'en-ZA': { translation: en },
      'en-TT': { translation: en },
      'en-GB': { translation: en },
      'en-US': { translation: en },
      'en-ZW': { translation: en },
      ja: { translation: ja },
      cs: { translation: cs },
      de: { translation: de },
      'de-AT': { translation: de },
      'de-DE': { translation: de },
      'de-LI': { translation: de },
      'de-LU': { translation: de },
      'de-CH': { translation: de },
      es: { translation: es },
      'es-AR': { translation: es },
      'es-BO': { translation: es },
      'es-CL': { translation: es },
      'es-CO': { translation: es },
      'es-CR': { translation: es },
      'es-DE': { translation: es },
      'es-EC': { translation: es },
      'es-SV': { translation: es },
      'es-GT': { translation: es },
      'es-HN': { translation: es },
      'es-MX': { translation: es },
      'es-NI': { translation: es },
      'es-PA': { translation: es },
      'es-PY': { translation: es },
      'es-PE': { translation: es },
      'es-PR': { translation: es },
      'es-ES': { translation: es },
      'es-UY': { translation: es },
      'es-VE': { translation: es },
      pl: { translation: pl },
      ru: { translation: ru },
      pt: { translation: pt },
      'pt-PT': { translation: pt },
      'pt-BR': { translation: pt },
      zh: { translation: zh_CN },
      'zh-CN': { translation: zh_CN },
      'zh-TW': { translation: zh_TW },
      ar: { translation: ar },
      hu: { translation: hu },
      fr: { translation: fr },
      'fr-BE': { translation: fr },
      'fr-CA': { translation: fr },
      'fr-FR': { translation: fr },
      'fr-LU': { translation: fr },
      'fr-MC': { translation: fr },
      'fr-CH': { translation: fr },
    },
  });
};
