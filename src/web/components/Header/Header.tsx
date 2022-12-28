import { memo, useContext } from 'react';
import { GalleryContextInterface } from '../../../@types/Context';
import { GalleryContext } from '../../providers/GalleryContext';
import { Card } from '../Card/Card';
import { FolderOpen } from '../Icons/FolderOpen';
import './Header.scss';

interface Props {
  folderPath?: string;
}

export const Header = memo((props: Props) => {
  const { folderPath } = props;
  const galleryContext = useContext<GalleryContextInterface>(GalleryContext);
  const { onClickOpen } = galleryContext;
  const title: string = !folderPath ? 'image-sorter' : `sorting`;

  return (
    <Card bodyClasses="header" classes="col-xs-12 h-10 flex" title={title}>
      <p>{folderPath}</p>
      {folderPath && (
        <div className="folder">
          <div className="icon" title="Open..." onClick={onClickOpen}>
            <FolderOpen />
          </div>
        </div>
      )}
    </Card>
  );
});

Header.displayName = 'Header';
