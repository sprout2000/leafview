import dotenv from "dotenv";
import { build } from "electron-builder";

dotenv.config();

build({
  config: {
    productName: "LeafView",
    artifactName: "${productName}-${version}-${platform}-${arch}.${ext}",
    copyright: "© 2020-2024 sprout2000",
    asarUnpack: ["dist/images/logo.png"],
    directories: {
      output: "release",
      buildResources: "assets",
    },
    publish: {
      provider: "github",
      releaseType: "release",
    },
    files: ["dist/**/*"],
    linux: {
      category: "Graphics",
      icon: "assets/linux.icns",
      target: ["AppImage", "deb", "zip"],
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
      target: ["nsis", "zip"],
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
      target: [
        {
          target: "default",
          arch: ["x64", "arm64"],
        },
      ],
      icon: "assets/icon.icns",
      darkModeSupport: true,
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
      notarize: {
        teamId: "285FKU3L4F",
      },
    },
  },
});
