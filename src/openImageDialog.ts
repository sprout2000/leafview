import { app, type BrowserWindow, dialog } from "electron";
import type Store from "electron-store";
import i18next from "i18next";

import { isDotfile, resolveExistingDir } from "./fileUtils";

/**
 * Shows the dialog to open an image, starting in the folder opened last time.
 * Resolves with the selected path, or undefined when the dialog is canceled
 * or a dotfile is selected.
 *
 * Shared by the toolbar ("open-dialog") and the menu ("Open...").
 */
export const showOpenImageDialog = async (
  win: BrowserWindow,
  store: Store<StoreType>,
) => {
  const result = await dialog.showOpenDialog(win, {
    defaultPath: resolveExistingDir(
      store.get("lastDir"),
      app.getPath("pictures"),
    ),
    properties: ["openFile"],
    title: `${i18next.t("Select an image")}`,
    filters: [
      {
        name: i18next.t("Image files"),
        extensions: [
          "avif",
          "bmp",
          "gif",
          "ico",
          "jpg",
          "jpeg",
          "png",
          "svg",
          "webp",
        ],
      },
    ],
  });

  if (result.canceled) return undefined;

  const filepath = result.filePaths[0];
  return isDotfile(filepath) ? undefined : filepath;
};
