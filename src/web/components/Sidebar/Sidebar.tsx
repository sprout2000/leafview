import { memo } from 'react';
import { Card } from '../Card/Card';

interface Props {
  imagesSorted?: number | null;
  numOfImgs?: number | null;
}

export const Sidebar = memo((props: Props) => {
  const { imagesSorted, numOfImgs } = props;

  return (
    <div className="col-3 h-100">
      <div className="row h-10">
        <Card classes="col-10 h-100" title="Status">
          {imagesSorted ? (
            <p>
              Sorted {imagesSorted} / {numOfImgs}
            </p>
          ) : (
            <p>Nothing to sort</p>
          )}
        </Card>
      </div>
      <div className="row h-30">
        <Card classes="col-10 h-100" title="Mapping"></Card>
      </div>
      <div className="row h-60">
        <Card classes="col-10 h-100" title="Log"></Card>
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';
