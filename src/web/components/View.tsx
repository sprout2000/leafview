import { memo, useCallback, useEffect, useRef } from 'react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import './View.scss';

type Props = {
  url: string;
};

const getZoom = (iw: number, w: number, ih: number, h: number) => {
  if (iw > w || ih > h) {
    const zoomX = w / iw;
    const zoomY = h / ih;
    return zoomX >= zoomY ? zoomY : zoomX;
  } else {
    return 1;
  }
};

export const View = memo(({ url = '' }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.MutableRefObject<L.Map | null> = useRef(null);

  const draw = useCallback(
    (width: number, height: number) => {
      const node = mapRef.current;

      if (node) {
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

          L.imageOverlay(img.src, bounds).addTo(mapObj.current);

          node.blur();
          node.focus();
        };

        img.src = url;
      }
    },
    [url]
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
  }, [draw]);

  return <div className={!url ? 'view init' : 'view'} ref={mapRef} />;
});

View.displayName = 'View';
