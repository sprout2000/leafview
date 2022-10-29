import {
  Fragment,
  useCallback,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { ToolBar } from './ToolBar';
import './App.scss';

const { myAPI } = window;

export const App = () => {
  const [url, setUrl] = useState('');
  const [grid, setGrid] = useState(false);
  const [list, setList] = useState<string[]>([]);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.MutableRefObject<L.Map | null> = useRef(null);

  const currentRef = useRef<HTMLImageElement>(null);

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
    if (grid) {
      return false;
    }

    preventDefault(e);

    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];

      if (file.name.startsWith('.')) return;

      const mime = await myAPI.mimecheck(file.path);
      if (mime) setUrl(file.path);
    }
  };

  const onNext = useCallback(async () => {
    if (!url) return;
    if (grid) setGrid(false);

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
  }, [url, grid]);

  const onPrev = useCallback(async () => {
    if (!url) return;
    if (grid) setGrid(false);

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
  }, [url, grid]);

  const onRemove = useCallback(async () => {
    if (!url || grid) return;

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
  }, [url, grid]);

  const onClickOpen = useCallback(async () => {
    const filepath = await myAPI.openDialog();
    if (!filepath) return;

    const mime = await myAPI.mimecheck(filepath);
    if (mime) setUrl(filepath);
  }, []);

  const onMenuOpen = useCallback(
    async (_e: Event, filepath: string) => {
      if (!filepath) return;
      if (grid) setGrid(false);

      const mime = await myAPI.mimecheck(filepath);
      if (mime) setUrl(filepath);
    },
    [grid]
  );

  const onToggleGrid = useCallback(async () => {
    if (!url) return;

    const dir = await myAPI.dirname(url);
    myAPI.readdir(dir).then((files) => files && setList(files));

    setGrid(!grid);
  }, [grid, url]);

  const onClickThumb = async (item: string) => {
    setGrid(false);

    const dir = await myAPI.dirname(item);
    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(item)) {
      window.location.reload();
      return;
    }

    setUrl(item);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!url || e.key !== '0' || grid) return;
    mapObj.current?.setZoom(0);
  };

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (grid) {
      e.preventDefault();
      return false;
    }

    e.preventDefault();
    myAPI.contextMenu();
  };

  const updateTitle = async (filepath: string) => {
    await myAPI.updateTitle(filepath);
  };

  useEffect(() => {
    if (url) myAPI.history(url);
  }, [url]);

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
    myAPI.toggleGrid(onToggleGrid);

    return () => {
      myAPI.removeToggleGrid();
    };
  }, [onToggleGrid]);

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

    return () => {
      resizeObserver.disconnect();
    };
  }, [draw, grid]);

  useLayoutEffect(() => {
    if (grid)
      currentRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
  }, [grid]);

  return (
    <div
      className={grid ? 'container grid' : 'container'}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
      onDragOver={preventDefault}
      onDragEnter={preventDefault}
      onDragLeave={preventDefault}
      onContextMenu={onContextMenu}
    >
      {grid ? (
        <div className="thumb-container">
          {list.map((item) => (
            <img
              key={item}
              src={item}
              ref={item === url ? currentRef : null}
              className={item === url ? 'thumb current' : 'thumb'}
              onClick={() => onClickThumb(item)}
              onDragStart={() => {
                return false;
              }}
            />
          ))}
        </div>
      ) : (
        <Fragment>
          <div className="bottom">
            <ToolBar
              onPrev={onPrev}
              onNext={onNext}
              onRemove={onRemove}
              onClickOpen={onClickOpen}
              onToggleGrid={onToggleGrid}
            />
          </div>
          <div className={!url ? 'view init' : 'view'} ref={mapRef} />
        </Fragment>
      )}
    </div>
  );
};
