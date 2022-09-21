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
      /** see: https://source.chromium.org/chromium/chromium/src/+/main:ui/base/l10n/l10n_util.cc */
      ar: { translation: ar },
      cs: { translation: cs },
      de: { translation: de },
      'de-AT': { translation: de },
      'de-CH': { translation: de },
      'de-DE': { translation: de },
      'de-LI': { translation: de },
      en: { translation: en },
      'en-AU': { translation: en },
      'en-CA': { translation: en },
      'en-GB': { translation: en },
      'en-IN': { translation: en },
      'en-NZ': { translation: en },
      'en-US': { translation: en },
      'en-ZA': { translation: en },
      es: { translation: es },
      'es-419': { translation: es },
      'es-AR': { translation: es },
      'es-CL': { translation: es },
      'es-CO': { translation: es },
      'es-CR': { translation: es },
      'es-ES': { translation: es },
      'es-HN': { translation: es },
      'es-MX': { translation: es },
      'es-PE': { translation: es },
      'es-US': { translation: es },
      'es-UY': { translation: es },
      'es-VE': { translation: es },
      fr: { translation: fr },
      'fr-CA': { translation: fr },
      'fr-CH': { translation: fr },
      'fr-FR': { translation: fr },
      hu: { translation: hu },
      ja: { translation: ja },
      pl: { translation: pl },
      pt: { translation: pt },
      'pt-BR': { translation: pt },
      'pt-PT': { translation: pt },
      ru: { translation: ru },
      zh: { translation: zh_CN },
      'zh-CN': { translation: zh_CN },
      'zh-TW': { translation: zh_TW },
    },
  });
};
