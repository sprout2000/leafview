/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useCallback, useState } from 'react';
import { GalleryContextInterface } from '../../@types/Context';

const { myAPI } = window;

export const GalleryContext = createContext<GalleryContextInterface>({
  folderPath: '',
  setFolderPath: (folderPath: string) => '',
  imgList: [],
  setImgList: (imgList: string[]) => [],
  imgURL: '',
  setImgURL: (imgURL: string) => '',
  onNext: () => Promise.resolve(),
  onPrevious: () => Promise.resolve(),
  onRemove: () => Promise.resolve(),
  onClickOpen: () => Promise.resolve(),
  onMenuOpen: (_e: Event, filefolderPath: string) => Promise.resolve(),
});

export const GalleryContextProvider = (props: {
  children: React.ReactNode;
}): React.ReactElement => {
  const [folderPath, setFolderPath] = useState('');
  const [imgURL, setImgURL] = useState<string>('');
  const [imgList, setImgList] = useState<string[]>([]);

  const onNext = useCallback(async () => {
    if (!imgURL) return;

    const index = imgList.indexOf(imgURL);
    if (index === imgList.length - 1 || index === -1) {
      setImgURL(imgList[0]);
    } else {
      setImgURL(imgList[index + 1]);
    }
  }, [imgList, imgURL]);

  const onPrevious = useCallback(async () => {
    if (!imgURL) return;

    const index = imgList.indexOf(imgURL);
    if (index === 0) {
      setImgURL(imgList[imgList.length - 1]);
    } else if (index === -1) {
      setImgURL(imgList[0]);
    } else {
      setImgURL(imgList[index - 1]);
    }
  }, [imgList, imgURL]);

  // eslint-disable-next-line complexity
  const onRemove = useCallback(async () => {
    if (!folderPath) return;

    const dir = await myAPI.dirname(folderPath);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(folderPath)) {
      window.location.reload();
      return;
    }

    const index = list.indexOf(folderPath);

    await myAPI.moveToTrash(folderPath);
    const newList = await myAPI.readdir(dir);

    if (!newList || newList.length === 0) {
      window.location.reload();
      return;
    }

    setImgList(newList);

    if (index > newList.length - 1) {
      setFolderPath(newList[0]);
    } else {
      setFolderPath(newList[index]);
    }
  }, [folderPath]);

  const onClickOpen = useCallback(async () => {
    const filefolderPath = await myAPI.openDialog();
    if (!filefolderPath) return;

    onMenuOpen(null, filefolderPath);

    setFolderPath(filefolderPath);
  }, []);

  const onMenuOpen = useCallback(async (_e: Event | null, filefolderPath: string) => {
    if (!filefolderPath) return;

    setFolderPath(filefolderPath);

    const imgs = await myAPI.readdir(filefolderPath);

    if (!imgs || imgs.length === 0) {
      window.location.reload();
      return;
    }

    setImgList(imgs);
    setImgURL(imgs[0]);
  }, []);

  return (
    <GalleryContext.Provider
      value={{
        imgURL,
        setImgURL,
        imgList,
        setImgList,
        folderPath,
        setFolderPath,
        onNext,
        onPrevious,
        onClickOpen,
        onMenuOpen,
        onRemove,
      }}>
      {props.children}
    </GalleryContext.Provider>
  );
};
