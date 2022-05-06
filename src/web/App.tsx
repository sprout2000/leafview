import { useRef, useCallback, useState, useEffect } from 'react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { ToolBar } from './ToolBar';
import './App.scss';

const { myAPI } = window;

export const App = () => {
  const [url, setUrl] = useState('');

  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.MutableRefObject<L.Map | null> = useRef(null);

  const getZoom = useCallback(
    (iw: number, w: number, ih: number, h: number) => {
      if (iw > w || ih > h) {
        const zoomX = w / iw;
        const zoomY = h / ih;

        return zoomX >= zoomY ? zoomY : zoomX;
      } else {
        return 1;
      }
    },
    []
  );

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
    [url, getZoom]
  );

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    preventDefault(e);

    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];

      if (file.name.startsWith('.')) return;

      const mime = await myAPI.mimecheck(file.path);
      if (mime) {
        setUrl(file.path);
        myAPI.history(file.path);
      }
    }
  };

  const onNext = useCallback(async () => {
    if (!url) return;

    const dir = await myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0) {
      window.location.reload();
      return;
    }

    if (list.length === 1) return;

    const index = list.indexOf(url);
    if (index === list.length - 1 || index === -1) {
      setUrl(list[0]);
    } else {
      setUrl(list[index + 1]);
    }
  }, [url]);

  const onPrev = useCallback(async () => {
    if (!url) return;

    const dir = await myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0) {
      window.location.reload();
      return;
    }

    if (list.length === 1) return;

    const index = list.indexOf(url);
    if (index === 0) {
      setUrl(list[list.length - 1]);
    } else if (index === -1) {
      setUrl(list[0]);
    } else {
      setUrl(list[index - 1]);
    }
  }, [url]);

  const onRemove = useCallback(async () => {
    if (!url) return;

    const dir = await myAPI.dirname(url);
    if (!dir) {
      window.location.reload();
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(url)) {
      window.location.reload();
      return;
    }

    const index = list.indexOf(url);

    await myAPI.moveToTrash(url);
    const newList = await myAPI.readdir(dir);

    if (!newList || newList.length === 0) {
      window.location.reload();
      return;
    }

    if (index > newList.length - 1) {
      setUrl(newList[0]);
    } else {
      setUrl(newList[index]);
    }
  }, [url]);

  const onClickOpen = useCallback(async () => {
    const filepath = await myAPI.openDialog();
    if (!filepath) return;

    const mime = await myAPI.mimecheck(filepath);
    if (mime) {
      setUrl(filepath);
      myAPI.history(filepath);
    }
  }, []);

  const onMenuOpen = useCallback(async (_e: Event, filepath: string) => {
    if (!filepath) return;

    const mime = await myAPI.mimecheck(filepath);
    if (mime) {
      setUrl(filepath);
      myAPI.history(filepath);
    }
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!url) return;

    if (e.key === '0') {
      mapObj.current && mapObj.current.setZoom(0);
    }
  };

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    myAPI.contextMenu();
  };

  const updateTitle = async (filepath: string) => {
    await myAPI.updateTitle(filepath);
  };

  useEffect(() => {
    myAPI.menuNext(onNext);

    return () => {
      myAPI.removeMenuNext();
    };
  }, [onNext]);

  useEffect(() => {
    myAPI.menuPrev(onPrev);

    return () => {
      myAPI.removeMenuPrev();
    };
  }, [onPrev]);

  useEffect(() => {
    myAPI.menuRemove(onRemove);

    return () => {
      myAPI.removeMenuRemove();
    };
  }, [onRemove]);

  useEffect(() => {
    myAPI.menuOpen(onMenuOpen);

    return () => {
      myAPI.removeMenuOpen();
    };
  }, [onMenuOpen]);

  useEffect(() => {
    const title = !url ? 'Leafview' : url;

    updateTitle(title);
  }, [url]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const height = entries[0].contentRect.height;

      draw(width, height);
    });
    mapRef.current && resizeObserver.observe(mapRef.current);

    return () => resizeObserver.disconnect();
  }, [draw]);

  return (
    <div
      className="container"
      onDrop={onDrop}
      onKeyDown={onKeyDown}
      onDragOver={preventDefault}
      onDragEnter={preventDefault}
      onDragLeave={preventDefault}
      onContextMenu={onContextMenu}
    >
      <div className="bottom">
        <ToolBar
          onPrev={onPrev}
          onNext={onNext}
          onRemove={onRemove}
          onClickOpen={onClickOpen}
        />
      </div>
      <div className={!url ? 'view init' : 'view'} ref={mapRef} />
    </div>
  );
};
