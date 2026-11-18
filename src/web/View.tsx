import L from "leaflet";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { getScalePercent, getZoom, toFileUrl } from "./imageUtils";

import "leaflet/dist/leaflet.css";
import "./View.scss";

type Props = {
  url: string;
};

/** How long the scale popup stays visible after zooming (ms). */
export const SCALE_POPUP_DURATION = 1000;

export const View = memo(({ url = "" }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.RefObject<L.Map | null> = useRef(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** The url of the image currently drawn, to detect image changes. */
  const drawnUrlRef = useRef("");

  const [scale, setScale] = useState<number | null>(null);
  const [showScale, setShowScale] = useState(false);

  const popupScale = useCallback((percent: number) => {
    setScale(percent);
    setShowScale(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowScale(false);
    }, SCALE_POPUP_DURATION);
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

  return (
    <>
      <div className={!url ? "view init" : "view"} ref={mapRef} />
      {scale !== null && (
        <output className={showScale ? "scale-popup show" : "scale-popup"}>
          {scale}%
        </output>
      )}
    </>
  );
});

View.displayName = "View";
