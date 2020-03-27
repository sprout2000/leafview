import { BrowserWindow, app, Menu, ipcMain, dialog, shell } from 'electron';
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
const win32 = process.platform === 'win32';
const darwin = process.platform === 'darwin';

let win: BrowserWindow | null;
let filepath: string | null = null;

const getSourceDirectory = (): string => {
  return process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), 'dist')
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'dist');
};

const checkmime = (filepath: string): boolean => {
  const mimetype = mime.lookup(filepath);

  return !mimetype || !mimetype.match(/bmp|ico|gif|jpeg|png|svg|webp/)
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
      if (win) win.webContents.send('menu-open', argv[argv.length - 1]);
    }
  });

  app.once('will-finish-launching', () => {
    app.once('open-file', (e, path) => {
      e.preventDefault();
      filepath = path;
    });
  });

  app.once('ready', () => {
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
      defaultHeight: darwin ? 558 : 562,
    });

    win = new BrowserWindow({
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
      minWidth: 800,
      minHeight: darwin ? 558 : 562,
      show: false,
      autoHideMenuBar: true,
      backgroundColor: '#323232',
      webPreferences: {
        enableRemoteModule: false,
        nodeIntegration: false,
        contextIsolation: true,
        safeDialogs: true,
        sandbox: true,
        preload: path.resolve(getSourceDirectory(), 'preload.js'),
      },
    });

    ipcMain.on('file-history', (_e, arg) => app.addRecentDocument(arg));

    ipcMain.handle('platform', () => darwin);

    ipcMain.handle('mime-check', (_e: Event, filepath: string) => {
      return checkmime(filepath);
    });

    ipcMain.handle('dirname', (_e: Event, filepath: string) => {
      const dir = path.dirname(filepath);
      return dir;
    });

    ipcMain.handle('readdir', async (e: Event, dir: string) => {
      const list = await fs.promises
        .readdir(dir, { withFileTypes: true })
        .then((dirents) =>
          dirents
            .filter((dirent) => dirent.isFile())
            .map(({ name }) => path.join(dir, name))
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

    ipcMain.handle('update-title', (_e: Event, fullpath: string) => {
      if (win) win.setTitle(path.basename(fullpath));
    });

    ipcMain.on('log-info', (_e: Event, message: string) => {
      log.info(message);
    });

    if (process.env.NODE_ENV === 'development') {
      loadDevtool(loadDevtool.REACT_DEVELOPER_TOOLS);
      win.webContents.openDevTools({ mode: 'detach' });
    }
    const menu = createMenu(win);
    Menu.setApplicationMenu(menu);
    win.loadFile('dist/index.html');

    win.once('ready-to-show', (): void => {
      if (win) win.show();
    });

    win.webContents.once('did-finish-load', () => {
      if (win && win32 && process.argv.length >= 2) {
        win.webContents.send(
          'menu-open',
          process.argv[process.argv.length - 1]
        );
      }

      if (win && darwin && filepath) {
        win.webContents.send('menu-open', filepath);
        filepath = null;
      }
    });

    win.once('closed', () => {
      win = null;
    });

    autoUpdater.checkForUpdatesAndNotify();
    windowState.manage(win);
  });

  app.on('open-file', (e, path) => {
    e.preventDefault();
    if (win) win.webContents.send('menu-open', path);
  });

  app.setAboutPanelOptions({
    applicationName: 'LessView',
    applicationVersion: app.getVersion(),
    copyright: 'Copyright (C) 2020 Office Nishigami.',
  });

  autoUpdater.once('error', (_e, err) => {
    log.info(`Error in auto-updater: ${err}`);
  });

  autoUpdater.once('update-downloaded', async () => {
    log.info(`Update downloaded...`);

    if (win) {
      await dialog
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
        })
        .catch((err) => log.info(`Error in showMessageBox: ${err}`));
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
  app.once('window-all-closed', () => app.quit());
}
