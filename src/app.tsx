import React, { useState, useRef } from 'react';
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

const App = (): JSX.Element => {
  const [sidebar, setSidebar] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const onClickToggle = (): void => {
    setSidebar((sidebar) => !sidebar);
  };

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
