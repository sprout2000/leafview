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
  const currentRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, []);

  return (
    <div className="thumb-container" onClick={props.onClickBlank}>
      {props.imgList.map((item) => (
        <img
          key={item}
          src={item}
          ref={item === props.url ? currentRef : null}
          className={item === props.url ? 'thumb current' : 'thumb'}
          onClick={(e) => props.onClickThumb(e, item)}
          onDragStart={() => {
            return false;
          }}
        />
      ))}
    </div>
  );
});
Grid.displayName = 'Grid';
