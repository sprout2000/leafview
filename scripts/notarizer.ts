import { notarize } from "@electron/notarize";
import type { AfterPackContext } from "electron-builder";

import dotenv from "dotenv";
dotenv.config();

const notarizer = async (context: AfterPackContext) => {
  const { appOutDir } = context;
  const appName = context.packager.appInfo.productFilename;

  return notarize({
    tool: "notarytool",
    appPath: `${appOutDir}/${appName}.app`,
    teamId: `${process.env.TEAM_ID}`,
    appleId: `${process.env.APPLE_ID}`,
    appleIdPassword: `${process.env.APPLE_APP_SPECIFIC_PASSWORD}`,
  });
};

export default notarizer;
