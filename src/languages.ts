// Credits for each translation are kept next to its import.
import ar from "./locales/ar.json"; // https://github.com/sprout2000/leafview/pull/274 by SuhaibAtef
import cs from "./locales/cs.json"; // https://github.com/sprout2000/leafview/pull/68 by PetrTodorov
import de from "./locales/de.json"; // https://github.com/sprout2000/leafview/pull/166 by DrDeee
import en from "./locales/en.json";
import es from "./locales/es.json"; // https://github.com/sprout2000/leafview/pull/178 by singuerinc
import fr from "./locales/fr.json"; // https://github.com/sprout2000/leafview/pull/312 by BackSpace54
import hi from "./locales/hi.json"; // https://github.com/sprout2000/leafview/pull/335 by sushant-sonawane121
import hu from "./locales/hu.json"; // https://github.com/sprout2000/leafview/pull/305 by Levminer
import id from "./locales/id.json"; // https://github.com/sprout2000/leafview/pull/344 by fazelllyyy
import it from "./locales/it.json"; // https://github.com/sprout2000/leafview/pull/331 by bovirus
import ja from "./locales/ja.json";
import ko from "./locales/ko.json"; // https://github.com/sprout2000/leafview/pull/344 by fazelllyyy
import ms from "./locales/ms.json"; // https://github.com/sprout2000/leafview/pull/344 by fazelllyyy
import pl from "./locales/pl.json"; // https://github.com/sprout2000/leafview/pull/214 by nukeop
import pt from "./locales/pt.json"; // https://github.com/sprout2000/leafview/pull/232 by guaycuru
import ru from "./locales/ru.json"; // https://github.com/sprout2000/leafview/pull/215 by kitt3911
import tr from "./locales/tr.json"; // https://github.com/sprout2000/leafview/pull/328 by LeaveNhA
import uk from "./locales/uk.json"; // by bigvovan
import zh_CN from "./locales/zh_cn.json"; // https://github.com/sprout2000/leafview/pull/235 by ArcherGu
import zh_TW from "./locales/zh_tw.json";

export type Language = {
  /** The language code used by i18next and saved in the settings. */
  code: string;
  /** The name shown in the Language menu. */
  label: string;
  translation: Record<string, string>;
  /**
   * Regional codes that use the same translation (e.g. "de-AT"), following
   * https://source.chromium.org/chromium/chromium/src/+/main:ui/base/l10n/l10n_util.cc
   */
  aliases?: string[];
};

/**
 * The languages LeafView is translated into, in the order of the Language
 * menu. To add a language, create src/locales/{code}.json and add it here.
 */
export const languages: Language[] = [
  { code: "ar", label: "اللغة العربية", translation: ar },
  { code: "cs", label: "Čeština", translation: cs },
  {
    code: "de",
    label: "Deutsch",
    translation: de,
    aliases: ["de-AT", "de-CH", "de-DE", "de-LI"],
  },
  {
    code: "en",
    label: "English",
    translation: en,
    aliases: [
      "en-AU",
      "en-CA",
      "en-GB",
      "en-IE",
      "en-IN",
      "en-NZ",
      "en-US",
      "en-ZA",
    ],
  },
  {
    code: "es",
    label: "Español",
    translation: es,
    aliases: [
      "es-419",
      "es-AR",
      "es-CL",
      "es-CO",
      "es-CR",
      "es-ES",
      "es-HN",
      "es-MX",
      "es-PE",
      "es-US",
      "es-UY",
      "es-VE",
    ],
  },
  {
    code: "fr",
    label: "Français",
    translation: fr,
    aliases: ["fr-CA", "fr-CH", "fr-FR"],
  },
  { code: "hi", label: "हिंदी", translation: hi },
  { code: "hu", label: "Magyar", translation: hu },
  { code: "id", label: "Bahasa Indonesia", translation: id },
  {
    code: "it",
    label: "Italiano",
    translation: it,
    aliases: ["it-CH", "it-IT"],
  },
  { code: "ja", label: "日本語", translation: ja },
  { code: "ko", label: "한국어", translation: ko },
  { code: "ms", label: "Bahasa Melayu", translation: ms },
  { code: "pl", label: "Polski", translation: pl },
  {
    code: "pt",
    label: "Português",
    translation: pt,
    aliases: ["pt-BR", "pt-PT"],
  },
  { code: "ru", label: "Русский", translation: ru },
  { code: "tr", label: "Türkçe", translation: tr },
  { code: "uk", label: "Українська", translation: uk },
  {
    code: "zh-CN",
    label: "简体中文",
    translation: zh_CN,
    aliases: ["zh"],
  },
  { code: "zh-TW", label: "繁體中文", translation: zh_TW },
];
