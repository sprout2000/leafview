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
  const viewSub: MenuItemConstructorOptions[] = [
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
  ];

  if (process.env.NODE_ENV === 'development') {
    viewSub.push(
      { type: 'separator' },
      {
        label: 'Toggle Developer Tools',
        role: 'toggleDevTools',
      }
    );
  }

  const helpSub: MenuItemConstructorOptions[] = [
    {
      label: i18next.t('Support URL...'),
      click: async (): Promise<void> =>
        shell.openExternal('https://github.com/sprout2000/leafview/#readme'),
    },
    {
      label: i18next.t('About'),
      accelerator: 'Ctrl+I',
      click: (): void => app.showAboutPanel(),
    },
  ];

  if (process.env.NODE_ENV === 'development') {
    helpSub.push(
      { type: 'separator' },
      {
        label: i18next.t('Toggle Developer Tools'),
        accelerator: 'Ctrl+Shift+I',
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
    {
      label: i18next.t('File'),
      submenu: [
        {
          label: i18next.t('Open...'),
          accelerator: 'Ctrl+O',
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

                if (path.basename(result.filePaths[0]).startsWith('._')) {
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
          label: i18next.t('Quit'),
          accelerator: 'Alt+F4',
          role: 'quit',
        },
      ],
    },
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
        },
        {
          label: i18next.t('Maximize'),
          accelerator: 'Ctrl+L',
          click: (): void => {
            win.isMaximized() ? win.unmaximize() : win.maximize();
          },
        },
        { type: 'separator' },
        {
          label: i18next.t('Toggle Dark Mode'),
          type: 'checkbox',
          id: 'darkmode',
          accelerator: 'Ctrl+D',
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
        },
        { type: 'separator' },
        {
          label: i18next.t('Close'),
          role: 'close',
        },
      ],
    },
    {
      label: i18next.t('Help'),
      role: 'help',
      submenu: helpSub,
    },
  ];

  return Menu.buildFromTemplate(template);
};
