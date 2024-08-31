type Code =
  | "ar"
  | "cs"
  | "de"
  | "en"
  | "es"
  | "fr"
  | "hi"
  | "hu"
  | "it"
  | "ja"
  | "pl"
  | "pt"
  | "ru"
  | "tr"
  | "uk"
  | "zh-CN"
  | "zh-TW";

declare type Locale = {
  code: Code;
  value: string;
};
