import {
  app,
  Menu,
  shell,
  ipcMain,
  dialog,
  session,
  nativeTheme,
  BrowserWindow,
} from 'electron';

import Store from 'electron-store';
import i18next from 'i18next';
import log from 'electron-log';

import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import natsort from 'natsort';

import { setLocales } from './lib/setLocales';
import { createMenu } from './createMenu';
import { searchDevtools } from './searchDevtools';
import { TypedStore } from './lib/TypedStore';

console.log = log.log;
log.info('App starting...');

process.once('uncaughtException', (err) => {
  log.error('electron:uncaughtException');
  log.error(err.name);
  log.error(err.message);
  log.error(err.stack);
  app.exit();
});

const gotTheLock = app.requestSingleInstanceLock();
const isDev = process.env.NODE_ENV === 'development';

/// #if DEBUG
if (isDev) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-reload')(__dirname, {
    electron: path.resolve(
      __dirname,
      '../node_modules/electron/dist/electron.exe'
    ),
    forceHardReset: true,
    hardResetMethod: 'exit',
  });
}
/// #endif

const store = new Store<TypedStore>({
  defaults: {
    darkmode: nativeTheme.shouldUseDarkColors,
    x: undefined,
    y: undefined,
    width: 800,
    height: 578,
  },
});

const checkmime = (filepath: string) => {
  const mimetype = mime.lookup(filepath);

  return !mimetype || !mimetype.match(/bmp|ico|gif|jpeg|png|svg|webp/)
    ? false
    : true;
};

const createWindow = () => {
  const dotfiles = '._';

  const mainWindow = new BrowserWindow({
    x: store.get('x'),
    y: store.get('y'),
    width: store.get('width'),
    height: store.get('height'),
    minWidth: 800,
    minHeight: 578,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    fullscreenable: false,
    backgroundColor: store.get('darkmode') ? '#1e1e1e' : '#e6e6e6',
    webPreferences: {
      sandbox: true,
      safeDialogs: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  nativeTheme.themeSource = store.get('darkmode') ? 'dark' : 'light';

  ipcMain.on('file-history', (_e, arg) => app.addRecentDocument(arg));

  ipcMain.handle('minimize-window', () => mainWindow.minimize());
  ipcMain.handle('maximize-window', () => mainWindow.maximize());
  ipcMain.handle('restore-window', () => mainWindow.unmaximize());
  ipcMain.handle('close-window', () => mainWindow.close());

  mainWindow.on('maximize', () => mainWindow.webContents.send('maximized'));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('unMaximized'));
  mainWindow.on('resized', () => {
    if (mainWindow.isMaximized()) return;
    mainWindow.webContents.send('resized');
  });
  mainWindow.on('focus', () => mainWindow.webContents.send('get-focus'));
  mainWindow.on('blur', () => mainWindow.webContents.send('get-blur'));

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
          .sort(natsort({ insensitive: true }))
      )
      .catch((err) => console.log(err));
  });

  ipcMain.handle('open-dialog', async () => {
    return dialog
      .showOpenDialog(mainWindow, {
        properties: ['openFile'],
        title: i18next.t('dialogTitle'),
        filters: [
          {
            name: i18next.t('dialogName'),
            extensions: [
              'bmp',
              'gif',
              'ico',
              'jpg',
              'jpeg',
              'apng',
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

  const menu = createMenu(mainWindow, store);
  Menu.setApplicationMenu(menu);
  ipcMain.on('show-context-menu', () => {
    menu.popup();
  });

  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.loadFile('dist/index.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.once('did-finish-load', () => {
    if (!isDev && process.argv.length >= 2) {
      const filepath = process.argv[process.argv.length - 1];
      if (path.basename(filepath).startsWith(dotfiles)) return;

      mainWindow.webContents.send('menu-open', filepath);
    }
  });

  app.on('second-instance', (_e, argv) => {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    if (argv.length >= 4) {
      const filepath = argv[argv.length - 1];
      if (path.basename(filepath).startsWith(dotfiles)) return;

      mainWindow.webContents.send('menu-open', filepath);
    }
  });

  mainWindow.once('close', () => {
    const darkmode = store.get('darkmode', nativeTheme.shouldUseDarkColors);
    const { x, y, width, height } = mainWindow.getBounds();
    store.set({ x, y, width, height, darkmode });
  });
};

if (!gotTheLock) {
  app.exit();
} else {
  app.whenReady().then(async () => {
    const locale = app.getLocale();
    setLocales(locale);

    if (isDev) {
      const extPath = await searchDevtools();
      if (extPath) {
        await session.defaultSession
          .loadExtension(extPath, {
            allowFileAccess: true,
          })
          .then(() => console.log('React Devtools loaded...'))
          .catch((err) => console.log(err));
      }
    }

    createWindow();
  });

  app.setAboutPanelOptions({
    applicationName: app.name,
    applicationVersion: `v${app.getVersion()} (${
      process.versions['electron']
    })`,
    copyright: '© 2020 sprout2000 and other contributors',
    iconPath: path.join(__dirname, 'icon.png'),
  });

  app.once('window-all-closed', () => app.exit());
}
