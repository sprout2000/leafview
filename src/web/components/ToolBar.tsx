import i18next from 'i18next';
import { FaFolderOpen, FaPlay, FaTrash } from 'react-icons/fa';

interface Props {
  onClickOpen: () => Promise<void>;
  prev: () => Promise<void>;
  next: () => Promise<void>;
  remove: () => Promise<void>;
}

export const ToolBar = (props: Props): JSX.Element => {
  return (
    <div className="toolbar">
      <div className="controls">
        <div
          className="icon"
          title={i18next.t('Open...')}
          onClick={props.onClickOpen}
        >
          <FaFolderOpen size="1.5rem" />
        </div>
      </div>
      <div className="arrows">
        <div
          className="icon"
          title={i18next.t('Prev Image')}
          onClick={props.prev}
        >
          <FaPlay size="1.5rem" className="reverse" />
        </div>
        <div
          className="icon"
          title={i18next.t('Next Image')}
          onClick={props.next}
        >
          <FaPlay size="1.5rem" />
        </div>
      </div>
      <div className="trash">
        <div
          className="icon"
          title={i18next.t('Move to Trash')}
          onClick={props.remove}
        >
          <FaTrash size="1.5rem" />
        </div>
      </div>
    </div>
  );
};
