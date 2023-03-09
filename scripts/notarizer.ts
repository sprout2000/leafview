import dotenv from "dotenv";
import { notarize } from "@electron/notarize";
import type { AfterPackContext } from "electron-builder";

const notarizer = async (context: AfterPackContext) => {
  dotenv.config();

  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return notarize({
    tool: "notarytool",
    appPath: `${appOutDir}/${appName}.app`,
    teamId: `${process.env.TEAM_ID}`,
    appleId: `${process.env.APPLE_ID}`,
    appleIdPassword: `${process.env.APPLE_ID_PASSWORD}`,
  });
};

export default notarizer;
