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
    mac: {
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
    afterSign: 'scripts/notarizing.ts',
  },
}).catch((err) => console.log(err));