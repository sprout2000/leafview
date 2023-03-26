import { memo } from "react";
import i18next from "i18next";

import { Trash } from "./icons/Trash";
import { GridIcon } from "./icons/GridIcon";
import { ArrowLeft } from "./icons/ArrowLeft";
import { ArrowRight } from "./icons/ArrowRight";
import { FolderOpen } from "./icons/FolderOpen";

import "./ToolBar.scss";

type Props = {
  onClickOpen: () => void;
  onPrev: () => Promise<void>;
  onNext: () => Promise<void>;
  onRemove: () => Promise<void>;
  onToggleGrid: () => Promise<void>;
};

export const ToolBar = memo((props: Props) => {
  return (
    <div className="bottom">
      <div className="folder">
        <div
          className="icon"
          aria-label="open-button"
          title={`${i18next.t("Open...")}`}
          onClick={props.onClickOpen}
        >
          <FolderOpen />
        </div>
      </div>
      <div className="toolbar">
        <div className="grid">
          <div
            className="icon"
            aria-label="grid-button"
            title={`${i18next.t("Toggle Grid View")}`}
            onClick={props.onToggleGrid}
          >
            <GridIcon />
          </div>
        </div>
        <div className="arrows">
          <div
            className="icon"
            aria-label="prev-button"
            title={`${i18next.t("Prev Image")}`}
            onClick={props.onPrev}
          >
            <ArrowLeft />
          </div>
          <div
            className="icon"
            aria-label="next-button"
            title={`${i18next.t("Next Image")}`}
            onClick={props.onNext}
          >
            <ArrowRight />
          </div>
        </div>
        <div className="trash">
          <div
            className="icon"
            aria-label="trash-button"
            title={`${i18next.t("Move to Trash")}`}
            onClick={props.onRemove}
          >
            <Trash />
          </div>
        </div>
      </div>
    </div>
  );
});

ToolBar.displayName = "ToolBar";
