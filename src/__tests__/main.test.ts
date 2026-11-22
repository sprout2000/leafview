import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// biome-ignore lint/suspicious/noExplicitAny: test helper
type Fn = (...args: any[]) => any;

const h = vi.hoisted(() => {
  type Listener = { cb: Fn; once: boolean };

  /** Minimal EventEmitter that supports on / once. */
  const createEmitter = () => {
    const listeners = new Map<string, Listener[]>();
    return {
      listeners,
      on: (event: string, cb: Fn) => {
        listeners.set(event, [
          ...(listeners.get(event) ?? []),
          { cb, once: false },
        ]);
      },
      once: (event: string, cb: Fn) => {
        listeners.set(event, [
          ...(listeners.get(event) ?? []),
          { cb, once: true },
        ]);
      },
      emit: (event: string, ...args: unknown[]) => {
        const list = listeners.get(event) ?? [];
        listeners.set(
          event,
          list.filter((l) => !l.once),
        );
        return list.map((l) => l.cb(...args));
      },
      has: (event: string) => (listeners.get(event) ?? []).length > 0,
    };
  };

  const state = {
    app: createEmitter(),
    updater: createEmitter(),
    handlers: new Map<string, Fn>(),
    windows: [] as FakeWindow[],
    store: new Map<string, unknown>(),
    resolveReady: () => {},
    onDirChange: (_dir: string) => {},
    readyPromise: Promise.resolve(),
  };

  class FakeWindow {
    events = createEmitter();
    contents = createEmitter();
    webContents = {
      once: vi.fn((event: string, cb: Fn) => this.contents.once(event, cb)),
      send: vi.fn(),
      openDevTools: vi.fn(),
    };
    once = vi.fn((event: string, cb: Fn) => {
      this.events.once(event, cb);
      return this;
    });
    loadFile = vi.fn();
    show = vi.fn();
    setTitle = vi.fn();
    isMinimized = vi.fn(() => false);
    restore = vi.fn();
    focus = vi.fn();
    getBounds = vi.fn(() => ({ x: 10, y: 20, width: 1000, height: 700 }));

    constructor(public options: Record<string, unknown>) {
      state.windows.push(this);
    }
  }

  class FakeStore {
    constructor({ defaults }: { defaults: Record<string, unknown> }) {
      for (const [key, value] of Object.entries(defaults)) {
        if (!state.store.has(key)) state.store.set(key, value);
      }
    }
    get(key: string) {
      return state.store.get(key);
    }
    set(key: string | Record<string, unknown>, value?: unknown) {
      if (typeof key === "string") {
        state.store.set(key, value);
      } else {
        for (const [k, v] of Object.entries(key)) state.store.set(k, v);
      }
    }
  }

  const menu = { popup: vi.fn() };
  const dirWatcher = { watch: vi.fn(), close: vi.fn() };

  const electron = {
    app: {
      name: "LeafView",
      on: vi.fn((event: string, cb: Fn) => state.app.on(event, cb)),
      once: vi.fn((event: string, cb: Fn) => state.app.once(event, cb)),
      whenReady: vi.fn(() => state.readyPromise),
      getLocale: vi.fn(() => "en"),
      getPath: vi.fn(() => "/home/user/Pictures"),
      getVersion: vi.fn(() => "4.5.4"),
      setAboutPanelOptions: vi.fn(),
      addRecentDocument: vi.fn(),
      exit: vi.fn(),
    },
    BrowserWindow: FakeWindow,
    dialog: {
      showOpenDialog: vi.fn(),
      showMessageBox: vi.fn(),
    },
    ipcMain: {
      handle: vi.fn((channel: string, cb: Fn) => {
        state.handlers.set(channel, cb);
      }),
    },
    Menu: { setApplicationMenu: vi.fn() },
    nativeTheme: { themeSource: "system" },
    shell: {
      trashItem: vi.fn(async () => {}),
      beep: vi.fn(),
    },
  };

  const autoUpdater = {
    logger: null as unknown,
    autoDownload: true,
    checkForUpdates: vi.fn(),
    downloadUpdate: vi.fn(),
    quitAndInstall: vi.fn(),
    once: vi.fn((event: string, cb: Fn) => state.updater.once(event, cb)),
  };

  return {
    state,
    menu,
    electron,
    autoUpdater,
    FakeStore,
    log: { log: vi.fn(), info: vi.fn() },
    createMenu: vi.fn(() => menu),
    setLocales: vi.fn(),
    installExtension: vi.fn(),
    dirWatcher,
    createDirWatcher: vi.fn((onChange: (dir: string) => void) => {
      state.onDirChange = onChange;
      return dirWatcher;
    }),
  };
});

vi.mock("electron", () => h.electron);
vi.mock("electron-store", () => ({ default: h.FakeStore }));
vi.mock("electron-log", () => ({ default: h.log }));
vi.mock("electron-updater", () => ({ autoUpdater: h.autoUpdater }));
vi.mock("electron-devtools-installer", () => ({
  installExtension: h.installExtension,
  REACT_DEVELOPER_TOOLS: "react-developer-tools",
}));
vi.mock("i18next", () => ({ default: { t: (key: string) => key } }));
vi.mock("../createMenu", () => ({ createMenu: h.createMenu }));
vi.mock("../setLocales", () => ({ setLocales: h.setLocales }));
vi.mock("../dirWatcher", () => ({ createDirWatcher: h.createDirWatcher }));

const RESOURCES_PATH = "/opt/LeafView/resources";

const original = {
  platform: process.platform,
  argv: process.argv,
  nodeEnv: process.env.NODE_ENV,
  consoleLog: console.log,
};

const setPlatform = (platform: NodeJS.Platform) => {
  Object.defineProperty(process, "platform", { value: platform });
};

const flush = () => new Promise((resolve) => setImmediate(resolve));

type LoadOptions = {
  platform?: NodeJS.Platform;
  argv?: string[];
  env?: string;
  store?: Partial<StoreType>;
  /** Runs after main.ts is imported and before app.whenReady() resolves. */
  beforeReady?: () => void;
};

/** Imports main.ts from scratch and waits until the window is created. */
const load = async ({
  platform = "linux",
  argv = ["/opt/LeafView/leafview"],
  env = "test",
  store = {},
  beforeReady,
}: LoadOptions = {}) => {
  setPlatform(platform);
  process.argv = argv;
  process.env.NODE_ENV = env;

  for (const [key, value] of Object.entries(store))
    h.state.store.set(key, value);

  h.state.readyPromise = new Promise<void>((resolve) => {
    h.state.resolveReady = resolve;
  });

  vi.resetModules();
  await import("../main");

  beforeReady?.();
  h.state.resolveReady();
  await flush();

  const win = h.state.windows.at(-1);
  if (!win) throw new Error("BrowserWindow was not created");

  const invoke = (channel: string, ...args: unknown[]) => {
    const handler = h.state.handlers.get(channel);
    if (!handler) throw new Error(`no handler for ${channel}`);
    return handler({}, ...args);
  };

  return { win, invoke };
};

const fakeEvent = () => ({ preventDefault: vi.fn() });

beforeAll(() => {
  Object.defineProperty(process, "resourcesPath", {
    value: RESOURCES_PATH,
    configurable: true,
  });
});

beforeEach(() => {
  h.state.app.listeners.clear();
  h.state.updater.listeners.clear();
  h.state.handlers.clear();
  h.state.windows.length = 0;
  h.state.store.clear();
  h.electron.nativeTheme.themeSource = "system";
  h.autoUpdater.logger = null;
  h.autoUpdater.autoDownload = true;
});

afterEach(() => {
  setPlatform(original.platform);
  process.argv = original.argv;
  process.env.NODE_ENV = original.nodeEnv;
  // main.ts replaces console.log with electron-log
  console.log = original.consoleLog;
});

afterAll(() => {
  Reflect.deleteProperty(process, "resourcesPath");
});

describe("main.ts", () => {
  describe("startup", () => {
    it("uses the system locale on the first launch and saves it", async () => {
      h.electron.app.getLocale.mockReturnValue("ja");
      await load();

      expect(h.setLocales).toHaveBeenCalledWith("ja");
      expect(h.state.store.get("language")).toBe("ja");
    });

    it("prefers the saved language", async () => {
      await load({ store: { language: "de" } });

      expect(h.setLocales).toHaveBeenCalledWith("de");
    });

    it("replaces console.log with electron-log", async () => {
      await load();

      expect(console.log).toBe(h.log.log);
    });

    it("sets the about panel options", async () => {
      await load({ platform: "linux" });

      expect(h.electron.app.setAboutPanelOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationName: "LeafView",
          applicationVersion: expect.stringMatching(/^v4\.5\.4 \(Electron v/),
          // Build the expected path with node:path so that it matches the
          // separators and drive letter of the OS running the tests.
          iconPath: path.resolve(
            RESOURCES_PATH,
            "app.asar.unpacked",
            "dist",
            "images/logo.png",
          ),
          copyright: `© 2020-${new Date().getFullYear()} sprout2000`,
        }),
      );
    });

    it("shows the plain version in the about panel on macOS", async () => {
      await load({ platform: "darwin" });

      expect(h.electron.app.setAboutPanelOptions).toHaveBeenCalledWith(
        expect.objectContaining({ applicationVersion: "4.5.4" }),
      );
    });

    it("quits when all windows are closed", async () => {
      await load();

      h.state.app.emit("window-all-closed");

      expect(h.electron.app.exit).toHaveBeenCalled();
    });

    it("installs React DevTools in development", async () => {
      await load({ env: "development" });

      expect(h.installExtension).toHaveBeenCalledWith(
        "react-developer-tools",
        expect.anything(),
      );
    });

    it("does not install React DevTools in production", async () => {
      await load({ env: "production" });

      expect(h.installExtension).not.toHaveBeenCalled();
    });
  });

  describe("window", () => {
    it("restores the saved bounds", async () => {
      const { win } = await load({
        store: { x: 100, y: 200, width: 1200, height: 800 },
      });

      expect(win.options).toMatchObject({
        show: false,
        x: 100,
        y: 200,
        width: 1200,
        height: 800,
        minWidth: 960,
        minHeight: 640,
      });
      expect(
        (win.options.webPreferences as { preload: string }).preload,
      ).toMatch(/preload\.js$/);
    });

    it("uses the default size on the first launch", async () => {
      const { win } = await load();

      expect(win.options).toMatchObject({ width: 960, height: 640 });
    });

    it("uses the dark theme by default", async () => {
      const { win } = await load();

      expect(win.options.backgroundColor).toBe("#1e1e1e");
      expect(h.electron.nativeTheme.themeSource).toBe("dark");
    });

    it("uses the light theme when dark mode is off", async () => {
      const { win } = await load({ store: { darkmode: false } });

      expect(win.options.backgroundColor).toBe("#f6f6f6");
      expect(h.electron.nativeTheme.themeSource).toBe("light");
    });

    it("loads the dev resources directory in development", async () => {
      const { win } = await load({ env: "development" });

      expect(win.options.icon).toBe(
        path.join(process.cwd(), "dist", "images/logo.png"),
      );
    });

    it("sets the application menu", async () => {
      const { win } = await load();

      expect(h.createMenu).toHaveBeenCalledWith(win, expect.any(h.FakeStore));
      expect(h.electron.Menu.setApplicationMenu).toHaveBeenCalledWith(h.menu);
    });

    it("loads the page and shows the window when ready", async () => {
      const { win } = await load();

      expect(win.loadFile).toHaveBeenCalledWith("dist/index.html");
      expect(win.show).not.toHaveBeenCalled();

      win.events.emit("ready-to-show");

      expect(win.show).toHaveBeenCalled();
      expect(win.webContents.openDevTools).not.toHaveBeenCalled();
    });

    it("opens DevTools in development", async () => {
      const { win } = await load({ env: "development" });

      win.events.emit("ready-to-show");

      expect(win.webContents.openDevTools).toHaveBeenCalledWith({
        mode: "detach",
      });
    });

    it("tells the renderer when the watched folder changes", async () => {
      const { win } = await load();

      h.state.onDirChange("/pics");

      expect(win.webContents.send).toHaveBeenCalledWith("dir-changed", "/pics");
    });

    it("stops watching the folder when closed", async () => {
      const { win } = await load();

      win.events.emit("close");

      expect(h.dirWatcher.close).toHaveBeenCalled();
    });

    it("saves the bounds when closed", async () => {
      const { win } = await load();

      win.events.emit("close");

      expect(h.state.store.get("x")).toBe(10);
      expect(h.state.store.get("y")).toBe(20);
      expect(h.state.store.get("width")).toBe(1000);
      expect(h.state.store.get("height")).toBe(700);
    });
  });

  describe("IPC handlers", () => {
    it("registers every channel used by preload.ts", async () => {
      await load();

      expect([...h.state.handlers.keys()].sort()).toEqual([
        "dirname",
        "file-history",
        "get-locale",
        "mime-check",
        "move-to-trash",
        "open-dialog",
        "readdir",
        "show-context-menu",
        "update-title",
      ]);
    });

    it("mime-check", async () => {
      const { invoke } = await load();

      expect(invoke("mime-check", "/pics/a.png")).toBe(true);
      expect(invoke("mime-check", "/pics/a.txt")).toBe(false);
    });

    it("dirname", async () => {
      const { invoke } = await load();

      expect(invoke("dirname", "/pics/a.png")).toBe("/pics");
    });

    describe("readdir", () => {
      let dir: string;

      beforeAll(async () => {
        dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "leafview-"));
        for (const name of ["b.png", "a.jpg", "memo.txt", "._a.png"]) {
          await fs.promises.writeFile(path.join(dir, name), "");
        }
      });

      afterAll(async () => {
        await fs.promises.rm(dir, { recursive: true, force: true });
      });

      it("returns the image files in the directory", async () => {
        const { invoke } = await load();

        await expect(invoke("readdir", dir)).resolves.toEqual([
          path.join(dir, "a.jpg"),
          path.join(dir, "b.png"),
        ]);
      });

      it("logs the error and returns undefined for a missing directory", async () => {
        const { invoke } = await load();

        await expect(
          invoke("readdir", path.join(dir, "missing")),
        ).resolves.toBeUndefined();
        expect(h.log.log).toHaveBeenCalled();
      });
    });

    describe("open-dialog", () => {
      it("returns the selected file", async () => {
        h.electron.dialog.showOpenDialog.mockResolvedValue({
          canceled: false,
          filePaths: ["/pics/a.png"],
        });
        const { win, invoke } = await load();

        await expect(invoke("open-dialog")).resolves.toBe("/pics/a.png");
        expect(h.electron.dialog.showOpenDialog).toHaveBeenCalledWith(
          win,
          expect.objectContaining({
            defaultPath: "/home/user/Pictures",
            properties: ["openFile"],
          }),
        );
        expect(h.electron.app.getPath).toHaveBeenCalledWith("pictures");
      });

      it("starts in the folder opened last time", async () => {
        h.electron.dialog.showOpenDialog.mockResolvedValue({
          canceled: true,
          filePaths: [],
        });
        const lastDir = os.tmpdir();
        const { invoke } = await load({ store: { lastDir } });

        await invoke("open-dialog");

        expect(h.electron.dialog.showOpenDialog).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ defaultPath: lastDir }),
        );
      });

      it("starts in Pictures when the last folder no longer exists", async () => {
        h.electron.dialog.showOpenDialog.mockResolvedValue({
          canceled: true,
          filePaths: [],
        });
        const { invoke } = await load({
          store: { lastDir: path.join(os.tmpdir(), "leafview-removed-folder") },
        });

        await invoke("open-dialog");

        expect(h.electron.dialog.showOpenDialog).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ defaultPath: "/home/user/Pictures" }),
        );
      });

      it("returns undefined when canceled", async () => {
        h.electron.dialog.showOpenDialog.mockResolvedValue({
          canceled: true,
          filePaths: [],
        });
        const { invoke } = await load();

        await expect(invoke("open-dialog")).resolves.toBeUndefined();
      });

      it("ignores AppleDouble files", async () => {
        h.electron.dialog.showOpenDialog.mockResolvedValue({
          canceled: false,
          filePaths: ["/pics/._a.png"],
        });
        const { invoke } = await load({ platform: "win32" });

        await expect(invoke("open-dialog")).resolves.toBeUndefined();
      });

      it("logs the error when the dialog fails", async () => {
        h.electron.dialog.showOpenDialog.mockRejectedValue(new Error("boom"));
        const { invoke } = await load();

        await expect(invoke("open-dialog")).resolves.toBeUndefined();
        expect(h.log.log).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    it("move-to-trash", async () => {
      const { invoke } = await load();

      await invoke("move-to-trash", "/pics/a.png");

      expect(h.electron.shell.trashItem).toHaveBeenCalledWith("/pics/a.png");
      expect(h.electron.shell.beep).toHaveBeenCalled();
    });

    it("update-title", async () => {
      const { win, invoke } = await load();

      invoke("update-title", "/pics/a.png");

      expect(win.setTitle).toHaveBeenCalledWith("a.png");
    });

    it("get-locale returns the saved language", async () => {
      const { invoke } = await load({ store: { language: "fr" } });

      expect(invoke("get-locale")).toBe("fr");
    });

    it("get-locale falls back to the system locale", async () => {
      h.electron.app.getLocale.mockReturnValue("ko");
      const { invoke } = await load();
      h.state.store.delete("language");

      expect(invoke("get-locale")).toBe("ko");
    });

    it("file-history", async () => {
      const { invoke } = await load();

      invoke("file-history", "/pics/a.png");

      expect(h.electron.app.addRecentDocument).toHaveBeenCalledWith(
        "/pics/a.png",
      );
    });

    it("file-history watches the folder of the image", async () => {
      const { invoke } = await load();

      invoke("file-history", path.join("/pics", "2026", "a.png"));

      expect(h.dirWatcher.watch).toHaveBeenCalledWith(
        path.join("/pics", "2026"),
      );
    });

    it("file-history remembers the folder of the image", async () => {
      const { invoke } = await load();

      invoke("file-history", path.join("/pics", "2026", "a.png"));

      expect(h.state.store.get("lastDir")).toBe(path.join("/pics", "2026"));
    });

    it("show-context-menu", async () => {
      const { invoke } = await load();

      invoke("show-context-menu");

      expect(h.menu.popup).toHaveBeenCalled();
    });
  });

  describe("opening a file at launch", () => {
    it("opens the file passed as an argument (Windows / Linux)", async () => {
      const { win } = await load({
        platform: "win32",
        argv: ["C:\\LeafView\\LeafView.exe", "C:\\pics\\a.png"],
      });

      win.contents.emit("did-finish-load");

      expect(win.webContents.send).toHaveBeenCalledWith(
        "menu-open",
        "C:\\pics\\a.png",
      );
    });

    it("ignores an AppleDouble file passed as an argument", async () => {
      const { win } = await load({
        platform: "linux",
        argv: ["/opt/LeafView/leafview", "/pics/._a.png"],
      });

      win.contents.emit("did-finish-load");

      expect(win.webContents.send).not.toHaveBeenCalled();
    });

    it("opens the file requested before the app was ready (macOS)", async () => {
      const { win } = await load({
        platform: "darwin",
        beforeReady: () => {
          h.state.app.emit("will-finish-launching");
          h.state.app.emit("open-file", fakeEvent(), "/pics/a.png");
        },
      });

      win.contents.emit("did-finish-load");

      expect(win.webContents.send).toHaveBeenCalledWith(
        "menu-open",
        "/pics/a.png",
      );
    });

    it("ignores a dotfile requested before the app was ready (macOS)", async () => {
      const { win } = await load({
        platform: "darwin",
        beforeReady: () => {
          h.state.app.emit("will-finish-launching");
          h.state.app.emit("open-file", fakeEvent(), "/pics/.hidden.png");
        },
      });

      win.contents.emit("did-finish-load");

      expect(win.webContents.send).not.toHaveBeenCalled();
    });

    it("does nothing on macOS without a requested file", async () => {
      const { win } = await load({ platform: "darwin" });

      win.contents.emit("did-finish-load");

      expect(win.webContents.send).not.toHaveBeenCalled();
    });
  });

  describe("open-file while running (macOS)", () => {
    it("opens the file and focuses the window", async () => {
      const { win } = await load({ platform: "darwin" });
      const event = fakeEvent();

      h.state.app.emit("open-file", event, "/pics/a.png");

      expect(event.preventDefault).toHaveBeenCalled();
      expect(win.focus).toHaveBeenCalled();
      expect(win.restore).not.toHaveBeenCalled();
      expect(win.webContents.send).toHaveBeenCalledWith(
        "menu-open",
        "/pics/a.png",
      );
    });

    it("restores a minimized window", async () => {
      const { win } = await load({ platform: "darwin" });
      win.isMinimized.mockReturnValue(true);

      h.state.app.emit("open-file", fakeEvent(), "/pics/a.png");

      expect(win.restore).toHaveBeenCalled();
    });

    it("ignores dotfiles", async () => {
      const { win } = await load({ platform: "darwin" });

      h.state.app.emit("open-file", fakeEvent(), "/pics/.hidden.png");

      expect(win.focus).toHaveBeenCalled();
      expect(win.webContents.send).not.toHaveBeenCalled();
    });

    it("is not handled on other platforms", async () => {
      await load({ platform: "linux" });

      expect(h.state.app.has("open-file")).toBe(false);
    });
  });

  describe("auto update", () => {
    it("checks for updates on macOS and Linux", async () => {
      await load({ platform: "linux" });

      expect(h.autoUpdater.logger).toBe(h.log);
      expect(h.autoUpdater.autoDownload).toBe(false);
      expect(h.autoUpdater.checkForUpdates).toHaveBeenCalled();
    });

    it("does not check when notifications are turned off", async () => {
      await load({ platform: "darwin", store: { ask: false } });

      expect(h.autoUpdater.checkForUpdates).not.toHaveBeenCalled();
    });

    it("is disabled on Windows", async () => {
      await load({ platform: "win32" });

      expect(h.autoUpdater.checkForUpdates).not.toHaveBeenCalled();
      expect(h.state.updater.has("update-available")).toBe(false);
    });

    it("downloads the update when the user agrees", async () => {
      h.electron.dialog.showMessageBox.mockResolvedValue({
        response: 1,
        checkboxChecked: false,
      });
      const { win } = await load();

      h.state.updater.emit("update-available");
      await flush();

      expect(h.electron.dialog.showMessageBox).toHaveBeenCalledWith(
        win,
        expect.objectContaining({ message: "Update Notification" }),
      );
      expect(h.autoUpdater.downloadUpdate).toHaveBeenCalled();
    });

    it("keeps asking when the user declines", async () => {
      h.electron.dialog.showMessageBox.mockResolvedValue({
        response: 0,
        checkboxChecked: false,
      });
      await load();

      h.state.updater.emit("update-available");
      await flush();

      expect(h.autoUpdater.downloadUpdate).not.toHaveBeenCalled();
      expect(h.state.store.get("ask")).toBe(true);
    });

    it("stops asking when the user checks the checkbox", async () => {
      h.electron.dialog.showMessageBox.mockResolvedValue({
        response: 0,
        checkboxChecked: true,
      });
      await load();

      h.state.updater.emit("update-available");
      await flush();

      expect(h.state.store.get("ask")).toBe(false);
    });

    it("logs when no update is available", async () => {
      await load();

      h.state.updater.emit("update-not-available");

      expect(h.log.info).toHaveBeenCalledWith("No updates available.");
    });

    it("installs the downloaded update", async () => {
      h.electron.dialog.showMessageBox.mockResolvedValue({ response: 0 });
      await load();

      h.state.updater.emit("update-downloaded");
      await flush();
      await flush();

      expect(h.electron.dialog.showMessageBox).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ message: "Install Updates" }),
      );
      expect(h.autoUpdater.quitAndInstall).toHaveBeenCalled();
    });

    it("logs an error from the install dialog", async () => {
      h.electron.dialog.showMessageBox.mockRejectedValue(new Error("boom"));
      await load();

      h.state.updater.emit("update-downloaded");
      await flush();

      expect(h.log.info).toHaveBeenCalledWith("Updater Error: Error: boom");
      expect(h.autoUpdater.quitAndInstall).not.toHaveBeenCalled();
    });
  });
});
