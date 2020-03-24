import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import i18next from 'i18next';
import stateKeeper from 'electron-window-state';
import loadDevtool from 'electron-load-devtool';
import log from 'electron-log';

import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import natsort from 'natsort';

import en from './locales/en.json';
import ja from './locales/ja.json';
import createMenu from './menu';

autoUpdater.logger = log;
log.info('App starting...');

const gotTheLock = app.requestSingleInstanceLock();
const isDev = process.env.NODE_ENV === 'development';
const win32 = process.platform === 'win32';
const darwin = process.platform === 'darwin';

let win: BrowserWindow | null = null;
let filepath: string | null = null;

const getSourceDirectory = (): string =>
  isDev
    ? path.join(process.cwd(), 'dist')
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'dist');

const checkmime = (filepath: string): boolean => {
  const mimetype = mime.lookup(filepath);

  return !mimetype || !mimetype.match(/bmp|gif|ico|jpeg|png|svg|webp/)
    ? false
    : true;
};

if (!gotTheLock && win32) {
  app.exit();
} else {
  app.on('second-instance', (_e, argv) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }

    if (win32 && argv.length >= 4) {
      if (win) win.webContents.send('selected-file', argv[argv.length - 1]);
    }
  });

  app.once('will-finish-launching', () => {
    app.once('open-file', (e, path) => {
      e.preventDefault();
      filepath = path;
    });
  });

  app.once('ready', (): void => {
    const locale = app.getLocale();
    i18next.init({
      lng: locale,
      fallbackLng: 'en',
      resources: {
        en: { translation: en },
        ja: { translation: ja },
      },
    });

    const windowState = stateKeeper({
      defaultWidth: 800,
      defaultHeight: 558,
    });

    win = new BrowserWindow({
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
      minWidth: 800,
      minHeight: 558,
      title: 'LessView',
      show: false,
      autoHideMenuBar: true,
      backgroundColor: '#323232',
      webPreferences: {
        preload: path.resolve(getSourceDirectory(), 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        safeDialogs: true,
        sandbox: true,
      },
    });

    ipcMain.handle('platform', () => {
      return darwin;
    });

    ipcMain.handle('getdir', (_e: Event, filepath: string) => {
      const dirpath = path.dirname(filepath);

      return dirpath;
    });

    ipcMain.handle('readdir', async (_e, dirpath) => {
      const list = await fs.promises
        .readdir(dirpath, { withFileTypes: true })
        .then((dirents) =>
          dirents
            .filter((dirent) => dirent.isFile())
            .map(({ name }) => path.join(dirpath, name))
            .filter((item) => checkmime(item))
            .sort(natsort({ insensitive: true }))
        )
        .catch((err) => console.log(err));

      return list;
    });

    ipcMain.handle('open-dialog', async () => {
      if (win) {
        const filepath = await dialog
          .showOpenDialog(win, {
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
            return result.filePaths[0];
          })
          .catch((err): void => console.log(err));

        return filepath;
      }
    });

    ipcMain.handle('move-to-trash', (_e: Event, filepath: string) => {
      const result = shell.moveItemToTrash(filepath);
      return result;
    });

    ipcMain.handle('update-title', (_e: Event, title: string) => {
      const basename = path.basename(title);
      if (win) win.setTitle(basename);
    });

    if (process.env.NODE_ENV === 'development') {
      win.webContents.openDevTools({ mode: 'detach' });
      loadDevtool(loadDevtool.REACT_DEVELOPER_TOOLS);
    }

    const menu = createMenu(win);
    Menu.setApplicationMenu(menu);
    win.loadFile('dist/index.html');

    win.once('ready-to-show', (): void => {
      if (win) win.show();
    });

    win.webContents.on('did-finish-load', () => {
      if (win32 && process.argv.length >= 2) {
        if (win) {
          win.webContents.send(
            'selected-file',
            process.argv[process.argv.length - 1]
          );
        }
      }

      if (darwin && filepath) {
        if (win) win.webContents.send('selected-file', filepath);
        filepath = null;
      }
    });

    win.once('closed', (): void => {
      win = null;
    });

    autoUpdater.checkForUpdatesAndNotify();
    windowState.manage(win);
  });

  app.on('open-file', (e, path) => {
    e.preventDefault();
    if (win) win.webContents.send('selected-file', path);
  });

  app.setAboutPanelOptions({
    applicationName: 'Viewdir',
    applicationVersion: app.getVersion(),
    copyright: 'Copyright (C) 2020 Office Nishigami.',
  });

  autoUpdater.once('error', (_e, err) => {
    log.info(`Error in auto-updater: ${err}`);
  });

  autoUpdater.once('update-downloaded', () => {
    log.info(`Update downloaded...`);

    if (win) {
      dialog
        .showMessageBox(win, {
          type: 'info',
          buttons: ['OK', 'Cancel'],
          defaultId: 0,
          cancelId: 1,
          title: 'Update Downloaded',
          message: 'Update downloaded',
          detail: 'Restart to install updates...',
        })
        .then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall();
          }
        });
    }
  });

  process.once('uncaughtException', (err) => {
    log.error('electron:uncaughtException');
    log.error(err.name);
    log.error(err.message);
    log.error(err.stack);
    app.exit();
  });

  app.allowRendererProcessReuse = true;
  app.once('window-all-closed', () => app.exit());
}
