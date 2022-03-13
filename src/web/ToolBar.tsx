import i18next from 'i18next';

import { FolderOpen } from './FolderOpen';
import { ArrowLeft } from './ArrowLeft';
import { ArrowRight } from './ArrowRight';
import { Trash } from './Trash';

import './ToolBar.scss';

interface Props {
  onClickOpen: () => void;
  onPrev: () => Promise<void>;
  onNext: () => Promise<void>;
  onRemove: () => Promise<void>;
}

export const ToolBar = (props: Props): JSX.Element => {
  return (
    <div className="toolbar">
      <div className="folder">
        <div
          className="icon"
          title={i18next.t('Open...')}
          onClick={props.onClickOpen}
        >
          <FolderOpen />
        </div>
      </div>
      <div className="arrows">
        <div
          className="icon"
          title={i18next.t('Prev Image')}
          onClick={props.onPrev}
        >
          <ArrowLeft />
        </div>
        <div
          className="icon"
          title={i18next.t('Next Image')}
          onClick={props.onNext}
        >
          <ArrowRight />
        </div>
      </div>
      <div className="trash">
        <div
          className="icon"
          title={i18next.t('Move to Trash')}
          onClick={props.onRemove}
        >
          <Trash />
        </div>
      </div>
    </div>
  );
};
