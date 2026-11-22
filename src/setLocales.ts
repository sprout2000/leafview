import i18next from "i18next";

import { languages } from "./languages";

/** i18next resources for every language and its regional codes. */
const resources = Object.fromEntries(
  languages.flatMap(({ code, aliases = [], translation }) =>
    [code, ...aliases].map((key) => [key, { translation }]),
  ),
);

export const setLocales = (locale: string) => {
  return i18next.init({
    lng: locale,
    fallbackLng: "en",
    resources,
  });
};
