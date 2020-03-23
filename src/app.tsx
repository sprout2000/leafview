import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faListAlt,
  faFolderOpen,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
  faTrashAlt,
} from '@fortawesome/free-regular-svg-icons';

import './styles.scss';

const { ipcRenderer } = window;

const App = (): JSX.Element => {
  const [sidebar, setSidebar] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const onClickToggle = (): void => {
    setSidebar((sidebar) => !sidebar);
  };

  const preventDefault = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = useCallback(async (e: DragEvent) => {
    preventDefault(e);

    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];
      const list: string[] = await ipcRenderer.invoke(
        'selected-file',
        file.path
      );

      if (list.length === 0) return;

      for (const item of list) console.log(item);
    }
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (node) {
      node.addEventListener('dragenter', preventDefault);
      node.addEventListener('dragover', preventDefault);
      node.addEventListener('dragleave', preventDefault);
    }

    return (): void => {
      if (node) {
        node.removeEventListener('dragenter', preventDefault);
        node.removeEventListener('dragover', preventDefault);
        node.removeEventListener('dragleave', preventDefault);
      }
    };
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (node) node.addEventListener('drop', onDrop);

    return (): void => {
      if (node) node.removeEventListener('drop', onDrop);
    };
  }, [onDrop]);

  return (
    <div className="wrapper">
      <div className={sidebar ? 'sidebar' : 'sidebar collapsed'}></div>
      <div ref={containerRef} className="content">
        <div className="bottom">
          <div className="toolbar">
            <div className="controls">
              <div onClick={onClickToggle} className="icon-container">
                <FontAwesomeIcon icon={faListAlt} size="2x" />
              </div>
              <div className="icon-container">
                <FontAwesomeIcon icon={faFolderOpen} size="2x" />
              </div>
            </div>
            <div className="arrows">
              <div className="icon-container">
                <FontAwesomeIcon icon={faArrowAltCircleLeft} size="2x" />
              </div>
              <div className="icon-container">
                <FontAwesomeIcon icon={faArrowAltCircleRight} size="2x" />
              </div>
            </div>
            <div className="trash">
              <div className="icon-container">
                <FontAwesomeIcon icon={faTrashAlt} size="2x" />
              </div>
            </div>
          </div>
        </div>
        <div ref={mapRef} className="map"></div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
