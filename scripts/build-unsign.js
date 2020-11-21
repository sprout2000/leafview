const builder = require('electron-builder');

builder
  .build({
    config: {
      productName: 'LeafView',
      copyright: 'Copyright (C) 2020 sprout2000.',
      files: ['dist/**/*'],
      directories: {
        output: 'release',
      },
      asar: true,
      asarUnpack: ['dist/preload.js'],
      win: {
        artifactName: '${productName}-${version}-${platform}.${ext}',
        icon: 'assets/icon.ico',
        target: ['nsis'],
        publisherName: 'sprout2000',
        fileAssociations: [
          {
            ext: ['bmp', 'gif', 'jpeg', 'jpg', 'png', 'ico', 'svg', 'webp'],
            description: 'Image files',
          },
        ],
      },
      nsis: {
        oneClick: false,
        perMachine: false,
        createDesktopShortcut: false,
        createStartMenuShortcut: true,
        installerIcon: 'assets/installer.ico',
        artifactName: '${productName}-${version}-installer.${ext}',
      },
      mac: {
        artifactName: '${productName}-${version}-${platform}-x64.${ext}',
        category: 'public.app-category.photography',
        target: ['dmg'],
        icon: 'assets/icon.icns',
        extendInfo: {
          CFBundleName: 'LeafView',
          CFBundleDisplayName: 'LeafView',
          CFBundleExecutable: 'LeafView',
          CFBundlePackageType: 'APPL',
          CFBundleDocumentTypes: [
            {
              CFBundleTypeName: 'ImageFile',
              CFBundleTypeRole: 'Viewer',
              LSItemContentTypes: [
                'com.google.webp',
                'com.microsoft.bmp',
                'com.microsoft.ico',
                'com.compuserve.gif',
                'public.jpeg',
                'public.png',
              ],
              LSHandlerRank: 'Default',
            },
          ],
          NSRequiresAquaSystemAppearance: false,
        },
      },
      dmg: {
        icon: 'assets/dmg.icns',
      },
    },
  })
  .catch((err) => console.log(err));
