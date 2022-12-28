import React, { memo } from 'react';
import i18next from 'i18next';

import './ToolBar.scss';
import { FolderOpen } from '../Icons/FolderOpen';
import { Trash } from '../Icons/Trash';

type Props = {
  onClickOpen: () => void;
  onPrevious: () => Promise<void>;
  onNext: () => Promise<void>;
  onRemove: () => Promise<void>;
};

export const ToolBar = memo((props: Props) => {
  return (
    <div className="bottom">
      <div className="folder">
        <div className="icon" title={`${i18next.t('Open...')}`} onClick={props.onClickOpen}>
          <FolderOpen />
        </div>
      </div>
      <div className="trash">
        <div className="icon" title={`${i18next.t('Move to Trash')}`} onClick={props.onRemove}>
          <Trash />
        </div>
      </div>
    </div>
  );
});

ToolBar.displayName = 'ToolBar';
