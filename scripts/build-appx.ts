import dotenv from 'dotenv';
import { build } from 'electron-builder';

dotenv.config();

build({
  config: {
    productName: 'LeafView',
    artifactName: '${productName}-${version}-${platform}.${ext}',
    copyright: 'Copyright (C) 2020-2021 sprout2000.',
    files: ['dist/**/*'],
    directories: {
      buildResources: 'assets',
      output: 'release',
    },
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
      showNameOnTiles: true,
      languages: [
        'en-US',
        'ja-JP',
        'cs-CZ',
        'de-AT',
        'de-CH',
        'de-DE',
        'es-ES',
        'es-MX',
        'es-US',
        'pl-PL',
        'ru-RU',
      ],
      identityName: process.env.IDENTITY_NAME,
      publisher: process.env.PUBLISHER,
      publisherDisplayName: 'sprout2000',
    },
  },
}).catch((err) => console.log(err));
