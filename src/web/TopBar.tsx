import { memo } from 'react';
import i18next from 'i18next';

import { Grid } from './icons/Grid';
import './TopBar.scss';

type Props = {
  onClickGrid: () => Promise<void>;
};

export const TopBar = memo((props: Props) => {
  return (
    <div className="topbar">
      <div className="grid">
        <div
          className="icon"
          title={i18next.t('Open...')}
          onClick={props.onClickGrid}
        >
          <Grid />
        </div>
      </div>
    </div>
  );
});
TopBar.displayName = 'ToolBar';
