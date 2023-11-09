type Code =
  | "ar"
  | "cs"
  | "de"
  | "en"
  | "es"
  | "fr"
  | "hu"
  | "it"
  | "ja"
  | "pl"
  | "pt"
  | "ru"
  | "tr"
  | "zh-CN"
  | "zh-TW";

declare type Locale = {
  code: Code;
  value: string;
};
