import React, { useState } from 'react';
import ReactDOM from 'react-dom';

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
        <button onClick={onClickToggle}>Toggle</button>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
