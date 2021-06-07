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

import { TypedStore } from './TypedStore';

import path from 'path';
import i18next from 'i18next';

export const createMenu = (
  win: BrowserWindow,
  store: Store<TypedStore>
): Menu => {
  const darwin = process.platform === 'darwin';
  const dotfiles = darwin ? '.' : '._';

  const helpSub: MenuItemConstructorOptions[] = [
    {
      label: i18next.t('support'),
      click: async (): Promise<void> =>
        await shell.openExternal(
          'https://github.com/sprout2000/leafview/#readme'
        ),
    },
    {
      label: i18next.t('about'),
      accelerator: 'CmdOrCtrl+I',
      click: (): void => app.showAboutPanel(),
    },
  ];

  if (process.env.NODE_ENV === 'development') {
    helpSub.push(
      { type: 'separator' },
      {
        label: i18next.t('toggleDevtools'),
        accelerator: darwin ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
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
      label: i18next.t('file'),
      submenu: [
        {
          label: i18next.t('open'),
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
          label: i18next.t('trash'),
          accelerator: 'Delete',
          click: (): void => win.webContents.send('menu-remove'),
        },
        { type: 'separator' },
        {
          label: darwin ? i18next.t('close') : i18next.t('quit'),
          accelerator: darwin ? 'Cmd+W' : 'Alt+F4',
          role: darwin ? 'close' : 'quit',
        },
      ],
    },
    {
      label: i18next.t('view'),
      submenu: [
        {
          label: i18next.t('next'),
          accelerator: 'J',
          click: (): void => win.webContents.send('menu-next'),
        },
        {
          label: i18next.t('prev'),
          accelerator: 'K',
          click: (): void => win.webContents.send('menu-prev'),
        },
        { type: 'separator' },
        {
          label: i18next.t('toggleFullscreen'),
          role: 'togglefullscreen',
        },
      ],
    },
  ];

  if (!darwin) {
    template.push(
      {
        label: i18next.t('window'),
        submenu: [
          {
            label: i18next.t('minimize'),
            role: 'minimize',
          },
          {
            label: i18next.t('maximize'),
            accelerator: 'Ctrl+L',
            click: (): void => {
              win.isMaximized() ? win.unmaximize() : win.maximize();
            },
          },
          {
            label: i18next.t('toggleMenubar'),
            accelerator: 'Ctrl+T',
            click: (): void => {
              win.setMenuBarVisibility(!win.menuBarVisible);
            },
          },
          {
            label: i18next.t('toggleDarkmode'),
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
            label: i18next.t('close'),
            role: 'close',
          },
        ],
      },
      {
        label: i18next.t('help'),
        role: 'help',
        submenu: helpSub,
      }
    );
  }

  if (darwin) {
    template.push(
      {
        label: i18next.t('window'),
        submenu: [
          {
            label: i18next.t('minimize'),
            role: 'minimize',
          },
          {
            label: i18next.t('zoom'),
            accelerator: 'Cmd+L',
            role: 'zoom',
          },
          { type: 'separator' },
          {
            label: i18next.t('toggleDarkmode'),
            type: 'checkbox',
            id: 'darkmode',
            accelerator: 'Cmd+D',
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
            label: i18next.t('bringAllToFront'),
            role: 'front',
          },
        ],
      },
      {
        label: i18next.t('help'),
        role: 'help',
        submenu: helpSub,
      }
    );

    template.unshift({
      label: 'LeafView',
      submenu: [
        {
          label: i18next.t('about'),
          accelerator: 'Cmd+I',
          role: 'about',
        },
        { type: 'separator' },
        {
          label: i18next.t('hide'),
          role: 'hide',
        },
        {
          label: i18next.t('hideOthers'),
          role: 'hideOthers',
        },
        {
          label: i18next.t('unhide'),
          role: 'unhide',
        },
        { type: 'separator' },
        {
          label: i18next.t('quit'),
          role: 'quit',
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  return menu;
};
