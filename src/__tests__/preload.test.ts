import { describe, expect, it, vi } from "vitest";

import type { IElectronAPI } from "../@types/Context";

const electron = vi.hoisted(() => ({
  contextBridge: { exposeInMainWorld: vi.fn() },
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  webUtils: { getPathForFile: vi.fn() },
}));

vi.mock("electron", () => electron);

import "../preload";

// Captured before the first test, because mockReset clears the call history.
const [exposedName, api] = electron.contextBridge.exposeInMainWorld.mock
  .calls[0] as [string, IElectronAPI];

describe("preload.ts", () => {
  it("exposes the API as window.myAPI", () => {
    expect(exposedName).toBe("myAPI");
    expect(Object.keys(api).sort()).toEqual(
      [
        "showFilePath",
        "getLocale",
        "contextMenu",
        "history",
        "mimecheck",
        "dirname",
        "readdir",
        "moveToTrash",
        "openDialog",
        "updateTitle",
        "menuNext",
        "menuPrev",
        "menuRemove",
        "menuOpen",
        "toggleGrid",
      ].sort(),
    );
  });

  it("showFilePath returns the path of a dropped file", () => {
    electron.webUtils.getPathForFile.mockReturnValue("/pics/a.png");
    const file = { name: "a.png" } as File;

    expect(api.showFilePath(file)).toBe("/pics/a.png");
    expect(electron.webUtils.getPathForFile).toHaveBeenCalledWith(file);
  });

  describe("invoke", () => {
    const cases: [keyof IElectronAPI, string, unknown[]][] = [
      ["getLocale", "get-locale", []],
      ["contextMenu", "show-context-menu", []],
      ["history", "file-history", ["/pics/a.png"]],
      ["mimecheck", "mime-check", ["/pics/a.png"]],
      ["dirname", "dirname", ["/pics/a.png"]],
      ["readdir", "readdir", ["/pics"]],
      ["moveToTrash", "move-to-trash", ["/pics/a.png"]],
      ["openDialog", "open-dialog", []],
      ["updateTitle", "update-title", ["/pics/a.png"]],
    ];

    it.each(cases)(
      "%s invokes the %s channel",
      async (method, channel, args) => {
        electron.ipcRenderer.invoke.mockResolvedValue("result");

        const fn = api[method] as (...a: unknown[]) => Promise<unknown>;

        await expect(fn(...args)).resolves.toBe("result");
        expect(electron.ipcRenderer.invoke).toHaveBeenCalledWith(
          channel,
          ...args,
        );
      },
    );
  });

  describe("listeners", () => {
    const cases: [keyof IElectronAPI, string][] = [
      ["menuNext", "menu-next"],
      ["menuPrev", "menu-prev"],
      ["menuRemove", "menu-remove"],
      ["menuOpen", "menu-open"],
      ["toggleGrid", "toggle-grid"],
    ];

    it.each(cases)(
      "%s listens to %s and can unsubscribe",
      (method, channel) => {
        const listener = vi.fn(async () => {});
        const subscribe = api[method] as (l: typeof listener) => () => void;

        const unsubscribe = subscribe(listener);

        expect(electron.ipcRenderer.on).toHaveBeenCalledWith(channel, listener);
        expect(electron.ipcRenderer.removeAllListeners).not.toHaveBeenCalled();

        unsubscribe();

        expect(electron.ipcRenderer.removeAllListeners).toHaveBeenCalledWith(
          channel,
        );
      },
    );
  });
});
