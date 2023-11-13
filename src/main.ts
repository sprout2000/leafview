import {
  app,
  Menu,
  shell,
  dialog,
  session,
  ipcMain,
  nativeTheme,
  BrowserWindow,
  IpcMainInvokeEvent,
} from "electron";

import log from "electron-log";
import Store from "electron-store";
import { autoUpdater } from "electron-updater";

import fs from "node:fs";
import path from "node:path";

import mime from "mime-types";
import i18next from "i18next";

import { setLocales } from "./setLocales";
import { createMenu } from "./createMenu";

console.log = log.log;
log.info("App starting...");

let openfile: string | null = null;

const isDarwin = process.platform === "darwin";
const isDevelop = process.env.NODE_ENV === "development";

const initWidth = 800;
const initHeight = 528;

const store = new Store<StoreType>({
  configFileMode: 0o666,
  defaults: {
    ask: true,
    x: undefined,
    y: undefined,
    width: initWidth,
    height: initHeight,
    showmenu: true,
  },
});

const getResourceDirectory = () => {
  return isDevelop
    ? path.join(process.cwd(), "dist")
    : path.join(process.resourcesPath, "app.asar.unpacked", "dist");
};

const checkmime = (filepath: string) => {
  const regexp = new RegExp(/bmp|ico|gif|jpeg|png|svg|webp/);
  const mimetype = mime.lookup(filepath);

  return (mimetype && regexp.test(mimetype)) || false;
};

const createWindow = () => {
  const dotfiles = isDarwin ? "." : "._";

  const mainWindow = new BrowserWindow({
    show: false,
    x: store.get("x"),
    y: store.get("y"),
    minWidth: initWidth,
    minHeight: initHeight,
    width: store.get("width"),
    height: store.get("height"),
    icon: path.join(getResourceDirectory(), "images/logo.png"),
    backgroundColor: "#1e1e1e",
    webPreferences: {
      safeDialogs: true,
      devTools: isDevelop,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (!isDarwin) mainWindow.setMenuBarVisibility(store.get("showmenu"));
  nativeTheme.themeSource = "dark";

  const menu = createMenu(mainWindow, store);
  Menu.setApplicationMenu(menu);

  ipcMain.handle("mime-check", (_e: IpcMainInvokeEvent, filepath: string) => {
    return checkmime(filepath);
  });

  ipcMain.handle("dirname", (_e: IpcMainInvokeEvent, filepath: string) => {
    return path.dirname(filepath);
  });

  ipcMain.handle("readdir", async (_e: IpcMainInvokeEvent, dir: string) => {
    return fs.promises
      .readdir(dir, { withFileTypes: true })
      .then((dirents) =>
        dirents
          .filter((dirent) => dirent.isFile())
          .filter(({ name }) => !name.startsWith(dotfiles))
          .map(({ name }) => path.resolve(dir, name))
          .filter((item) => checkmime(item))
          .sort(),
      )
      .catch((err) => console.log(err));
  });

  ipcMain.handle("open-dialog", async () => {
    return dialog
      .showOpenDialog(mainWindow, {
        properties: ["openFile"],
        title: `${i18next.t("Select an image")}`,
        filters: [
          {
            name: i18next.t("Image files"),
            extensions: [
              "bmp",
              "gif",
              "ico",
              "jpg",
              "jpeg",
              "png",
              "svg",
              "webp",
            ],
          },
        ],
      })
      .then((result) => {
        if (result.canceled) return;
        if (path.basename(result.filePaths[0]).startsWith(dotfiles)) return;

        return result.filePaths[0];
      })
      .catch((err) => console.log(err));
  });

  ipcMain.handle(
    "move-to-trash",
    async (_e: IpcMainInvokeEvent, filepath: string) => {
      await shell.trashItem(filepath).then(() => shell.beep());
    },
  );

  ipcMain.handle("update-title", (_e: IpcMainInvokeEvent, filepath: string) => {
    mainWindow.setTitle(path.basename(filepath));
  });

  ipcMain.handle("get-locale", () => store.get("language") || app.getLocale());

  ipcMain.handle("file-history", (_e, arg) => app.addRecentDocument(arg));

  ipcMain.handle("show-context-menu", () => {
    menu.popup();
  });

  mainWindow.webContents.once("did-finish-load", () => {
    if (!isDarwin && process.argv.length >= 2) {
      const filepath = process.argv[process.argv.length - 1];
      if (path.basename(filepath).startsWith(dotfiles)) return;

      mainWindow.webContents.send("menu-open", filepath);
    }

    if (isDarwin && openfile) {
      if (path.basename(openfile).startsWith(dotfiles)) {
        openfile = null;
        return;
      }

      mainWindow.webContents.send("menu-open", openfile);
      openfile = null;
    }
  });

  if (isDarwin) {
    app.on("open-file", (e, filepath) => {
      e.preventDefault();

      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      if (path.basename(filepath).startsWith(dotfiles)) return;

      mainWindow.webContents.send("menu-open", filepath);
    });
  }

  if (isDevelop) {
    const extPath = path.resolve(process.cwd(), "../devtools");
    session.defaultSession.loadExtension(extPath, { allowFileAccess: true });
  }

  if (isDarwin || process.platform === "linux") {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;

    if (store.get("ask")) autoUpdater.checkForUpdates();

    autoUpdater.once("update-available", () => {
      dialog
        .showMessageBox(mainWindow, {
          message: "Update Notification",
          detail:
            "A new version is available.\nDo you want to download it now?",
          buttons: ["Not now", "OK"],
          defaultId: 1,
          cancelId: 0,
          checkboxLabel: "No update notifications required.",
        })
        .then((result) => {
          if (result.response === 1) {
            log.info("User chose to update...");
            autoUpdater.downloadUpdate();
          } else {
            log.info("User refused to update...");
            if (result.checkboxChecked) {
              log.info("User rejected the update notification.");
              store.set("ask", false);
            }
          }
        });
    });

    autoUpdater.once("update-not-available", () => {
      log.info("No updates available.");
    });

    autoUpdater.once("update-downloaded", () => {
      log.info("Updates downloaded...");
      dialog
        .showMessageBox(mainWindow, {
          message: "Install Updates",
          detail: "Updates downloaded.\nPlease restart LeafView...",
        })
        .then(() => {
          setImmediate(() => autoUpdater.quitAndInstall());
        })
        .catch((err) => log.info(`Updater Error: ${err}`));
    });
  }

  mainWindow.loadFile("dist/index.html");
  mainWindow.once("ready-to-show", () => {
    if (isDevelop) mainWindow.webContents.openDevTools({ mode: "detach" });
    mainWindow.show();
  });

  mainWindow.once("close", () => {
    const { x, y, width, height } = mainWindow.getBounds();
    store.set({ x, y, width, height });
  });
};

app.once("will-finish-launching", () => {
  app.once("open-file", (e, filepath) => {
    e.preventDefault();
    openfile = filepath;
  });
});

app.whenReady().then(() => {
  const locale = store.get("language") || app.getLocale();
  setLocales(locale);
  store.set("language", locale);

  createWindow();
});

app.setAboutPanelOptions({
  applicationName: app.name,
  applicationVersion: isDarwin
    ? app.getVersion()
    : `v${app.getVersion()} (Electron v${process.versions["electron"]})`,
  version: `Electron v${process.versions["electron"]}`,
  iconPath: path.resolve(getResourceDirectory(), "images/logo.png"),
  copyright: "© 2020-2023 sprout2000",
});

app.once("window-all-closed", () => app.exit());
