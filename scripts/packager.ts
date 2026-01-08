import { build } from "electron-builder";

build({
  config: {
    productName: "LeafView",
    artifactName: "${productName}-${version}-${platform}-${arch}.${ext}",
    copyright: "© 2020-2026 sprout2000",
    asarUnpack: ["dist/images/logo.png"],
    directories: {
      output: "release",
      buildResources: "assets",
    },
    files: ["dist/**/*"],
    linux: {
      category: "Graphics",
      icon: "assets/linux.icns",
      target: ["AppImage", "deb"],
      mimeTypes: [
        "image/bmp",
        "image/gif",
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/svg+xml",
        "image/vnd.microsoft.icon",
      ],
    },
    win: {
      icon: "assets/icon.ico",
      target: ["nsis"],
      publisherName: "sprout2000",
      fileAssociations: [
        {
          ext: ["bmp", "gif", "jpeg", "jpg", "png", "ico", "svg", "webp"],
          description: "Image files",
        },
      ],
    },
    nsis: {
      oneClick: false,
      perMachine: false,
      createDesktopShortcut: false,
      createStartMenuShortcut: true,
      installerIcon: "assets/installer.ico",
      artifactName:
        "${productName}-${version}-${platform}-${arch}-installer.${ext}",
    },
    mac: {
      appId: "jp.wassabie64.LeafView",
      category: "public.app-category.photography",
      target: ["dmg"],
      icon: "assets/icon.icns",
      darkModeSupport: true,
      identity: null,
      extendInfo: {
        CFBundleName: "LeafView",
        CFBundleDisplayName: "LeafView",
        CFBundleExecutable: "LeafView",
        CFBundlePackageType: "APPL",
        CFBundleDocumentTypes: [
          {
            CFBundleTypeName: "ImageFile",
            CFBundleTypeRole: "Viewer",
            LSItemContentTypes: [
              "com.google.webp",
              "com.microsoft.bmp",
              "com.microsoft.ico",
              "com.compuserve.gif",
              "public.jpeg",
              "public.png",
            ],
            LSHandlerRank: "Default",
          },
        ],
        NSRequiresAquaSystemAppearance: false,
      },
    },
  },
});
