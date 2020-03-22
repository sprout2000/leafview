import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListAlt } from '@fortawesome/free-regular-svg-icons';

import './styles.scss';

const App = (): JSX.Element => {
  const [sidebar, setSidebar] = useState(true);

  const onClickToggle = (): void => {
    setSidebar((sidebar) => !sidebar);
  };

  return (
    <div className="wrapper">
      <div className={sidebar ? 'sidebar' : 'sidebar collapsed'}></div>
      <div className="content">
        <div className="bottom">
          <div className="toolbar">
            <div onClick={onClickToggle} className="icon-container">
              <FontAwesomeIcon icon={faListAlt} size="2x" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
