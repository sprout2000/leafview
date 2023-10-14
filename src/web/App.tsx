import { IpcRendererEvent } from "electron";
import { useCallback, useEffect, useState } from "react";

import { View } from "./View";
import { Grid } from "./Grid";
import { ToolBar } from "./ToolBar";

import "./App.scss";

export const App = () => {
  const [url, setUrl] = useState("");
  const [grid, setGrid] = useState(false);
  const [imgList, setImgList] = useState<string[]>([]);

  const handlePreventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (grid) {
      return false;
    }

    handlePreventDefault(e);

    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];

      if (file.name.startsWith(".")) return;

      const mime = await window.myAPI.mimecheck(file.path);
      if (mime) setUrl(file.path);
    }
  };

  const handleNext = useCallback(async () => {
    if (!url) return;
    if (grid) setGrid(false);

    const dir = await window.myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await window.myAPI.readdir(dir);
    if (!list || list.length === 0) {
      window.location.reload();
      return;
    }

    if (list.length === 1) return;

    const index = list.indexOf(url);
    if (index === list.length - 1 || index === -1) {
      setUrl(list[0]);
    } else {
      setUrl(list[index + 1]);
    }
  }, [url, grid]);

  const handlePrev = useCallback(async () => {
    if (!url) return;
    if (grid) setGrid(false);

    const dir = await window.myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await window.myAPI.readdir(dir);
    if (!list || list.length === 0) {
      window.location.reload();
      return;
    }

    if (list.length === 1) return;

    const index = list.indexOf(url);
    if (index === 0) {
      setUrl(list[list.length - 1]);
    } else if (index === -1) {
      setUrl(list[0]);
    } else {
      setUrl(list[index - 1]);
    }
  }, [url, grid]);

  const handleRemove = useCallback(async () => {
    if (!url) return;

    const dir = await window.myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await window.myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(url)) {
      window.location.reload();
      return;
    }

    const index = list.indexOf(url);

    await window.myAPI.moveToTrash(url);
    const newList = await window.myAPI.readdir(dir);

    if (!newList || newList.length === 0) {
      window.location.reload();
      return;
    }

    setImgList(newList);

    if (index > newList.length - 1) {
      setUrl(newList[0]);
    } else {
      setUrl(newList[index]);
    }
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

    const dir = await window.myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await window.myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(url)) {
      window.location.reload();
      return;
    }

    if (!grid) {
      setImgList(list);
      setGrid(true);
    } else {
      setGrid(false);
    }
  }, [grid, url]);

  const handleClickThumb = async (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    item: string,
  ) => {
    // Prevent onClickBlank() from firing
    e.stopPropagation();

    const dir = await window.myAPI.dirname(item);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await window.myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(item)) {
      window.location.reload();
      return;
    }

    setUrl(item);
    setGrid(false);
  };

  const handleClickBlank = async () => {
    const dir = await window.myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await window.myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(url)) {
      window.location.reload();
      return;
    }

    setGrid(false);
  };

  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (grid) {
      e.preventDefault();
      return false;
    }

    e.preventDefault();
    window.myAPI.contextMenu();
  };

  const updateTitle = async (filepath: string) => {
    await window.myAPI.updateTitle(filepath);
  };

  useEffect(() => {
    if (url) window.myAPI.history(url);
  }, [url]);

  useEffect(() => {
    const unlistenFn = window.myAPI.menuNext(handleNext);
    return () => {
      unlistenFn();
    };
  }, [handleNext]);

  useEffect(() => {
    const unlistenFn = window.myAPI.menuPrev(handlePrev);
    return () => {
      unlistenFn();
    };
  }, [handlePrev]);

  useEffect(() => {
    const unlistenFn = window.myAPI.menuRemove(handleRemove);
    return () => {
      unlistenFn();
    };
  }, [handleRemove]);

  useEffect(() => {
    const unlistenFn = window.myAPI.menuOpen(handleMenuOpen);
    return () => {
      unlistenFn();
    };
  }, [handleMenuOpen]);

  useEffect(() => {
    const unlistenFn = window.myAPI.toggleGrid(handleToggleGrid);
    return () => {
      unlistenFn();
    };
  }, [handleToggleGrid]);

  useEffect(() => {
    const title = !url ? "LeafView" : url;
    updateTitle(title);
  }, [url]);

  return (
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
