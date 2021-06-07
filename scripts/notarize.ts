import dotenv from 'dotenv';
import { AfterPackContext } from 'electron-builder';
import { notarize } from 'electron-notarize';

const notarizing = async (context: AfterPackContext): Promise<void> => {
  dotenv.config();

  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return notarize({
    appBundleId: process.env.APP_BUNDLE_ID as string,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID as string,
    appleIdPassword: process.env.APPLE_ID_PASSWORD as string,
    ascProvider: process.env.ASC_PROVIDER,
  });
};

export default notarizing;
