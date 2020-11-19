import {
  BrowserWindow,
  app,
  Menu,
  ipcMain,
  dialog,
  shell,
  nativeTheme,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import i18next from 'i18next';
import stateKeeper from 'electron-window-state';
import log from 'electron-log';

import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import natsort from 'natsort';

import { setLocales } from './setLocales';
import { createMenu } from './createMenu';

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

let openfile: string | null = null;

const getResourceDirectory = () => {
  return process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), 'dist')
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'dist');
};

const checkmime = (filepath: string) => {
  const mimetype = mime.lookup(filepath);

  return !mimetype || !mimetype.match(/bmp|ico|gif|jpeg|png|svg|webp/)
    ? false
    : true;
};

const createWindow = () => {
  const windowState = stateKeeper({
    defaultWidth: 800,
    defaultHeight: isDarwin ? 558 : 560,
  });

  const dotfiles = isDarwin ? '.' : '._';

  const mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 800,
    minHeight: isDarwin ? 558 : 560,
    autoHideMenuBar: isDarwin ? false : true,
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1e23' : '#f8f8f8',
    webPreferences: {
      enableRemoteModule: false,
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      safeDialogs: true,
      sandbox: true,
      preload: path.resolve(getResourceDirectory(), 'preload.js'),
    },
  });

  ipcMain.on('file-history', (_e, arg) => app.addRecentDocument(arg));

  ipcMain.handle('mime-check', (_e: Event, filepath: string) => {
    return checkmime(filepath);
  });

  ipcMain.handle('dirname', (_e: Event, filepath: string) => {
    return path.dirname(filepath);
  });

  ipcMain.handle('readdir', async (_e: Event, dir: string) => {
    return await fs.promises
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
    return await dialog
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
    return shell.moveItemToTrash(filepath);
  });

  ipcMain.handle('update-title', (_e: Event, filepath: string) => {
    mainWindow.setTitle(path.basename(filepath));
  });

  const menu = createMenu(mainWindow);
  Menu.setApplicationMenu(menu);
  mainWindow.loadFile('dist/index.html');

  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

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

  if (isDarwin) autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.once('error', (_e, err) => {
    log.info(`Error in auto-updater: ${err}`);
  });

  autoUpdater.once('update-downloaded', async () => {
    log.info(`Update downloaded...`);

    await dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['Install', 'Not now'],
        defaultId: 0,
        cancelId: 1,
        title: 'Update Downloaded',
        message: 'Update downloaded',
        detail:
          'We have finished downloading the latest updates.\n' +
          'Do you want to install the updates now?',
      })
      .then((result) => {
        result.response === 0 && autoUpdater.quitAndInstall();
      })
      .catch((err) => log.info(`Error in showMessageBox: ${err}`));
  });

  windowState.manage(mainWindow);
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

  app.whenReady().then(() => {
    const locale = app.getLocale();
    setLocales(locale);
    createWindow();
  });

  app.setAboutPanelOptions({
    applicationName: app.name,
    applicationVersion: app.getVersion(),
    version: process.versions['electron'],
    copyright: 'Copyright (C) 2020 sprout2000.',
  });

  app.once('window-all-closed', () => app.exit());
}
