import {
  app,
  dialog,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  shell,
} from 'electron';
import i18next from 'i18next';

const createMenu = (win: BrowserWindow): Menu => {
  const darwin = process.platform === 'darwin';

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
                      'apng',
                      'png',
                      'svg',
                      'webp',
                    ],
                  },
                ],
              })
              .then((result): void => {
                if (result.canceled) return;
                win.webContents.send('selected-file', result.filePaths[0]);
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
          accelerator: darwin ? 'Cmd+W' : 'Ctrl+Q',
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
        submenu: [
          {
            label: i18next.t('support'),
            click: async (): Promise<void> =>
              await shell.openExternal(
                'https://github.com/sprout2000/lessview#readme'
              ),
          },
          { type: 'separator' },
          {
            label: i18next.t('about'),
            accelerator: 'Ctrl+I',
            click: (): void => app.showAboutPanel(),
          },
        ],
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
            label: i18next.t('bringAllToFront'),
            role: 'front',
          },
        ],
      },
      {
        label: i18next.t('help'),
        role: 'help',
        submenu: [
          {
            label: i18next.t('support'),
            click: async (): Promise<void> =>
              await shell.openExternal(
                'https://github.com/sprout2000/lessview#readme'
              ),
          },
        ],
      }
    );

    template.unshift({
      label: 'LessView',
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

export default createMenu;
