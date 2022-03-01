import dotenv from 'dotenv';
import { build } from 'electron-builder';

dotenv.config();

build({
  config: {
    productName: 'LeafView',
    artifactName: '${productName}-${version}-${platform}-${arch}.${ext}',
    copyright: '© 2020 sprout2000 and other contributors.',
    files: ['dist/**/*'],
    directories: {
      buildResources: 'assets',
      output: 'release',
    },
    publish: [
      {
        provider: 'github',
        releaseType: 'release',
      },
    ],
    linux: {
      category: 'Graphics',
      icon: 'assets/linux.icns',
      asarUnpack: ['dist/images/logo.png'],
      target: ['zip', 'AppImage'],
      mimeTypes: [
        'image/bmp',
        'image/gif',
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/svg+xml',
        'image/vnd.microsoft.icon',
      ],
    },
    win: {
      icon: 'assets/icon.ico',
      target: ['appx', 'nsis'],
      publisherName: 'sprout2000',
      fileAssociations: [
        {
          ext: ['bmp', 'gif', 'jpeg', 'jpg', 'png', 'ico', 'svg', 'webp'],
          description: 'Image files',
        },
      ],
    },
    appx: {
      applicationId: 'sprout2000.LeafView',
      backgroundColor: '#ffffff',
      displayName: 'LeafView',
      showNameOnTiles: true,
      languages: [
        'en-US',
        'ja-JP',
        'cs-CZ',
        'de-DE',
        'es-ES',
        'pl-PL',
        'ru-RU',
        'pt-PT',
        'zh-CN',
        'zh-TW',
      ],
      identityName: process.env.IDENTITY_NAME,
      publisher: process.env.PUBLISHER,
      publisherDisplayName: 'sprout2000',
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
      identity: process.env.UNSIGN && null,
      appId: process.env.APP_BUNDLE_ID,
      category: 'public.app-category.photography',
      target: {
        target: 'default',
        arch: ['x64', 'arm64'],
      },
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
        hardenedRuntime: true,
        gatekeeperAssess: false,
      },
    },
    dmg: {
      icon: 'assets/dmg.icns',
      sign: false,
    },
    afterSign: process.env.UNSIGN ? undefined : 'scripts/notarize.ts',
  },
}).catch((err) => console.log(err));
