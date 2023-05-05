import { notarize } from "@electron/notarize";
import type { AfterPackContext } from "electron-builder";

const notarizer = async (context: AfterPackContext) => {
  const { appOutDir } = context;
  const appName = context.packager.appInfo.productFilename;

  return notarize({
    tool: "notarytool",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: `${process.env.APPLE_ID}`,
    appleIdPassword: `${process.env.APPLE_ID_PASSWORD}`,
    teamId: `${process.env.TEAM_ID}`,
  });
};

export default notarizer;
