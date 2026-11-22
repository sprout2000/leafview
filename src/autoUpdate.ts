import { type BrowserWindow, dialog } from "electron";
import log from "electron-log";
import type Store from "electron-store";
import { autoUpdater } from "electron-updater";

/**
 * Checks for updates and asks the user to download and install them.
 * Only on macOS and Linux; Windows builds are not updated automatically.
 */
export const setupAutoUpdate = (
  win: BrowserWindow,
  store: Store<StoreType>,
) => {
  if (process.platform !== "darwin" && process.platform !== "linux") return;

  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;

  if (store.get("ask")) autoUpdater.checkForUpdates();

  autoUpdater.once("update-available", () => {
    dialog
      .showMessageBox(win, {
        message: "Update Notification",
        detail: "A new version is available.\nDo you want to download it now?",
        buttons: ["Not now", "OK"],
        defaultId: 1,
        cancelId: 0,
        checkboxLabel: "No update notifications required.",
      })
      .then((result) => {
        if (result.response === 1) {
          log.info("User chose to update...");
          autoUpdater.downloadUpdate();
        } else {
          log.info("User refused to update...");
          if (result.checkboxChecked) {
            log.info("User rejected the update notification.");
            store.set("ask", false);
          }
        }
      });
  });

  autoUpdater.once("update-not-available", () => {
    log.info("No updates available.");
  });

  autoUpdater.once("update-downloaded", () => {
    log.info("Updates downloaded...");
    dialog
      .showMessageBox(win, {
        message: "Install Updates",
        detail: "Updates downloaded.\nPlease restart LeafView...",
      })
      .then(() => {
        setImmediate(() => autoUpdater.quitAndInstall());
      })
      .catch((err) => log.info(`Updater Error: ${err}`));
  });
};
