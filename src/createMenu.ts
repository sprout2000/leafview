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

import path from 'path';
import i18next from 'i18next';
import { StoreType } from './StoreType';

export const createMenu = (
  win: BrowserWindow,
  store: Store<StoreType>
): Menu => {
  const isWin32 = process.platform === 'win32';
  const isDarwin = process.platform === 'darwin';
  const dotfiles = isDarwin ? '.' : '._';

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
        accelerator: isDarwin ? 'Cmd+W' : isWin32 ? 'Alt+F4' : 'Ctrl+Q',
        role: isDarwin ? 'close' : 'quit',
      },
    ],
  };

  const viewSub: MenuItemConstructorOptions[] = [
    {
      label: i18next.t('Next Image'),
      accelerator: 'J',
      click: (): void => win.webContents.send('menu-next'),
    },
    {
      label: 'Next Image (invisible)',
      accelerator: 'CmdOrCtrl+N',
      click: (): void => win.webContents.send('menu-next'),
      visible: false,
    },
    {
      label: 'Next Image (invisible)',
      accelerator: 'CmdOrCtrl+Right',
      click: (): void => win.webContents.send('menu-next'),
      visible: false,
    },
    {
      label: i18next.t('Prev Image'),
      accelerator: 'K',
      click: (): void => win.webContents.send('menu-prev'),
    },
    {
      label: 'Prev Image (invisible)',
      accelerator: 'CmdOrCtrl+P',
      click: (): void => win.webContents.send('menu-prev'),
      visible: false,
    },
    {
      label: 'Prev Image (invisible)',
      accelerator: 'CmdOrCtrl+Left',
      click: (): void => win.webContents.send('menu-prev'),
      visible: false,
    },
    { type: 'separator' },
  ];

  if (!isDarwin) {
    viewSub.push({
      label: i18next.t('Toggle Fullscreen'),
      role: 'togglefullscreen',
      accelerator: 'F11',
    });
  }

  if (isDarwin || isWin32) {
    viewSub.push({
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
    });
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

  const template: MenuItemConstructorOptions[] = [
    fileSub,
    {
      label: i18next.t('View'),
      submenu: viewSub,
    },
    {
      label: i18next.t('Window'),
      submenu: [
        {
          label: i18next.t('Minimize'),
          role: 'minimize',
          accelerator: 'CmdOrCtrl+M',
        },
        {
          label: i18next.t('Maximize'),
          accelerator: 'CmdOrCtrl+L',
          click: (): void => {
            win.isMaximized() ? win.unmaximize() : win.maximize();
          },
        },
        { type: 'separator' },
        {
          label: i18next.t('Toggle Developer Tools'),
          click: () => {
            if (win.webContents.isDevToolsOpened()) {
              win.webContents.closeDevTools();
            } else {
              win.webContents.openDevTools({ mode: 'detach' });
            }
          },
          accelerator: isDarwin ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
        },
        { type: 'separator' },
        isDarwin
          ? {
              label: i18next.t('Bring All to Front'),
              role: 'front',
            }
          : {
              label: i18next.t('Close'),
              role: 'close',
              accelerator: 'Ctrl+W',
            },
      ],
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
