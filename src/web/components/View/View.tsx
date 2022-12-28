import { memo, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';

import L, { Map as LeafletMap, MapOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.smoothwheelzoom';
import './View.scss';

const { myAPI } = window;

type Props = {
  url: string;
};

export interface MapContainerProps extends MapOptions {
  smoothWheelZoom?: boolean;
  smoothSensitivity?: number;
}

export const View = memo((props: Props) => {
  const { url } = props;
  const [isURLVideo, setIsURLVideo] = useState<boolean>(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: MutableRefObject<L.Map | null> = useRef(null);

  const getZoom = useCallback((iw: number, w: number, ih: number, h: number) => {
    if (iw > w || ih > h) {
      const zoomX = w / iw;
      const zoomY = h / ih;
      return zoomX >= zoomY ? zoomY : zoomX;
    } else {
      return 1;
    }
  }, []);

  const draw = useCallback(
    async (width: number, height: number) => {
      if (await myAPI.isVideo(url)) {
        return;
      }

      const node = mapRef.current;

      if (node) {
        const img = new Image();

        img.onerror = (err) => {
          console.error(err);
        };

        img.onload = () => {
          const zoom = getZoom(img.width, width, img.height, height);

          const bounds = new L.LatLngBounds([
            [img.height * zoom, 0],
            [0, img.width * zoom],
          ]);

          const options: MapContainerProps = {
            scrollWheelZoom: false, // disable original zoom function
            smoothWheelZoom: true, // enable smooth zoom
            smoothSensitivity: 1,
            maxBounds: bounds,
            crs: L.CRS.Simple,
            preferCanvas: true,
            zoomSnap: 0.1,
            wheelPxPerZoomLevel: 400,
            doubleClickZoom: false,
            zoomControl: false,
            attributionControl: false,
          };

          mapObj.current?.off();
          mapObj.current?.remove();

          mapObj.current = new LeafletMap(node, options).fitBounds(bounds);

          mapObj.current.on('dblclick', () => {
            mapObj.current?.setView(bounds.getCenter(), 0);
          });

          mapObj.current.on('keydown', (e) => {
            if (e.originalEvent.key === '0') {
              mapObj.current?.setZoom(0);
            }
          });

          if (img.width < width && img.height < height) {
            mapObj.current.setView(bounds.getCenter(), 0, { animate: false });
          }

          img instanceof HTMLImageElement
            ? L.imageOverlay(img.src, bounds).addTo(mapObj.current)
            : L.videoOverlay(url, bounds).addTo(mapObj.current);

          node.blur();
          node.focus();
        };

        img.src = url;
      }
    },
    [url, getZoom],
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const height = entries[0].contentRect.height;
      draw(width, height);
    });

    mapRef.current && resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [draw, isURLVideo, url]);

  useEffect(() => {
    myAPI.isVideo(url).then((result: boolean) => {
      setIsURLVideo(result);
    });
  }, [url]);

  return (
    <>
      {isURLVideo ? (
        <video autoPlay={true} controls={true} className="view" src={url} />
      ) : (
        <div className={!url ? 'view init' : 'view-leaf'} ref={mapRef} />
      )}
    </>
  );
});

View.displayName = 'View';
