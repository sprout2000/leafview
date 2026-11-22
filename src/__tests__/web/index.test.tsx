import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IElectronAPI } from "../../@types/Context";

// Replace <App /> so that only the bootstrap logic of index.tsx is tested.
const renderCount = vi.hoisted(() => ({ value: 0 }));

vi.mock("../../web/App", () => ({
  App: () => {
    renderCount.value += 1;
    return <div data-testid="app">LeafView</div>;
  },
}));

const getLocale = vi.fn(async () => "ja");

/** Imports index.tsx from scratch, as the renderer does on startup. */
const boot = async () => {
  vi.resetModules();
  await act(async () => {
    await import("../../web/index");
  });
};

/** The i18next instance used by index.tsx (after resetModules). */
const getI18n = async () => (await import("i18next")).default;

beforeEach(() => {
  renderCount.value = 0;
  window.myAPI = { getLocale } as unknown as IElectronAPI;

  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
});

afterEach(() => {
  document.getElementById("root")?.remove();
});

describe("index.tsx", () => {
  it("renders <App /> into #root", async () => {
    await boot();

    const app = screen.getByTestId("app");
    expect(document.getElementById("root")).toContainElement(app);
  });

  it("renders <App /> inside StrictMode", async () => {
    await boot();

    // StrictMode renders components twice in development builds.
    expect(renderCount.value).toBe(2);
  });

  it("initializes i18next with the locale from the main process", async () => {
    await boot();

    const i18n = await getI18n();
    expect(getLocale).toHaveBeenCalledTimes(1);
    expect(i18n.language).toBe("ja");
    expect(i18n.t("Next Image")).toBe("次の画像");
  });

  it("falls back to English for an unsupported locale", async () => {
    getLocale.mockResolvedValue("xx");

    await boot();

    const i18n = await getI18n();
    expect(i18n.t("Next Image")).toBe("Next Image");
  });

  it("fails when #root is missing", async () => {
    document.getElementById("root")?.remove();

    await expect(boot()).rejects.toThrow();
  });
});
