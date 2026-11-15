import type { BrowserWindow, MenuItemConstructorOptions } from "electron";
import type Store from "electron-store";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { createMenu } from "../createMenu";
import { setLocales } from "../setLocales";

const electron = vi.hoisted(() => ({
  app: {
    relaunch: vi.fn(),
    exit: vi.fn(),
    getPath: vi.fn(() => "/home/user/Pictures"),
    showAboutPanel: vi.fn(),
  },
  dialog: {
    showMessageBox: vi.fn(),
    showOpenDialog: vi.fn(),
  },
  Menu: {
    // Return the template itself so that the tests can inspect it.
    buildFromTemplate: vi.fn((template: unknown) => template),
  },
  nativeTheme: { themeSource: "system" },
  shell: { openExternal: vi.fn() },
}));

vi.mock("electron", () => electron);

type Item = MenuItemConstructorOptions;

const originalPlatform = process.platform;

const setPlatform = (platform: NodeJS.Platform) => {
  Object.defineProperty(process, "platform", { value: platform });
};

const flatten = (items: Item[]): Item[] =>
  items.flatMap((item) => [
    item,
    ...(Array.isArray(item.submenu) ? flatten(item.submenu as Item[]) : []),
  ]);

const createWin = () => ({
  webContents: { send: vi.fn() },
  isMaximized: vi.fn(() => false),
  maximize: vi.fn(),
  unmaximize: vi.fn(),
});

const createStore = (initial: Partial<StoreType> = {}) => {
  const data = new Map<string, unknown>(Object.entries(initial));
  return {
    get: vi.fn((key: string) => data.get(key)),
    set: vi.fn((key: string, value: unknown) => {
      data.set(key, value);
    }),
  };
};

const build = (
  win = createWin(),
  store = createStore({ language: "en", darkmode: true }),
) => {
  const template = createMenu(
    win as unknown as BrowserWindow,
    store as unknown as Store<StoreType>,
  ) as unknown as Item[];

  return { template, items: flatten(template), win, store };
};

const click = (item: Item | undefined) => {
  expect(item, "menu item").toBeDefined();
  (item?.click as () => unknown)();
};

const flush = () => new Promise((resolve) => setImmediate(resolve));

beforeAll(async () => {
  await setLocales("en");
});

beforeEach(() => {
  electron.nativeTheme.themeSource = "system";
});

afterEach(() => {
  setPlatform(originalPlatform);
});

describe("createMenu", () => {
  it.each([
    ["J", "menu-next"],
    ["Ctrl+N", "menu-next"],
    ["CmdOrCtrl+Right", "menu-next"],
    ["K", "menu-prev"],
    ["Ctrl+P", "menu-prev"],
    ["CmdOrCtrl+Left", "menu-prev"],
    ["H", "toggle-grid"],
    ["Ctrl+G", "toggle-grid"],
    ["Delete", "menu-remove"],
  ])("sends the IPC message for %s", (accelerator, channel) => {
    const { items, win } = build();

    click(items.find((item) => item.accelerator === accelerator));

    expect(win.webContents.send).toHaveBeenCalledWith(channel);
  });

  it("adds the application menu on macOS", () => {
    setPlatform("darwin");
    const { template, items } = build();

    expect(template.map((item) => item.label)).toEqual([
      "LeafView",
      "File",
      "View",
      "Window",
      "Help",
    ]);
    expect(items.some((item) => item.role === "quit")).toBe(true);
    expect(items.find((item) => item.role === "close")?.accelerator).toBe(
      "Cmd+W",
    );
  });

  it("puts About in the Help menu on other platforms", () => {
    setPlatform("win32");
    const { template, items } = build();

    expect(template.map((item) => item.label)).toEqual([
      "File",
      "View",
      "Window",
      "Help",
    ]);

    const help = template.find((item) => item.role === "help");
    const helpLabels = (help?.submenu as Item[]).map((item) => item.label);
    expect(helpLabels).toContain("About");

    expect(
      items.find((item) => item.role === "togglefullscreen")?.accelerator,
    ).toBe("F11");
  });

  it("shows the about panel", () => {
    const { items } = build();

    click(items.find((item) => item.accelerator === "CmdOrCtrl+I"));

    expect(electron.app.showAboutPanel).toHaveBeenCalled();
  });

  it("opens the support page", async () => {
    electron.shell.openExternal.mockResolvedValue(undefined);
    const { items } = build();

    const support = items.find((item) => item.label === "Support URL...");
    expect(support, "menu item").toBeDefined();
    await (support?.click as () => Promise<void>)();

    expect(electron.shell.openExternal).toHaveBeenCalledWith(
      "https://github.com/sprout2000/leafview/#readme",
    );
  });

  it("toggles the window size with Zoom", () => {
    const { items, win } = build();
    const zoom = items.find((item) => item.label === "Zoom");

    click(zoom);
    expect(win.maximize).toHaveBeenCalled();

    win.isMaximized.mockReturnValue(true);
    click(zoom);
    expect(win.unmaximize).toHaveBeenCalled();
  });

  describe("dark mode", () => {
    it("reflects the stored setting", () => {
      const { items } = build(
        createWin(),
        createStore({ language: "en", darkmode: false }),
      );

      const item = items.find((i) => i.accelerator === "CmdOrCtrl+T");
      expect(item?.checked).toBe(false);
    });

    it("switches the theme and saves the setting", () => {
      const store = createStore({ language: "en", darkmode: true });
      const { items } = build(createWin(), store);

      click(items.find((item) => item.accelerator === "CmdOrCtrl+T"));

      expect(electron.nativeTheme.themeSource).toBe("light");
      expect(store.set).toHaveBeenCalledWith("darkmode", false);
    });
  });

  describe("language", () => {
    const langItem = (items: Item[], code: string) =>
      items.find((item) => item.id === `language-${code}`);

    it("lists 20 languages and checks the current one", () => {
      const { items } = build(
        createWin(),
        createStore({ language: "ja", darkmode: true }),
      );

      const languages = items.filter((item) =>
        item.id?.startsWith("language-"),
      );
      expect(languages).toHaveLength(20);
      expect(languages.filter((item) => item.checked).map((i) => i.id)).toEqual(
        ["language-ja"],
      );
    });

    it("does nothing when the current language is selected", () => {
      const { items, store } = build();

      click(langItem(items, "en"));

      expect(store.set).not.toHaveBeenCalled();
      expect(electron.dialog.showMessageBox).not.toHaveBeenCalled();
    });

    it("saves the language and relaunches when OK is chosen", async () => {
      electron.dialog.showMessageBox.mockResolvedValue({ response: 0 });
      const { items, store } = build();

      click(langItem(items, "ja"));
      await flush();
      await flush();

      expect(store.set).toHaveBeenCalledWith("language", "ja");
      expect(electron.app.relaunch).toHaveBeenCalled();
      expect(electron.app.exit).toHaveBeenCalledWith(0);
    });

    it("saves the language without relaunching when Later is chosen", async () => {
      electron.dialog.showMessageBox.mockResolvedValue({ response: 1 });
      const { items, store } = build();

      click(langItem(items, "de"));
      await flush();
      await flush();

      expect(store.set).toHaveBeenCalledWith("language", "de");
      expect(electron.app.relaunch).not.toHaveBeenCalled();
    });
  });

  describe("Open...", () => {
    const open = async (
      result: { canceled: boolean; filePaths: string[] },
      platform: NodeJS.Platform = "darwin",
    ) => {
      setPlatform(platform);
      electron.dialog.showOpenDialog.mockResolvedValue(result);
      const { items, win } = build();

      click(items.find((item) => item.accelerator === "CmdOrCtrl+O"));
      await flush();

      return win;
    };

    it("sends the selected file to the renderer", async () => {
      const win = await open({ canceled: false, filePaths: ["/pics/a.png"] });

      expect(electron.dialog.showOpenDialog).toHaveBeenCalledWith(
        win,
        expect.objectContaining({
          defaultPath: "/home/user/Pictures",
          properties: ["openFile"],
        }),
      );
      expect(win.webContents.send).toHaveBeenCalledWith(
        "menu-open",
        "/pics/a.png",
      );
    });

    it("does nothing when the dialog is canceled", async () => {
      const win = await open({ canceled: true, filePaths: [] });

      expect(win.webContents.send).not.toHaveBeenCalled();
    });

    it("ignores dotfiles on macOS", async () => {
      const win = await open({
        canceled: false,
        filePaths: ["/pics/.hidden.png"],
      });

      expect(win.webContents.send).not.toHaveBeenCalled();
    });

    it("logs the error when the dialog fails", async () => {
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      setPlatform("darwin");
      const error = new Error("boom");
      electron.dialog.showOpenDialog.mockRejectedValue(error);
      const { items, win } = build();

      click(items.find((item) => item.accelerator === "CmdOrCtrl+O"));
      await flush();

      expect(log).toHaveBeenCalledWith(error);
      expect(win.webContents.send).not.toHaveBeenCalled();
    });

    it("ignores AppleDouble files on other platforms", async () => {
      const win = await open(
        { canceled: false, filePaths: ["/pics/._a.png"] },
        "linux",
      );

      expect(win.webContents.send).not.toHaveBeenCalled();
    });
  });
});
