import {
  app,
  dialog,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  shell,
  nativeTheme,
} from 'electron';
import Store from 'electron-store';

import { TypedStore } from './lib/TypedStore';

import path from 'path';
import i18next from 'i18next';

export const createMenu = (
  win: BrowserWindow,
  store: Store<TypedStore>
): Menu => {
  const isLinux = process.platform === 'linux';
  const isDarwin = process.platform === 'darwin';
  const dotfiles = isDarwin ? '.' : '._';

  const closeAccelerator = () => {
    if (isDarwin) {
      return 'Cmd+W';
    }
    return isLinux ? 'Ctrl+Q' : 'Alt+F4';
  };

  const fileSub: MenuItemConstructorOptions = {
    label: i18next.t('File'),
    submenu: [
      {
        label: i18next.t('Open...'),
        accelerator: 'CmdOrCtrl+O',
        click: async (): Promise<void> => {
          await dialog
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
                    'png',
                    'svg',
                    'webp',
                  ],
                },
              ],
            })
            .then((result): void => {
              if (result.canceled) return;

              if (path.basename(result.filePaths[0]).startsWith(dotfiles)) {
                return;
              }

              win.webContents.send('menu-open', result.filePaths[0]);
            })
            .catch((err): void => console.log(err));
        },
      },
      { type: 'separator' },
      {
        label: i18next.t('Move to Trash'),
        accelerator: 'Delete',
        click: (): void => win.webContents.send('menu-remove'),
      },
      { type: 'separator' },
      {
        label: isDarwin ? i18next.t('Close') : i18next.t('Quit'),
        accelerator: closeAccelerator(),
        role: isDarwin ? 'close' : 'quit',
      },
    ],
  };

  const viewSub: MenuItemConstructorOptions = {
    label: i18next.t('View'),
    submenu: [
      {
        label: i18next.t('Next Image'),
        accelerator: 'J',
        click: (): void => win.webContents.send('menu-next'),
      },
      {
        label: i18next.t('Prev Image'),
        accelerator: 'K',
        click: (): void => win.webContents.send('menu-prev'),
      },
      { type: 'separator' },
      {
        label: i18next.t('Toggle Fullscreen'),
        role: 'togglefullscreen',
      },
      /// #if DEBUG
      { type: 'separator' },
      {
        label: 'Toggle Developer Tools',
        role: 'toggleDevTools',
      },
      /// #endif
    ],
  };

  const windowSub: MenuItemConstructorOptions[] = [
    {
      label: i18next.t('Minimize'),
      role: 'minimize',
    },
    {
      label: i18next.t('Maximize'),
      accelerator: 'CmdOrCtrl+L',
      click: (): void => {
        win.isMaximized() ? win.unmaximize() : win.maximize();
      },
    },
  ];

  const toggleMenubar: MenuItemConstructorOptions = {
    label: i18next.t('Toggle Menubar'),
    accelerator: 'Ctrl+T',
    click: (): void => {
      if (win.menuBarVisible) {
        store.set('menubar', false);
        win.setMenuBarVisibility(false);
      } else {
        store.set('menubar', true);
        win.setMenuBarVisibility(true);
      }
    },
  };

  const toggleDarkmode: MenuItemConstructorOptions = {
    label: i18next.t('Toggle Dark Mode'),
    type: 'checkbox',
    id: 'darkmode',
    accelerator: 'CmdOrCtrl+D',
    click: () => {
      if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'light';
        store.set('darkmode', false);
      } else {
        nativeTheme.themeSource = 'dark';
        store.set('darkmode', true);
      }
    },
    checked: nativeTheme.shouldUseDarkColors,
  };

  if (!isDarwin) {
    windowSub.push(
      { type: 'separator' },
      toggleMenubar,
      toggleDarkmode,
      { type: 'separator' },
      {
        label: i18next.t('Close'),
        role: 'close',
      }
    );
  } else {
    windowSub.push(
      { type: 'separator' },
      toggleDarkmode,
      { type: 'separator' },
      {
        label: i18next.t('Bring All to Front'),
        role: 'front',
      }
    );
  }

  const helpSub: MenuItemConstructorOptions[] = [
    {
      label: i18next.t('Support URL...'),
      click: async (): Promise<void> =>
        shell.openExternal('https://github.com/sprout2000/leafview/#readme'),
    },
  ];

  const aboutItem: MenuItemConstructorOptions = {
    label: i18next.t(isDarwin ? 'About LeafView' : 'About'),
    accelerator: 'CmdOrCtrl+I',
    click: (): void => app.showAboutPanel(),
  };

  if (!isDarwin) {
    helpSub.push(aboutItem);
  }

  if (process.env.NODE_ENV === 'development') {
    helpSub.push(
      { type: 'separator' },
      {
        label: i18next.t('Toggle Developer Tools'),
        accelerator: isDarwin ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
        click: (): void => {
          if (win.webContents.isDevToolsOpened()) {
            win.webContents.closeDevTools();
          } else {
            win.webContents.openDevTools({ mode: 'detach' });
          }
        },
      }
    );
  }

  const template: MenuItemConstructorOptions[] = [
    fileSub,
    viewSub,
    {
      label: i18next.t('Window'),
      submenu: windowSub,
    },
    {
      label: i18next.t('Help'),
      role: 'help',
      submenu: helpSub,
    },
  ];

  if (isDarwin) {
    template.unshift({
      label: 'LeafView',
      submenu: [
        aboutItem,
        { type: 'separator' },
        {
          label: i18next.t('Hide LeafView'),
          role: 'hide',
        },
        {
          label: i18next.t('Hide Others'),
          role: 'hideOthers',
        },
        {
          label: i18next.t('Show All'),
          role: 'unhide',
        },
        { type: 'separator' },
        {
          label: i18next.t('Quit LeafView'),
          role: 'quit',
        },
      ],
    });
  }

  return Menu.buildFromTemplate(template);
};
