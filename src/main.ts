import { app, Menu, shell, dialog, ipcMain, session, nativeTheme, BrowserWindow } from 'electron';

import log from 'electron-log';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';

// import fs from 'node:fs';
import path from 'node:path';
import fs from 'fs-extra';

import mime from 'mime-types';
import i18next from 'i18next';

import { setLocales } from './setLocales';
import { createMenu } from './createMenu';

// eslint-disable-next-line no-console
console.log = log.log;
log.info('App starting...');

let openfile: string | null = null;

const isDarwin = process.platform === 'darwin';
const isDevelop = process.env.NODE_ENV === 'development';

const initWidth = 800;
const initHeight = 528;

// eslint-disable-next-line no-undef
const store = new Store<StoreType>({
  configFileMode: 0o666,
  defaults: {
    ask: true,
    x: undefined,
    y: undefined,
    width: initWidth,
    height: initHeight,
    darkMode: nativeTheme.shouldUseDarkColors,
    showMenu: true,
    currentFile: undefined,
    previousFile: undefined,
    nextFile: undefined,
    fileKeyBinds: [{ M: '/Users/fin/Pictures/foo' }],
  },
});

const getResourceDirectory = () => {
  return isDevelop
    ? path.join(process.cwd(), 'dist')
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'dist');
};

const checkmime = (filepath: string) => {
  const regexp = new RegExp(/bmp|ico|gif|jpeg|png|svg|webp|webm|mp4/);
  const mimetype = mime.lookup(filepath);

  return (mimetype && regexp.test(mimetype)) || false;
};

const isVideo = (filepath: string) => {
  const regexp = new RegExp(/webm|mp4/);
  const mimetype = mime.lookup(filepath);

  return (mimetype && regexp.test(mimetype)) || false;
};

const moveFile = async (filepath: string, destination: string) => {
  try {
    await fs.move(filepath, destination);
    console.log('success!');
  } catch (err) {
    console.error(err);
  }
};

// @TO-DO fix this complexity
// eslint-disable-next-line complexity
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
    icon: path.join(getResourceDirectory(), 'images/logo.png'),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1e1e' : '#f6f6f6',
    webPreferences: {
      safeDialogs: true,
      devTools: isDevelop,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (!isDarwin) mainWindow.setMenuBarVisibility(store.get('showMenu'));
  nativeTheme.themeSource = store.get('darkMode') ? 'dark' : 'light';

  const menu = createMenu(mainWindow, store);
  Menu.setApplicationMenu(menu);

  ipcMain.handle('move-file', async (_e: Event, path: string, destination: string) => {
    console.log('foo');
    return moveFile(path, destination);
  });

  ipcMain.handle('is-video', (_e: Event, filepath: string) => {
    return isVideo(filepath);
  });

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
          .sort(),
      )
      .catch((err) => console.info(err));
  });

  ipcMain.handle('open-dialog', async () => {
    return dialog
      .showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: `${i18next.t('Select a directory')}`,
      })
      .then((result) => {
        if (result.canceled) return;
        if (path.basename(result.filePaths[0]).startsWith(dotfiles)) return;

        return result.filePaths[0];
      })
      .catch((err) => console.info(err));
  });

  ipcMain.handle('move-to-trash', async (_e: Event, filepath: string) => {
    await shell.trashItem(filepath).then(() => shell.beep());
  });

  ipcMain.handle('update-title', (_e: Event, filepath: string) => {
    mainWindow.setTitle(filepath);
  });

  ipcMain.handle('get-locale', () => store.get('language') || app.getLocale());

  ipcMain.handle('file-history', (_e, arg) => app.addRecentDocument(arg));

  ipcMain.handle('show-context-menu', () => {
    if (!mainWindow.isMenuBarVisible()) menu.popup();
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
    const extPath = path.resolve(process.cwd(), 'devtools');
    if (extPath) {
      session.defaultSession.loadExtension(extPath, { allowFileAccess: true });
    }
  }

  if (isDarwin || process.platform === 'linux') {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;

    if (store.get('ask')) autoUpdater.checkForUpdates();

    autoUpdater.once('update-available', () => {
      dialog
        .showMessageBox(mainWindow, {
          message: 'Update Notification',
          detail: 'A new version is available.\nDo you want to download it now?',
          buttons: ['Not now', 'OK'],
          defaultId: 1,
          cancelId: 0,
          checkboxLabel: 'No update notifications required.',
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

    autoUpdater.once('update-not-available', () => {
      log.info('No updates available.');
    });

    autoUpdater.once('update-downloaded', () => {
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
  mainWindow.once('ready-to-show', () => {
    if (isDevelop) mainWindow.webContents.openDevTools({ mode: 'right' });
    mainWindow.show();
  });

  mainWindow.once('close', () => {
    const { x, y, width, height } = mainWindow.getBounds();
    store.set({ x, y, width, height });
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    console.log(event);
    // if (input.key.toLowerCase() === 'i') {
    //   console.log('bar');
    //   console.log('Pressed Control+I');
    //   event.preventDefault();
    // }
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
