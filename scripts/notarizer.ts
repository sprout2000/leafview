import { notarize } from "@electron/notarize";
import type { AfterPackContext } from "electron-builder";

const notarizer = async (context: AfterPackContext) => {
  const { appOutDir } = context;
  const appName = context.packager.appInfo.productFilename;

  return notarize({
    appBundleId: "jp.wassabie64.LeafView",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: `${process.env.APPLE_ID}`,
    appleIdPassword: `${process.env.APPLE_ID_PASSWORD}`,
    ascProvider: `${process.env.ASC_PROVIDER}`,
  });
};

export default notarizer;
