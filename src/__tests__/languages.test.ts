import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { languages } from "../languages";

const localesDir = path.join(__dirname, "..", "locales");
const localeFiles = fs
  .readdirSync(localesDir)
  .filter((file) => file.endsWith(".json"));

describe("languages", () => {
  it("has no duplicated codes, including the regional ones", () => {
    const codes = languages.flatMap(({ code, aliases = [] }) => [
      code,
      ...aliases,
    ]);

    expect(new Set(codes).size).toBe(codes.length);
  });

  it("uses each translation file exactly once", async () => {
    const translations = languages.map(({ translation }) => translation);

    for (const file of localeFiles) {
      // Vite needs the extension in the static part of a dynamic import.
      const name = path.basename(file, ".json");
      const { default: json } = await import(`../locales/${name}.json`);

      // forgetting to add a new file to languages.ts fails here
      expect(translations, file).toContain(json);
      expect(new Set(translations).size).toBe(translations.length);
    }
    expect(translations).toHaveLength(localeFiles.length);
  });

  it("has a label for every language", () => {
    for (const { code, label } of languages) {
      expect(label.trim(), code).not.toBe("");
    }
  });
});
