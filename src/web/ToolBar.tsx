import i18next from "i18next";
import { memo } from "react";

import { ArrowLeft } from "./icons/ArrowLeft";
import { ArrowRight } from "./icons/ArrowRight";
import { FolderOpen } from "./icons/FolderOpen";
import { GridIcon } from "./icons/GridIcon";
import { Trash } from "./icons/Trash";

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
        <button
          type="button"
          className="icon"
          title={`${i18next.t("Open...")}`}
          onClick={props.onClickOpen}
        >
          <FolderOpen />
        </button>
      </div>
      <div className="toolbar">
        <div className="grid">
          <button
            type="button"
            className="icon"
            title={`${i18next.t("Toggle Grid View")}`}
            onClick={props.onToggleGrid}
          >
            <GridIcon />
          </button>
        </div>
        <div className="arrows">
          <button
            type="button"
            className="icon"
            title={`${i18next.t("Prev Image")}`}
            onClick={props.onPrev}
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            className="icon"
            title={`${i18next.t("Next Image")}`}
            onClick={props.onNext}
          >
            <ArrowRight />
          </button>
        </div>
        <div className="trash">
          <button
            type="button"
            className="icon"
            title={`${i18next.t("Move to Trash")}`}
            onClick={props.onRemove}
          >
            <Trash />
          </button>
        </div>
      </div>
    </div>
  );
});

ToolBar.displayName = "ToolBar";
