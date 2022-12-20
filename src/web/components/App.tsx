import { useCallback, useEffect, useState } from 'react';

import { View } from './View';
import { Grid } from './Grid';
import { ToolBar } from './ToolBar';

import './App.scss';

const { myAPI } = window;

export const App = () => {
  const [url, setUrl] = useState('');
  const [grid, setGrid] = useState(false);
  const [imgList, setImgList] = useState<string[]>([]);

  const isDarwin = navigator.userAgentData.platform === 'macOS';

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (grid) {
      return false;
    }

    preventDefault(e);

    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];

      if (file.name.startsWith('.')) return;

      const mime = await myAPI.mimecheck(file.path);
      if (mime) setUrl(file.path);
    }
  };

  const onNext = useCallback(async () => {
    if (!url) return;
    if (grid) setGrid(false);

    const dir = await myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await myAPI.readdir(dir);
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

  const onPrev = useCallback(async () => {
    if (!url) return;
    if (grid) setGrid(false);

    const dir = await myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await myAPI.readdir(dir);
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

  const onRemove = useCallback(async () => {
    if (!url) return;

    const dir = await myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(url)) {
      window.location.reload();
      return;
    }

    const index = list.indexOf(url);

    await myAPI.moveToTrash(url);
    const newList = await myAPI.readdir(dir);

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

  const onClickOpen = useCallback(async () => {
    const filepath = await myAPI.openDialog();
    if (!filepath) return;

    const mime = await myAPI.mimecheck(filepath);
    if (mime) setUrl(filepath);
  }, []);

  const onMenuOpen = useCallback(
    async (_e: Event, filepath: string) => {
      if (!filepath) return;
      if (grid) setGrid(false);

      const mime = await myAPI.mimecheck(filepath);
      if (mime) setUrl(filepath);
    },
    [grid]
  );

  const onToggleGrid = useCallback(async () => {
    if (!url) return;

    const dir = await myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await myAPI.readdir(dir);
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

  const onClickThumb = async (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    item: string
  ) => {
    e.stopPropagation();

    const dir = await myAPI.dirname(item);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(item)) {
      window.location.reload();
      return;
    }

    setUrl(item);
    setGrid(false);
  };

  const onClickBlank = async () => {
    const dir = await myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(url)) {
      window.location.reload();
      return;
    }

    setGrid(false);
  };

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (grid || isDarwin) {
      e.preventDefault();
      return false;
    }

    e.preventDefault();
    myAPI.contextMenu();
  };

  const updateTitle = async (filepath: string) => {
    await myAPI.updateTitle(filepath);
  };

  useEffect(() => {
    if (url) myAPI.history(url);
  }, [url]);

  useEffect(() => {
    const unlistenFn = myAPI.menuNext(onNext);
    return () => {
      unlistenFn();
    };
  }, [onNext]);

  useEffect(() => {
    const unlistenFn = myAPI.menuPrev(onPrev);
    return () => {
      unlistenFn();
    };
  }, [onPrev]);

  useEffect(() => {
    const unlistenFn = myAPI.menuRemove(onRemove);
    return () => {
      unlistenFn();
    };
  }, [onRemove]);

  useEffect(() => {
    const unlistenFn = myAPI.menuOpen(onMenuOpen);
    return () => {
      unlistenFn();
    };
  }, [onMenuOpen]);

  useEffect(() => {
    const unlistenFn = myAPI.toggleGrid(onToggleGrid);
    return () => {
      unlistenFn();
    };
  }, [onToggleGrid]);

  useEffect(() => {
    const title = !url ? 'Leafview' : url;
    updateTitle(title);
  }, [url]);

  return (
    <div
      className={grid ? 'container grid' : 'container'}
      onDrop={onDrop}
      onDragOver={preventDefault}
      onDragEnter={preventDefault}
      onDragLeave={preventDefault}
      onContextMenu={onContextMenu}
    >
      {grid ? (
        <Grid
          url={url}
          imgList={imgList}
          onClickBlank={onClickBlank}
          onClickThumb={onClickThumb}
        />
      ) : (
        <>
          <ToolBar
            onPrev={onPrev}
            onNext={onNext}
            onRemove={onRemove}
            onClickOpen={onClickOpen}
            onToggleGrid={onToggleGrid}
          />
          <View url={url} />
        </>
      )}
    </div>
  );
};
