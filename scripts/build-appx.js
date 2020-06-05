require('dotenv').config();
const builder = require('electron-builder');

builder
  .build({
    config: {
      productName: 'ELView',
      copyright: 'Copyright (C) 2020 sprout2000.',
      artifactName: '${productName}-${version}-${platform}.${ext}',
      files: ['dist/**/*'],
      directories: {
        buildResources: 'assets',
        output: 'release',
      },
      asar: true,
      asarUnpack: ['dist/preload.js'],
      win: {
        icon: 'assets/icon.ico',
        target: ['appx'],
        fileAssociations: [
          {
            ext: ['png'],
            description: 'PNG files',
          },
        ],
      },
      appx: {
        applicationId: 'sprout2000.ELView',
        backgroundColor: '#1d3557',
        displayName: 'ELView',
        identityName: process.env.IDENTITY_NAME,
        publisher: process.env.PUBLISHER,
        publisherDisplayName: 'sprout2000',
      },
    },
  })
  .catch((err) => console.log(err));
