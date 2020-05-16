import React from 'react';

import {
  AiOutlineFolderOpen,
  AiOutlineLeftCircle,
  AiOutlineRightCircle,
  AiOutlineDelete,
} from 'react-icons/ai';

import i18next from 'i18next';

import { Arrows, Controls, Icon, Toolbar, Trash } from './styles';

interface Props {
  onClickOpen: () => Promise<void>;
  prev: () => Promise<void>;
  next: () => Promise<void>;
  remove: () => Promise<void>;
}

const Float: React.FC<Props> = (props) => {
  return (
    <Toolbar>
      <Controls>
        <Icon title={i18next.t('open')} onClick={props.onClickOpen}>
          <AiOutlineFolderOpen size="2rem" />
        </Icon>
      </Controls>
      <Arrows>
        <Icon title={i18next.t('prev')} onClick={props.prev}>
          <AiOutlineLeftCircle size="2rem" />
        </Icon>
        <Icon title={i18next.t('next')} onClick={props.next}>
          <AiOutlineRightCircle size="2rem" />
        </Icon>
      </Arrows>
      <Trash>
        <Icon title={i18next.t('trash')} onClick={props.remove}>
          <AiOutlineDelete size="2rem" />
        </Icon>
      </Trash>
    </Toolbar>
  );
};

export default Float;
