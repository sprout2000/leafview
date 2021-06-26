import React from 'react';

import {
  AiOutlineFolderOpen,
  AiOutlineLeftCircle,
  AiOutlineRightCircle,
  AiOutlineDelete,
} from 'react-icons/ai';

import i18next from 'i18next';

interface Props {
  onClickOpen: () => Promise<void>;
  prev: () => Promise<void>;
  next: () => Promise<void>;
  remove: () => Promise<void>;
}

export const Float = (props: Props): JSX.Element => {
  return (
    <div className="toolbar">
      <div className="controls">
        <div
          className="icon"
          title={i18next.t('Open...')}
          onClick={props.onClickOpen}>
          <AiOutlineFolderOpen size="2rem" />
        </div>
      </div>
      <div className="arrows">
        <div
          className="icon"
          title={i18next.t('Prev Image')}
          onClick={props.prev}>
          <AiOutlineLeftCircle size="2rem" />
        </div>
        <div
          className="icon"
          title={i18next.t('Next Image')}
          onClick={props.next}>
          <AiOutlineRightCircle size="2rem" />
        </div>
      </div>
      <div className="trash">
        <div
          className="icon"
          title={i18next.t('Move to Trash')}
          onClick={props.remove}>
          <AiOutlineDelete size="2rem" />
        </div>
      </div>
    </div>
  );
};
