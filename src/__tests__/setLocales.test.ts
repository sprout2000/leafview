import fs from "node:fs";
import path from "node:path";

import i18next from "i18next";
import { describe, expect, it } from "vitest";

import { languages } from "../languages";
import en from "../locales/en.json";
import { setLocales } from "../setLocales";

const localesDir = path.join(__dirname, "..", "locales");
const localeFiles = fs
  .readdirSync(localesDir)
  .filter((file) => file.endsWith(".json"));

describe("setLocales", () => {
  it.each([
    ["en", "Next Image"],
    ["ja", "次の画像"],
    ["de-AT", "Nächstes Bild"],
    ["zh-CN", "下一张图片"],
    ["zh-TW", "下一張圖片"],
    ["pt-BR", "Próxima Imagem"],
  ])("translates into %s", async (locale, expected) => {
    await setLocales(locale);

    expect(i18next.t("Next Image")).toBe(expected);
  });

  it("falls back to the base language of a regional code", async () => {
    await setLocales("ja-JP");

    expect(i18next.t("Next Image")).toBe("次の画像");
  });

  it("falls back to English for unsupported languages", async () => {
    await setLocales("xx");

    expect(i18next.t("Next Image")).toBe("Next Image");
  });

  it.each(languages.map(({ code }) => code))(
    "has resources for the menu language %s",
    async (code) => {
      await setLocales(code);

      expect(i18next.hasResourceBundle(code, "translation")).toBe(true);
    },
  );
});

describe("locale files", () => {
  const enKeys = Object.keys(en).sort();

  it.each(localeFiles)("%s has the same keys as en.json", (file) => {
    const json = JSON.parse(
      fs.readFileSync(path.join(localesDir, file), "utf-8"),
    ) as Record<string, string>;

    expect(Object.keys(json).sort()).toEqual(enKeys);
  });

  it.each(localeFiles)("%s has no empty translations", (file) => {
    const json = JSON.parse(
      fs.readFileSync(path.join(localesDir, file), "utf-8"),
    ) as Record<string, string>;

    for (const [key, value] of Object.entries(json)) {
      expect(value.trim(), key).not.toBe("");
    }
  });

  // Words that are the same as in English in these languages.
  const sameAsEnglish: Record<string, string[]> = {
    "de.json": ["Zoom"],
    "es.json": ["Zoom"],
    "fr.json": ["Zoom"],
    "hu.json": ["Zoom"],
    "it.json": ["File", "Zoom"],
    "pl.json": ["Zoom"],
    "pt.json": ["Zoom"],
  };

  it.each(localeFiles.filter((file) => file !== "en.json"))(
    "%s has no untranslated English text",
    (file) => {
      const json = JSON.parse(
        fs.readFileSync(path.join(localesDir, file), "utf-8"),
      ) as Record<string, string>;

      const untranslated = Object.keys(en).filter(
        (key) =>
          json[key] === en[key as keyof typeof en] &&
          !sameAsEnglish[file]?.includes(key),
      );

      expect(untranslated).toEqual([]);
    },
  );
});
