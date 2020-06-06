const builder = require('electron-builder');

builder
  .build({
    config: {
      productName: 'LeafView',
      copyright: 'Copyright (C) 2020 Office Nishigami.',
      artifactName: '${productName}-${version}-${platform}.${ext}',
      files: ['dist/**/*'],
      publish: [
        {
          provider: 'github',
          releaseType: 'release',
        },
      ],
      directories: {
        buildResources: 'assets',
        output: 'release',
      },
      asar: true,
      asarUnpack: ['dist/preload.js'],
      win: {
        icon: 'assets/icon.ico',
        target: ['appx'],
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
        backgroundColor: '#1d3557',
        displayName: 'LeafView',
        languages: ['EN-US', 'JA-JP'],
        identityName: process.env.IDENTITY_NAME,
        publisher: process.env.PUBLISHER,
        publisherDisplayName: 'sprout2000',
      },
      mac: {
        appId: process.env.APP_BUNDLE_ID,
        category: 'public.app-category.photography',
        target: ['dmg', 'zip'],
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
          entitlements: 'scripts/entitlements.plist',
          entitlementsInherit: 'scripts/entitlements.plist',
        },
      },
      dmg: {
        icon: 'assets/dmg.icns',
        sign: false,
      },
      afterSign: 'scripts/notarize.js',
    },
  })
  .catch((err) => console.log(err));
