/* eslint-disable complexity */
import { useContext, useEffect, useState } from 'react';
import { GalleryContextInterface } from '../../@types/Context';
import { GalleryContext } from '../providers/GalleryContext';

import './App.scss';
import { Gallery } from './Gallery/Gallery';
import { Header } from './Header/Header';
import { Sidebar } from './Sidebar/Sidebar';

const { myAPI } = window;

export const App = () => {
  const isDarwin = navigator.userAgentData.platform === 'macOS';
  const galleryContext = useContext<GalleryContextInterface>(GalleryContext);
  const { onNext, onPrevious, folderPath, setFolderPath, onMenuOpen, onRemove, imgURL, imgList } =
    galleryContext;

  const [currentImage, setCurrentImage] = useState<number | null>(null);

  useEffect(() => {
    if (imgList.length) {
      setCurrentImage(imgList.indexOf(imgURL) + 1);
    }
  }, [currentImage, imgList, imgURL]);

  const updateTitle = async (filefolderPath: string) => {
    await myAPI.updateTitle(filefolderPath);
  };

  useEffect(() => {
    if (imgURL) myAPI.history(imgURL);
  }, [imgURL]);

  useEffect(() => {
    const unlistenFn = myAPI.menuNext(onNext);
    return () => {
      unlistenFn();
    };
  }, [onNext]);

  useEffect(() => {
    const unlistenFn = myAPI.menuPrev(onPrevious);
    return () => {
      unlistenFn();
    };
  }, [onPrevious]);

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
    const title = !folderPath ? 'image-sorter' : `Sorting - ${folderPath}`;
    updateTitle(title);
  }, [folderPath]);

  return (
    <div className="row gx-3 h-100 justify-content-center">
      <div className="col-9 h-100">
        <div className="row gy-0 h-100">
          <Header folderPath={folderPath} />
          <Gallery
            isDarwin={isDarwin}
            myAPI={myAPI}
            setFolderPath={setFolderPath}
            imgURL={imgURL}
          />
        </div>
      </div>

      <Sidebar numOfImgs={imgList.length} imagesSorted={currentImage} />
    </div>
  );
};
