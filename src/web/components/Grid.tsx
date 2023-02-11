import { memo, useLayoutEffect, useRef } from 'react';

import './Grid.scss';

type Props = {
  url: string;
  imgList: string[];
  onClickBlank: () => Promise<void>;
  onClickThumb: (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    item: string
  ) => Promise<void>;
};

export const Grid = memo((props: Props) => {
  const currentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, []);

  return (
    <div className="grid-content" onClick={props.onClickBlank}>
      <div className="thumb-container">
        {props.imgList.map((item) => (
          <div
            className="wrapper"
            key={item}
            ref={item === props.url ? currentRef : null}
          >
            <img
              src={item}
              className={item === props.url ? 'thumb current' : 'thumb'}
              onClick={(e) => props.onClickThumb(e, item)}
              onDragStart={() => {
                return false;
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

Grid.displayName = 'Grid';
