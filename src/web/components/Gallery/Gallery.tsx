import { memo, useContext } from 'react';
import { GalleryContextInterface, IElectronAPI } from '../../../@types/Context';
import { GalleryContext } from '../../providers/GalleryContext';
import { Card } from '../Card/Card';
import { FolderOpen } from '../Icons/FolderOpen';
import { View } from '../View/View';
import './Gallery.scss';

// Need to change imgList prop to imgUrl of the image to be displayed in gallery
interface Props {
  isDarwin: boolean;
  myAPI: IElectronAPI;
  imgURL?: string;
  setFolderPath: (path: string) => void;
}

export const Gallery = memo((props: Props) => {
  const { isDarwin, myAPI, setFolderPath, imgURL } = props;
  const galleryContext = useContext<GalleryContextInterface>(GalleryContext);
  const { onClickOpen } = galleryContext;

  // eslint-disable-next-line no-undef
  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // eslint-disable-next-line no-undef
  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    preventDefault(e);

    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];

      if (file.name.startsWith('.')) return;

      setFolderPath(file.path);
    }
  };

  // eslint-disable-next-line no-undef
  const onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isDarwin) {
      e.preventDefault();
      return false;
    }

    e.preventDefault();
    myAPI.contextMenu();
  };

  return (
    <div
      className="image-container h-90"
      onDrop={onDrop}
      onDragOver={preventDefault}
      onDragEnter={preventDefault}
      onDragLeave={preventDefault}
      onContextMenu={onContextMenu}>
      {imgURL ? (
        <Card classes="h-100" title={imgURL}>
          <View url={imgURL} />
        </Card>
      ) : (
        <Card bodyClasses="gallery" classes="h-100" title="Select a folder to begin">
          <div className="folder">
            <div className="icon" title="Open..." onClick={onClickOpen}>
              <FolderOpen size="large" />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
});

Gallery.displayName = 'Gallery';
