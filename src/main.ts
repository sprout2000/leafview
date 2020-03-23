import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import stateKeeper from 'electron-window-state';
import loadDevtool from 'electron-load-devtool';

import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import natsort from 'natsort';

import createMenu from './menu';

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

    ipcMain.handle('selected-file', async (_e, filepath) => {
      const dir = path.dirname(filepath);
      const list = await fs.promises
        .readdir(dir, { withFileTypes: true })
        .then((dirents) =>
          dirents
            .filter((dirent) => dirent.isFile())
            .map(({ name }) => path.join(dir, name))
            .filter((item) => checkmime(item))
            .sort(natsort({ insensitive: true }))
        );

      return list;
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

    windowState.manage(win);
  });

  app.on('open-file', (e, path) => {
    e.preventDefault();
    if (win) win.webContents.send('selected-file', path);
  });

  app.allowRendererProcessReuse = true;
  app.once('window-all-closed', () => app.exit());
}
