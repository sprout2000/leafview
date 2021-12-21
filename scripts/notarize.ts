import dotenv from 'dotenv';
import { notarize } from 'electron-notarize';
import { AfterPackContext } from 'electron-builder';

const notarizing = async (context: AfterPackContext) => {
  dotenv.config();

  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return notarize({
    ascProvider: process.env.ASC_PROVIDER,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID as string,
    appBundleId: process.env.APP_BUNDLE_ID as string,
    appleIdPassword: process.env.APPLE_ID_PASSWORD as string,
  });
};

export default notarizing;
