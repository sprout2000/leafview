import {
  app,
  dialog,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  nativeTheme,
  shell,
} from 'electron';

import path from 'node:path';
import i18next from 'i18next';
import Store from 'electron-store';

const localeList: Locale[] = [
  'ar',
  'cs',
  'de',
  'en',
  'es',
  'fr',
  'hu',
  'ja',
  'pl',
  'pt',
  'ru',
  'tr',
  'zh-CN',
  'zh-TW',
];

const translate = (locale: Locale) => {
  switch (locale) {
    case 'ar':
      return 'اللغة العربية';
    case 'cs':
      return 'Čeština';
    case 'de':
      return 'Deutsch';
    case 'en':
      return 'English';
    case 'es':
      return 'Español';
    case 'fr':
      return 'Français';
    case 'hu':
      return 'Magyar';
    case 'ja':
      return '日本語';
    case 'pl':
      return 'Polski';
    case 'pt':
      return 'Português';
    case 'ru':
      return 'Русский';
    case 'zh-CN':
      return '简体中文';
    case 'zh-TW':
      return '繁体中文';
    default:
      return 'English';
  }
};

export const createMenu = (win: BrowserWindow, store: Store<StoreType>) => {
  const isDarwin = process.platform === 'darwin';
  const dotfiles = isDarwin ? '.' : '._';

  const fileSub: MenuItemConstructorOptions = {
    label: i18next.t('File'),
    submenu: [
      {
        label: i18next.t('Open...'),
        accelerator: 'CmdOrCtrl+O',
        click: async () => {
          await dialog
            .showOpenDialog(win, {
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

              if (path.basename(result.filePaths[0]).startsWith(dotfiles)) {
                return;
              }

              win.webContents.send('menu-open', result.filePaths[0]);
            })
            .catch((err) => console.log(err));
        },
      },
      { type: 'separator' },
      {
        label: i18next.t('Move to Trash'),
        accelerator: 'Delete',
        click: () => win.webContents.send('menu-remove'),
      },
      { type: 'separator' },
      {
        label: i18next.t('Close'),
        accelerator: isDarwin ? 'Cmd+W' : 'Alt+F4',
        role: 'close',
      },
    ],
  };

  const langSub: MenuItemConstructorOptions[] = [];

  localeList.map((locale) => {
    langSub.push({
      label: translate(locale),
      type: 'radio',
      id: `language-${locale}`,
      click: () => {
        if (store.get('language') !== locale) {
          store.set('language', locale);
          dialog
            .showMessageBox(win, {
              message: i18next.t('Warning'),
            })
            .then(() => {
              setImmediate(() => {
                app.relaunch();
                app.exit(0);
              });
            });
        }
      },
      checked: store.get('language') === locale,
    });
  });

  const viewSub: MenuItemConstructorOptions[] = [
    {
      label: i18next.t('Next Image'),
      accelerator: 'J',
      click: () => win.webContents.send('menu-next'),
    },
    {
      label: 'Next Image (invisible)',
      accelerator: 'Ctrl+N',
      click: () => win.webContents.send('menu-next'),
      visible: false,
    },
    {
      label: 'Next Image (invisible)',
      accelerator: 'CmdOrCtrl+Right',
      click: () => win.webContents.send('menu-next'),
      visible: false,
    },
    {
      label: i18next.t('Prev Image'),
      accelerator: 'K',
      click: () => win.webContents.send('menu-prev'),
    },
    {
      label: 'Prev Image (invisible)',
      accelerator: 'Ctrl+P',
      click: () => win.webContents.send('menu-prev'),
      visible: false,
    },
    {
      label: 'Prev Image (invisible)',
      accelerator: 'CmdOrCtrl+Left',
      click: () => win.webContents.send('menu-prev'),
      visible: false,
    },
    { type: 'separator' },
    {
      label: i18next.t('Toggle Dark Mode'),
      accelerator: 'CmdOrCtrl+T',
      type: 'checkbox',
      checked: store.get('darkmode'),
      click: () => {
        nativeTheme.themeSource = store.get('darkmode') ? 'light' : 'dark';
        store.set('darkmode', !store.get('darkmode'));
      },
    },
  ];

  if (!isDarwin) {
    viewSub.push(
      {
        label: i18next.t('Toggle Menubar'),
        accelerator: 'Alt+T',
        click: () => {
          win.setMenuBarVisibility(!win.menuBarVisible);
          store.set('showmenu', !store.get('showmenu'));
        },
      },
      {
        label: i18next.t('Language'),
        submenu: langSub,
      },
      { type: 'separator' },
      {
        label: i18next.t('Toggle Fullscreen'),
        role: 'togglefullscreen',
        accelerator: 'F11',
      }
    );
  } else {
    viewSub.push({
      label: i18next.t('Language'),
      submenu: langSub,
    });
  }

  const helpSub: MenuItemConstructorOptions[] = [
    {
      label: i18next.t('Support URL...'),
      click: async () =>
        shell.openExternal('https://github.com/sprout2000/leafview/#readme'),
    },
  ];

  const aboutItem: MenuItemConstructorOptions = {
    label: i18next.t(isDarwin ? 'About LeafView' : 'About'),
    accelerator: 'CmdOrCtrl+I',
    click: () => app.showAboutPanel(),
  };

  if (process.platform === 'linux') {
    helpSub.push(
      {
        label: 'Automatic update',
        type: 'checkbox',
        checked: store.get('ask'),
        click: () => store.set('ask', !store.get('ask')),
      },
      { type: 'separator' },
      aboutItem
    );
  }

  if (process.platform === 'win32') {
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
          label: i18next.t('Zoom'),
          click: () => {
            win.isMaximized() ? win.unmaximize() : win.maximize();
          },
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
          label: 'Automatic update',
          type: 'checkbox',
          checked: store.get('ask'),
          click: () => store.set('ask', !store.get('ask')),
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
