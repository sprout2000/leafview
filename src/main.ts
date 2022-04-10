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

import log from 'electron-log';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';
import { searchDevtools } from 'electron-search-devtools';

import fs from 'node:fs';
import path from 'node:path';

import mime from 'mime-types';
import i18next from 'i18next';

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

const isLinux = process.platform === 'linux';
const isDarwin = process.platform === 'darwin';
const isDevelop = process.env.NODE_ENV === 'development';

/// #if DEBUG
if (isDevelop) {
  const execPath =
    process.platform === 'win32'
      ? '../node_modules/electron/dist/electron.exe'
      : '../node_modules/.bin/electron';

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-reload')(__dirname, {
    electron: path.resolve(__dirname, execPath),
  });
}
/// #endif

const initWidth = 800;
const initHeight = 528;

const getResourceDirectory = () => {
  return isDevelop
    ? path.join(process.cwd(), 'dist')
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'dist');
};

const store = new Store<StoreType>({
  configFileMode: 0o666,
  defaults: {
    width: initWidth,
    height: initHeight,
    x: undefined,
    y: undefined,
    darkmode: false,
  },
});

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
    icon: isLinux
      ? path.join(getResourceDirectory(), 'images/logo.png')
      : undefined,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1e1e' : '#f6f6f6',
    webPreferences: {
      sandbox: true,
      safeDialogs: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isLinux) {
    nativeTheme.themeSource = nativeTheme.shouldUseDarkColors
      ? 'dark'
      : 'light';
  } else {
    nativeTheme.themeSource = store.get('darkmode') ? 'dark' : 'light';
  }

  const menu = createMenu(mainWindow, store);
  Menu.setApplicationMenu(menu);

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
          .sort()
      )
      .catch((err) => log.error(err));
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
      .catch((err) => log.error(err));
  });

  ipcMain.handle('move-to-trash', (_e: Event, filepath: string) => {
    return shell.trashItem(filepath);
  });

  ipcMain.handle('update-title', (_e: Event, filepath: string) => {
    mainWindow.setTitle(path.basename(filepath));
  });

  ipcMain.on('show-context-menu', () => {
    menu.popup();
  });

  mainWindow.webContents.once('did-finish-load', () => {
    if (!isDarwin && !isDevelop && process.argv.length >= 2) {
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

  if ((isDarwin || isLinux) && !isDevelop) {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.once('error', (_e, err) => {
      log.info(`Error in auto-updater: ${err}`);
    });

    autoUpdater.once('update-downloaded', async () => {
      log.info(`Update downloaded...`);

      await dialog
        .showMessageBox(mainWindow, {
          type: 'info',
          buttons: ['Restart', 'Later'],
          title: 'Update',
          message: 'Update',
          detail:
            'A new version has been downloaded.\n' +
            'Restart the application to apply the updates.',
        })
        .then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall();
          }
        })
        .catch((err) => log.info(`Error in 'update-downloaded': ${err}`));
    });
  }

  mainWindow.once('close', () => {
    const darkmode = store.get('darkmode', nativeTheme.shouldUseDarkColors);
    const { x, y, width, height } = mainWindow.getBounds();
    store.set({ x, y, width, height, darkmode });
  });

  if (isDevelop) mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.loadFile('dist/index.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());
};

app.once('will-finish-launching', () => {
  app.once('open-file', (e, filepath) => {
    e.preventDefault();
    openfile = filepath;
  });
});

app.whenReady().then(async () => {
  const locale = app.getLocale();
  setLocales(locale);

  if (isDevelop) {
    const devtools = await searchDevtools('REACT');
    devtools &&
      (await session.defaultSession.loadExtension(devtools, {
        allowFileAccess: true,
      }));
  }

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
