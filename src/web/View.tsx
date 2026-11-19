import i18next from "i18next";
import L from "leaflet";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { ActualSize } from "./icons/ActualSize";
import { FitWindow } from "./icons/FitWindow";
import { getScalePercent, getZoom, toFileUrl } from "./imageUtils";

import "leaflet/dist/leaflet.css";
import "./View.scss";

type Props = {
  url: string;
};

/** How long the scale popup stays visible after zooming (ms). */
export const SCALE_POPUP_DURATION = 1000;

/** Moving the pointer within this distance from the top shows the popup (px). */
export const SCALE_POPUP_HOVER_AREA = 80;

export const View = memo(({ url = "" }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.RefObject<L.Map | null> = useRef(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** The url of the image currently drawn, to detect image changes. */
  const drawnUrlRef = useRef("");
  /** The ratio used to fit the current image into the window. */
  const fitZoomRef = useRef(1);
  const boundsRef = useRef<L.LatLngBounds | null>(null);
  /** The popup stays visible while the pointer or focus is on it. */
  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);

  const [scale, setScale] = useState<number | null>(null);
  const [showScale, setShowScale] = useState(false);

  const hideScaleLater = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hoveredRef.current || focusedRef.current) return;

    timerRef.current = setTimeout(() => {
      setShowScale(false);
    }, SCALE_POPUP_DURATION);
  }, []);

  const popupScale = useCallback(
    (percent: number) => {
      setScale(percent);
      setShowScale(true);
      hideScaleLater();
    },
    [hideScaleLater],
  );

  const handlePopupEnter = useCallback(() => {
    hoveredRef.current = true;
    hideScaleLater();
  }, [hideScaleLater]);

  const handlePopupLeave = useCallback(() => {
    hoveredRef.current = false;
    hideScaleLater();
  }, [hideScaleLater]);

  const handlePopupFocus = useCallback(() => {
    focusedRef.current = true;
    hideScaleLater();
  }, [hideScaleLater]);

  const handlePopupBlur = useCallback(() => {
    focusedRef.current = false;
    hideScaleLater();
  }, [hideScaleLater]);

  // The popup (and its buttons) is only rendered after an image is drawn,
  // so the map and the bounds always exist when these are called.
  const handleActualSize = useCallback(() => {
    const map = mapObj.current as L.Map;
    // Zoom to exactly 100% instead of the nearest step of zoomSnap.
    const { zoomSnap } = map.options;
    map.options.zoomSnap = 0;
    map.setZoom(-Math.log2(fitZoomRef.current));
    map.options.zoomSnap = zoomSnap;
  }, []);

  const handleFitWindow = useCallback(() => {
    const map = mapObj.current as L.Map;
    const bounds = boundsRef.current as L.LatLngBounds;
    map.setView(bounds.getCenter(), 0);
  }, []);

  const draw = useCallback(
    (width: number, height: number) => {
      const node = mapRef.current;

      // Nothing to draw before an image is opened. Without this check,
      // toFileUrl("") would request "file:///" and log ERR_FILE_NOT_FOUND.
      if (node && url) {
        const img = new Image();

        img.onload = () => {
          const zoom = getZoom(img.width, width, img.height, height);

          const bounds = new L.LatLngBounds([
            [img.height * zoom, 0],
            [0, img.width * zoom],
          ]);
          fitZoomRef.current = zoom;
          boundsRef.current = bounds;

          mapObj.current?.off();
          mapObj.current?.remove();

          mapObj.current = L.map(node, {
            maxBounds: bounds,
            crs: L.CRS.Simple,
            preferCanvas: true,
            zoomDelta: 0.3,
            zoomSnap: 0.3,
            wheelPxPerZoomLevel: 360,
            doubleClickZoom: false,
            zoomControl: false,
            attributionControl: false,
          }).fitBounds(bounds);

          mapObj.current.on("dblclick", () => {
            mapObj.current?.setView(bounds.getCenter(), 0);
          });

          mapObj.current.on("keydown", (e) => {
            if (e.originalEvent.key === "0") {
              mapObj.current?.setZoom(0);
            }
          });

          if (img.width < width && img.height < height) {
            mapObj.current.setView(bounds.getCenter(), 0, { animate: false });
          }

          // Registered after the initial view is set, so that resizing the
          // window does not show the popup.
          const map = mapObj.current;
          map.on("zoomend", () => {
            popupScale(getScalePercent(zoom, map.getZoom()));
          });

          // Show the scale when another image is opened.
          if (drawnUrlRef.current !== url) {
            drawnUrlRef.current = url;
            popupScale(getScalePercent(zoom, map.getZoom()));
          }

          L.imageOverlay(img.src, bounds).addTo(mapObj.current);

          node.blur();
          node.focus();
        };

        img.src = toFileUrl(url);
      }
    },
    [url, popupScale],
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const height = entries[0].contentRect.height;
      draw(width, height);
    });

    // The div is always rendered before this effect runs, so mapRef.current
    // is never null here; the guard only satisfies the type checker.
    /* v8 ignore else */
    if (mapRef.current) resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [draw]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Show the popup for a while when the pointer moves near the top of the
  // window, once an image has been drawn.
  const hasScale = scale !== null;

  useEffect(() => {
    if (!hasScale) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY > SCALE_POPUP_HOVER_AREA) return;

      setShowScale(true);
      hideScaleLater();
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hasScale, hideScaleLater]);

  // The button toggles between the actual size and fitting to the window.
  const isActualSize = scale === 100;

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isActualSize) {
      handleFitWindow();
    } else {
      handleActualSize();
    }

    // A mouse click leaves the focus on the button, which would keep the
    // popup open. Give the focus back to the image instead. Keyboard users
    // (e.detail === 0) keep the focus on the button.
    if (e.detail > 0) {
      e.currentTarget.blur();
      mapRef.current?.focus();
    }
  };

  return (
    <>
      <div className={!url ? "view init" : "view"} ref={mapRef} />
      {hasScale && (
        <div
          className={showScale ? "scale-popup show" : "scale-popup"}
          role="toolbar"
          aria-label={i18next.t("Zoom")}
          onMouseEnter={handlePopupEnter}
          onMouseLeave={handlePopupLeave}
          onFocus={handlePopupFocus}
          onBlur={handlePopupBlur}
        >
          <button
            type="button"
            className="scale-button"
            title={i18next.t(isActualSize ? "Fit to Window" : "Actual Size")}
            onClick={handleToggle}
          >
            {isActualSize ? <FitWindow /> : <ActualSize />}
          </button>
          <output className="scale-value">{scale}%</output>
        </div>
      )}
    </>
  );
});

View.displayName = "View";
