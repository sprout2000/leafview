import React, { useRef, useCallback, useState, useEffect } from 'react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Float } from './Float';
import empty from './empty.png';

const { myAPI } = window;

const App: React.FC = () => {
  const [url, setUrl] = useState(empty);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.MutableRefObject<L.Map | null> = useRef(null);

  const getZoom = (
    imgWidth: number,
    width: number,
    imgHeight: number,
    height: number
  ) => {
    if (imgWidth > width || imgHeight > height) {
      const zoomX = width / imgWidth;
      const zoomY = height / imgHeight;

      return zoomX >= zoomY ? zoomY : zoomX;
    } else {
      return 1;
    }
  };

  const draw = useCallback(
    (width: number, height: number): void => {
      const node = mapRef.current;

      if (node) {
        const img = new Image();
        img.onload = (): void => {
          const zoom = getZoom(img.width, width, img.height, height);

          const bounds = new L.LatLngBounds([
            [img.height * zoom, 0],
            [0, img.width * zoom],
          ]);

          if (mapObj.current) {
            mapObj.current.off();
            mapObj.current.remove();
          }

          mapObj.current = L.map(node, {
            maxBounds: bounds,
            crs: L.CRS.Simple,
            preferCanvas: true,
            zoomDelta: 0.3,
            zoomSnap: 0.3,
            doubleClickZoom: false,
            zoomControl: false,
            attributionControl: false,
          }).fitBounds(bounds);

          mapObj.current.on('dblclick', () => {
            const center = bounds.getCenter();
            if (mapObj.current) mapObj.current.setView(center, 0);
          });

          if (img.width < width && img.height < height) {
            const center = bounds.getCenter();
            mapObj.current.setView(center, 0, { animate: false });
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

  const preventDefault = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    preventDefault(e);

    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];
      const isDarwin = window.navigator.userAgent.includes('Mac OS');

      if (file.name.startsWith(isDarwin ? '.' : '._')) return;

      const mime = await myAPI.mimecheck(file.path);
      if (mime) {
        setUrl(file.path);
        myAPI.history(file.path);
      }
    }
  };

  const next = useCallback(async (): Promise<void> => {
    if (url === empty) return;

    const dir = await myAPI.dirname(url);
    if (!dir) {
      setUrl(empty);
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(url)) {
      setUrl(empty);
      return;
    }

    if (list.length === 1) return;

    const index = list.indexOf(url);
    if (index === list.length - 1) {
      setUrl(list[0]);
    } else {
      setUrl(list[index + 1]);
    }
  }, [url]);

  const prev = useCallback(async (): Promise<void> => {
    if (url === empty) return;

    const dir = await myAPI.dirname(url);
    if (!dir) {
      setUrl(empty);
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(url)) {
      setUrl(empty);
      return;
    }

    if (list.length === 1) return;

    const index = list.indexOf(url);
    if (index === 0) {
      setUrl(list[list.length - 1]);
    } else {
      setUrl(list[index - 1]);
    }
  }, [url]);

  const remove = useCallback(async (): Promise<void> => {
    if (url === empty) return;

    const dir = await myAPI.dirname(url);
    if (!dir) {
      setUrl(empty);
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(url)) {
      setUrl(empty);
      return;
    }

    const index = list.indexOf(url);

    const result = await myAPI.moveToTrash(url);

    if (!result) {
      setUrl(empty);
      return;
    } else {
      const newList = await myAPI.readdir(dir);
      if (!newList || newList.length === 0) {
        setUrl(empty);
        return;
      }

      if (index > newList.length - 1) {
        setUrl(newList[0]);
      } else {
        setUrl(newList[index]);
      }
    }
  }, [url]);

  const onClickOpen = async (): Promise<void> => {
    const filepath = await myAPI.openDialog();
    if (!filepath) return;

    const mime = await myAPI.mimecheck(filepath);
    if (mime) {
      setUrl(filepath);
      myAPI.history(filepath);
    }
  };

  const onMenuOpen = useCallback(async (_e: Event, filepath: string) => {
    if (!filepath) return;

    const mime = await myAPI.mimecheck(filepath);
    if (mime) {
      setUrl(filepath);
      myAPI.history(filepath);
    }
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (url === empty) return;

    if (e.keyCode === 48) {
      if (mapObj.current) mapObj.current.setZoom(0);
    }
  };

  const updateTitle = async (filepath: string): Promise<void> => {
    await myAPI.updateTitle(filepath);
  };

  useEffect(() => {
    myAPI.menuNext(next);

    return (): void => {
      myAPI.removeMenuNext();
    };
  }, [next]);

  useEffect(() => {
    myAPI.menuPrev(prev);

    return (): void => {
      myAPI.removeMenuPrev();
    };
  }, [prev]);

  useEffect(() => {
    myAPI.menuRemove(remove);

    return (): void => {
      myAPI.removeMenuRemove();
    };
  }, [remove]);

  useEffect(() => {
    myAPI.menuOpen(onMenuOpen);

    return (): void => {
      myAPI.removeMenuOpen();
    };
  }, [onMenuOpen]);

  useEffect(() => {
    const title = url !== empty ? url : 'LeafView';

    updateTitle(title);
  }, [url]);

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

  return (
    <div
      className="container"
      onDragEnter={preventDefault}
      onDragOver={preventDefault}
      onDragLeave={preventDefault}
      onDrop={onDrop}
      onKeyDown={onKeyDown}>
      <div className="bottom">
        <Float
          onClickOpen={onClickOpen}
          prev={prev}
          next={next}
          remove={remove}
        />
      </div>
      <div className={url === empty ? 'view init' : 'view'} ref={mapRef} />
    </div>
  );
};

export default App;
