import { build } from 'electron-builder';

build({
  config: {
    productName: 'LeafView',
    artifactName: '${productName}-${version}-${platform}-x64.${ext}',
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
      target: ['zip', 'AppImage', 'deb', 'rpm'],
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
  },
}).catch((err) => console.log(err));
