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

export const Float: React.FC<Props> = (props) => {
  return (
    <div className="toolbar">
      <div className="controls">
        <div
          className="icon"
          data-testid="open"
          title={i18next.t('open')}
          onClick={props.onClickOpen}>
          <AiOutlineFolderOpen size="2rem" />
        </div>
      </div>
      <div className="arrows">
        <div
          className="icon"
          data-testid="prev"
          title={i18next.t('prev')}
          onClick={props.prev}>
          <AiOutlineLeftCircle size="2rem" />
        </div>
        <div
          className="icon"
          data-testid="next"
          title={i18next.t('next')}
          onClick={props.next}>
          <AiOutlineRightCircle size="2rem" />
        </div>
      </div>
      <div className="trash">
        <div
          className="icon"
          data-testid="trash"
          title={i18next.t('trash')}
          onClick={props.remove}>
          <AiOutlineDelete size="2rem" />
        </div>
      </div>
    </div>
  );
};
