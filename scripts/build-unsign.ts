import { build } from 'electron-builder';

build({
  config: {
    productName: 'LeafView',
    artifactName: '${productName}-${version}-${platform}.${ext}',
    copyright: 'Copyright (C) 2020 sprout2000.',
    files: ['dist/**/*'],
    directories: {
      output: 'release',
    },
    asar: true,
    asarUnpack: ['dist/preload.js'],
    win: {
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
      artifactName: '${productName}-${version}-${platform}-installer.${ext}',
    },
    mac: {
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
      identity: null,
    },
    dmg: {
      icon: 'assets/dmg.icns',
    },
  },
}).catch((err) => console.log(err));
