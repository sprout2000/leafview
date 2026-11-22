import type { IpcRendererEvent } from "electron";
import { useCallback, useEffect, useState } from "react";

import { Grid } from "./Grid";
import { getImageAfterRemoval, getNextImage, getPrevImage } from "./imageUtils";
import { reload } from "./reload";
import { ToolBar } from "./ToolBar";
import { useIpcListener } from "./useIpcListener";
import { View } from "./View";

import "./App.scss";

/**
 * Reads the image files in the folder of `filepath`.
 *
 * Reloads the app and resolves with undefined when the folder is empty or
 * cannot be read, or, with `mustInclude`, when `filepath` is no longer in it.
 */
const readFolderOf = async (filepath: string, mustInclude = false) => {
  const dir = await window.myAPI.dirname(filepath);
  const list = await window.myAPI.readdir(dir);

  if (!list || list.length === 0 || (mustInclude && !list.includes(filepath))) {
    reload();
    return undefined;
  }

  return list;
};

export const App = () => {
  const [url, setUrl] = useState("");
  const [grid, setGrid] = useState(false);
  const [imgList, setImgList] = useState<string[]>([]);

  const handlePreventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    handlePreventDefault(e);

    if (grid || !e.dataTransfer) return;

    // Dotfiles are rejected by mimecheck() in the main process.
    const filepath = window.myAPI.showFilePath(e.dataTransfer.files[0]);
    const mime = await window.myAPI.mimecheck(filepath);
    if (mime) setUrl(filepath);
  };

  const handleNext = useCallback(async () => {
    if (!url) return;
    if (grid) setGrid(false);

    const list = await readFolderOf(url);
    if (!list || list.length === 1) return;

    setUrl(getNextImage(list, url));
  }, [url, grid]);

  const handlePrev = useCallback(async () => {
    if (!url) return;
    if (grid) setGrid(false);

    const list = await readFolderOf(url);
    if (!list || list.length === 1) return;

    setUrl(getPrevImage(list, url));
  }, [url, grid]);

  const handleRemove = useCallback(async () => {
    if (!url) return;

    const list = await readFolderOf(url, true);
    if (!list) return;

    await window.myAPI.moveToTrash(url);

    const newList = await readFolderOf(url);
    if (!newList) return;

    setImgList(newList);
    setUrl(getImageAfterRemoval(newList, url));
  }, [url]);

  const handleClickOpen = useCallback(async () => {
    const filepath = await window.myAPI.openDialog();
    if (!filepath) return;

    const mime = await window.myAPI.mimecheck(filepath);
    if (mime) setUrl(filepath);
  }, []);

  const handleMenuOpen = useCallback(
    async (_e: IpcRendererEvent, filepath: string) => {
      if (!filepath) return;
      if (grid) setGrid(false);

      const mime = await window.myAPI.mimecheck(filepath);
      if (mime) setUrl(filepath);
    },
    [grid],
  );

  const handleToggleGrid = useCallback(async () => {
    if (!url) return;

    const list = await readFolderOf(url, true);
    if (!list) return;

    if (!grid) {
      setImgList(list);
      setGrid(true);
    } else {
      setGrid(false);
    }
  }, [grid, url]);

  const handleClickThumb = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    item: string,
  ) => {
    // not to emit onClickBlank()
    e.stopPropagation();

    const list = await readFolderOf(item, true);
    if (!list) return;

    setUrl(item);
    setGrid(false);
  };

  const handleClickBlank = async () => {
    const list = await readFolderOf(url, true);
    if (!list) return;

    setGrid(false);
  };

  // Files in the folder were added, removed or renamed outside the app.
  const handleDirChanged = useCallback(
    async (_e: IpcRendererEvent, changedDir: string) => {
      if (!url) return;

      // Ignore events from the folder watched before moving to another one.
      const dir = await window.myAPI.dirname(url);
      if (dir !== changedDir) return;

      const list = await readFolderOf(url);
      if (!list) return;

      // Keep the thumbnails in sync with the folder.
      setImgList(list);

      // The current image was removed: show the next one.
      if (!list.includes(url)) {
        setUrl(getImageAfterRemoval(list, url));
      }
    },
    [url],
  );

  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.preventDefault();
    if (!grid) window.myAPI.contextMenu();
  };

  useEffect(() => {
    if (url) window.myAPI.history(url);
  }, [url]);

  useEffect(() => {
    window.myAPI.updateTitle(url || "LeafView");
  }, [url]);

  useIpcListener(window.myAPI.menuNext, handleNext);
  useIpcListener(window.myAPI.menuPrev, handlePrev);
  useIpcListener(window.myAPI.menuRemove, handleRemove);
  useIpcListener(window.myAPI.menuOpen, handleMenuOpen);
  useIpcListener(window.myAPI.toggleGrid, handleToggleGrid);
  useIpcListener(window.myAPI.dirChanged, handleDirChanged);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the whole window is a drop target for image files and opens the native context menu; it is not a control.
    <div
      className={grid ? "container grid" : "container"}
      onDrop={handleDrop}
      onDragOver={handlePreventDefault}
      onDragEnter={handlePreventDefault}
      onDragLeave={handlePreventDefault}
      onContextMenu={handleContextMenu}
    >
      {grid ? (
        <Grid
          url={url}
          imgList={imgList}
          onClickBlank={handleClickBlank}
          onClickThumb={handleClickThumb}
        />
      ) : (
        <>
          <ToolBar
            onPrev={handlePrev}
            onNext={handleNext}
            onRemove={handleRemove}
            onClickOpen={handleClickOpen}
            onToggleGrid={handleToggleGrid}
          />
          <View url={url} />
        </>
      )}
    </div>
  );
};
