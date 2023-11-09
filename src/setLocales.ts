import i18next from "i18next";

import ar from "./locales/ar.json"; // https://github.com/sprout2000/leafview/pull/274 by SuhaibAtef
import cs from "./locales/cs.json"; // https://github.com/sprout2000/leafview/pull/68 by PetrTodorov
import de from "./locales/de.json"; // https://github.com/sprout2000/leafview/pull/166 by DrDeee
import en from "./locales/en.json";
import es from "./locales/es.json"; // https://github.com/sprout2000/leafview/pull/178 by singuerinc
import fr from "./locales/fr.json"; // https://github.com/sprout2000/leafview/pull/312 by BackSpace54
import hu from "./locales/hu.json"; // https://github.com/sprout2000/leafview/pull/305 by Levminer
import it from "./locales/it.json"; // https://github.com/sprout2000/leafview/pull/331 by bovirus
import ja from "./locales/ja.json";
import pl from "./locales/pl.json"; // https://github.com/sprout2000/leafview/pull/214 by nukeop
import pt from "./locales/pt.json"; // https://github.com/sprout2000/leafview/pull/232 by guaycuru
import tr from "./locales/tr.json"; // https://github.com/sprout2000/leafview/pull/328 by LeaveNhA
import ru from "./locales/ru.json"; // https://github.com/sprout2000/leafview/pull/215 by kitt3911
import zh_CN from "./locales/zh_cn.json"; // https://github.com/sprout2000/leafview/pull/235 by ArcherGu
import zh_TW from "./locales/zh_tw.json";

export const setLocales = (locale: string) => {
  i18next.init({
    lng: locale,
    fallbackLng: "en",
    resources: {
      // https://source.chromium.org/chromium/chromium/src/+/main:ui/base/l10n/l10n_util.cc
      ar: { translation: ar },
      cs: { translation: cs },
      de: { translation: de },
      "de-AT": { translation: de },
      "de-CH": { translation: de },
      "de-DE": { translation: de },
      "de-LI": { translation: de },
      en: { translation: en },
      "en-AU": { translation: en },
      "en-CA": { translation: en },
      "en-GB": { translation: en },
      "en-IE": { translation: en },
      "en-IN": { translation: en },
      "en-NZ": { translation: en },
      "en-US": { translation: en },
      "en-ZA": { translation: en },
      es: { translation: es },
      "es-419": { translation: es },
      "es-AR": { translation: es },
      "es-CL": { translation: es },
      "es-CO": { translation: es },
      "es-CR": { translation: es },
      "es-ES": { translation: es },
      "es-HN": { translation: es },
      "es-MX": { translation: es },
      "es-PE": { translation: es },
      "es-US": { translation: es },
      "es-UY": { translation: es },
      "es-VE": { translation: es },
      fr: { translation: fr },
      "fr-CA": { translation: fr },
      "fr-CH": { translation: fr },
      "fr-FR": { translation: fr },
      hu: { translation: hu },
      it: { translation: it },
      "it-CH": { translation: it },
      "it-IT": { translation: it },
      ja: { translation: ja },
      pl: { translation: pl },
      pt: { translation: pt },
      "pt-BR": { translation: pt },
      "pt-PT": { translation: pt },
      ru: { translation: ru },
      tr: { translation: tr },
      zh: { translation: zh_CN },
      "zh-CN": { translation: zh_CN },
      "zh-TW": { translation: zh_TW },
    },
  });
};
