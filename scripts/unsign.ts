import { build } from 'electron-builder';

build({
  config: {
    productName: 'LeafView',
    artifactName: '${productName}-${version}-${platform}-${arch}.${ext}',
    copyright: '© 2020 sprout2000 and other contributors.',
    files: ['dist/**/*'],
    directories: {
      output: 'release',
    },
    win: {
      icon: 'assets/icon.ico',
      target: ['nsis', 'zip'],
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
      artifactName:
        '${productName}-${version}-${platform}-${arch}-installer.${ext}',
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
    linux: {
      artifactName: '${productName}-${version}-${platform}-x64.${ext}',
      icon: 'assets/linux.icns',
      target: ['AppImage'],
      category: 'Graphics',
    },
  },
}).catch((err) => console.log(err));
