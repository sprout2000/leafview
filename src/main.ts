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
import { autoUpdater } from 'electron-updater';
import i18next from 'i18next';
import log from 'electron-log';

import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import natsort from 'natsort';

import { setLocales } from './setLocales';
import { createMenu } from './createMenu';
import { searchDevtools } from './searchDevtools';
import { TypedStore } from './TypedStore';

console.log = log.log;
autoUpdater.logger = log;
log.info('App starting...');

process.once('uncaughtException', (err) => {
  log.error('electron:uncaughtException');
  log.error(err.name);
  log.error(err.message);
  log.error(err.stack);
  app.exit();
});

const gotTheLock = app.requestSingleInstanceLock();
const isDarwin = process.platform === 'darwin';
const isDev = process.env.NODE_ENV === 'development';

const store = new Store<TypedStore>({
  defaults: {
    darkmode: nativeTheme.shouldUseDarkColors,
    x: undefined,
    y: undefined,
    width: 800,
    height: isDarwin ? 558 : 602,
  },
});

let openfile: string | null = null;

const checkmime = (filepath: string) => {
  const mimetype = mime.lookup(filepath);

  return !mimetype || !mimetype.match(/bmp|ico|gif|jpeg|png|svg|webp/)
    ? false
    : true;
};

const createWindow = () => {
  const dotfiles = isDarwin ? '.' : '._';

  const mainWindow = new BrowserWindow({
    x: store.get('x'),
    y: store.get('y'),
    width: store.get('width'),
    height: store.get('height'),
    minWidth: 800,
    minHeight: isDarwin ? 558 : 602,
    show: false,
    backgroundColor: store.get('darkmode') ? '#1e1e23' : '#dddddd',
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      safeDialogs: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (store.get('darkmode')) {
    nativeTheme.themeSource = 'dark';
  } else {
    nativeTheme.themeSource = 'light';
  }

  ipcMain.on('file-history', (_e, arg) => app.addRecentDocument(arg));

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

  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.loadFile('dist/index.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.once('did-finish-load', () => {
    if (!isDarwin && !isDev && process.argv.length >= 2) {
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

  if (!isDarwin) {
    app.on('second-instance', (_e, argv) => {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      if (argv.length >= 4) {
        const filepath = argv[argv.length - 1];
        if (path.basename(filepath).startsWith(dotfiles)) return;

        mainWindow.webContents.send('menu-open', filepath);
      }
    });
  }

  app.on('open-file', (e, filepath) => {
    e.preventDefault();

    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    if (path.basename(filepath).startsWith(dotfiles)) return;

    mainWindow.webContents.send('menu-open', filepath);
  });

  if (isDarwin) {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.once('error', (_e, err) => {
      log.info(`Error in auto-updater: ${err}`);
    });

    autoUpdater.once('update-downloaded', async () => {
      log.info(`Update downloaded...`);

      await dialog
        .showMessageBox(mainWindow, {
          type: 'info',
          buttons: ['Restart', 'Not now'],
          defaultId: 0,
          cancelId: 1,
          title: 'Update Downloaded',
          message: 'Update downloaded',
          detail:
            'We have finished downloading the latest updates.\n' +
            'Would you like to install the update and restart now?',
        })
        .then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall();
          } else {
            log.info('The installation of the update has been cancelled...');
            return;
          }
        })
        .catch((err) => log.info(`Error in showMessageBox: ${err}`));
    });
  }

  mainWindow.once('close', () => {
    const darkmode = store.get('darkmode', nativeTheme.shouldUseDarkColors);
    const { x, y, width, height } = mainWindow.getBounds();
    store.set({ x, y, width, height, darkmode });
  });
};

if (!gotTheLock && !isDarwin) {
  app.exit();
} else {
  app.once('will-finish-launching', () => {
    app.once('open-file', (e, filepath) => {
      e.preventDefault();
      openfile = filepath;
    });
  });

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
    applicationVersion: isDarwin
      ? app.getVersion()
      : `v${app.getVersion()} (electron@${process.versions['electron']})`,
    version: `electron@${process.versions['electron']}`,
    copyright: 'Copyright 2020-2021 sprout2000, contributors',
  });

  app.once('window-all-closed', () => app.exit());
}
