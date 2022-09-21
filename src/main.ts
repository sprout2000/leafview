import {
  app,
  Menu,
  shell,
  dialog,
  ipcMain,
  session,
  nativeTheme,
  BrowserWindow,
} from 'electron';

import Store from 'electron-store';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { searchDevtools } from 'electron-search-devtools';

import fs from 'node:fs';
import path from 'node:path';

import mime from 'mime-types';
import i18next from 'i18next';

import { setLocales } from './setLocales';
import { createMenu } from './createMenu';

console.log = log.log;
log.info('App starting...');

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
  },
});

const isDarwin = process.platform === 'darwin';
const isDevelop = process.env.NODE_ENV === 'development';

/// #if DEBUG
const execPath =
  process.platform === 'win32'
    ? '../node_modules/electron/dist/electron.exe'
    : '../node_modules/.bin/electron';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('electron-reload')(__dirname, {
  electron: path.resolve(__dirname, execPath),
});
/// #endif

const getResourceDirectory = () => {
  return process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), 'dist')
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'dist');
};

let openfile: string | null = null;

const checkmime = (filepath: string) => {
  const regexp = new RegExp(/bmp|ico|gif|jpeg|png|svg|webp/);
  const mimetype = mime.lookup(filepath);

  return (mimetype && regexp.test(mimetype)) || false;
};

const createWindow = () => {
  const dotfiles = isDarwin ? '.' : '._';

  const mainWindow = new BrowserWindow({
    show: false,
    x: store.get('x'),
    y: store.get('y'),
    minWidth: initWidth,
    minHeight: initHeight,
    width: store.get('width'),
    height: store.get('height'),
    autoHideMenuBar: true,
    fullscreenable: isDarwin ? false : true,
    icon: path.join(getResourceDirectory(), 'images/logo.png'),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1e1e' : '#f6f6f6',
    webPreferences: {
      safeDialogs: true,
      devTools: isDevelop,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const menu = createMenu(mainWindow, store);
  Menu.setApplicationMenu(menu);

  ipcMain.handle('mime-check', (_e: Event, filepath: string) => {
    return checkmime(filepath);
  });

  ipcMain.handle('dirname', (_e: Event, filepath: string) => {
    return path.dirname(filepath);
  });

  ipcMain.handle('readdir', async (_e: Event, dir: string) => {
    return fs.promises
      .readdir(dir, { withFileTypes: true })
      .then((dirents) =>
        dirents
          .filter((dirent) => dirent.isFile())
          .filter(({ name }) => !name.startsWith(dotfiles))
          .map(({ name }) => path.resolve(dir, name))
          .filter((item) => checkmime(item))
          .sort()
      )
      .catch((err) => console.log(err));
  });

  ipcMain.handle('open-dialog', async () => {
    return dialog
      .showOpenDialog(mainWindow, {
        properties: ['openFile'],
        title: i18next.t('Select an image'),
        filters: [
          {
            name: i18next.t('Image files'),
            extensions: [
              'bmp',
              'gif',
              'ico',
              'jpg',
              'jpeg',
              'png',
              'svg',
              'webp',
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

  ipcMain.handle('move-to-trash', (_e: Event, filepath: string) => {
    return shell.trashItem(filepath);
  });

  ipcMain.handle('update-title', (_e: Event, filepath: string) => {
    mainWindow.setTitle(path.basename(filepath));
  });

  mainWindow.webContents.once('did-finish-load', () => {
    if (!isDarwin && process.argv.length >= 2) {
      const filepath = process.argv[process.argv.length - 1];
      if (path.basename(filepath).startsWith(dotfiles)) return;

      mainWindow.webContents.send('menu-open', filepath);
    }

    if (isDarwin && openfile) {
      if (path.basename(openfile).startsWith(dotfiles)) {
        openfile = null;
        return;
      }

      mainWindow.webContents.send('menu-open', openfile);
      openfile = null;
    }
  });

  if (isDarwin) {
    app.on('open-file', (e, filepath) => {
      e.preventDefault();

      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      if (path.basename(filepath).startsWith(dotfiles)) return;

      mainWindow.webContents.send('menu-open', filepath);
    });
  }

  if (isDevelop) {
    searchDevtools('REACT')
      .then((devtools) => {
        session.defaultSession.loadExtension(devtools, {
          allowFileAccess: true,
        });
      })
      .catch((err) => console.log(err));
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  if (isDarwin || process.platform === 'linux') {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;

    if (store.get('ask')) autoUpdater.checkForUpdates();

    autoUpdater.on('update-available', () => {
      dialog
        .showMessageBox(mainWindow, {
          message: 'Found Updates',
          detail: 'A new version is available.\nDo you want to update now?',
          buttons: ['Not now', 'Yes'],
          defaultId: 1,
          cancelId: 0,
          checkboxLabel: "Don't ask me again.",
        })
        .then((result) => {
          if (result.response === 1) {
            log.info('User chose to update...');
            autoUpdater.downloadUpdate();
          } else {
            log.info('User refused to update...');
            if (result.checkboxChecked) {
              log.info('User rejected the update notification.');
              store.set('ask', false);
            }
          }
        });
    });

    autoUpdater.on('update-not-available', () => {
      log.info('No updates available.');
    });

    autoUpdater.on('update-downloaded', () => {
      log.info('Updates downloaded...');
      dialog
        .showMessageBox(mainWindow, {
          message: 'Install Updates',
          detail: 'Updates downloaded.\nPlease restart LeafView...',
        })
        .then(() => {
          setImmediate(() => autoUpdater.quitAndInstall());
        })
        .catch((err) => log.info(`Updater Error: ${err}`));
    });
  }

  mainWindow.loadFile('dist/index.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.once('close', () => {
    const { x, y, width, height } = mainWindow.getBounds();
    store.set({ x, y, width, height });
  });
};

app.once('will-finish-launching', () => {
  app.once('open-file', (e, filepath) => {
    e.preventDefault();
    openfile = filepath;
  });
});

app.whenReady().then(() => {
  const locale = store.get('language') || app.getLocale();
  setLocales(locale);
  store.set('language', locale);

  createWindow();
});

app.setAboutPanelOptions({
  applicationName: app.name,
  applicationVersion: isDarwin
    ? app.getVersion()
    : `v${app.getVersion()} (${process.versions['electron']})`,
  version: process.versions['electron'],
  iconPath: path.resolve(getResourceDirectory(), 'images/logo.png'),
  copyright: '© 2020 sprout2000 and other contributors',
});

app.once('window-all-closed', () => app.exit());
