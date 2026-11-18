import { memo, useLayoutEffect, useRef } from "react";

import { toFileUrl } from "./imageUtils";

import "./Grid.scss";

const getFileName = (filepath: string) => filepath.split(/[\\/]/).pop();

type Props = {
  url: string;
  imgList: string[];
  onClickBlank: () => Promise<void>;
  onClickThumb: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    item: string,
  ) => Promise<void>;
};

export const Grid = memo((props: Props) => {
  const currentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: clicking the background is only a mouse shortcut for closing the grid; keyboard users can use the menu (H / Ctrl+G).
    <div
      className="grid-content"
      role="presentation"
      onClick={props.onClickBlank}
    >
      <div className="thumb-container">
        {props.imgList.map((item) => (
          <div
            className="wrapper"
            key={item}
            ref={item === props.url ? currentRef : null}
          >
            <button
              type="button"
              className="thumb-button"
              onClick={(e) => props.onClickThumb(e, item)}
            >
              <img
                src={toFileUrl(item)}
                alt={getFileName(item)}
                className={item === props.url ? "thumb current" : "thumb"}
                onDragStart={(e) => e.preventDefault()}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

Grid.displayName = "Grid";
