import { UAParser } from 'ua-parser-js';
import React, { useRef, useCallback, useState, useEffect } from 'react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Float } from './Float';
import empty from './empty.png';
import './App.scss';

const { myAPI } = window;

const ua = new UAParser();
const isWin32 = ua.getOS().name === 'Windows';

export const App = (): JSX.Element => {
  const [url, setUrl] = useState<string>(empty);
  const [maximized, setMaximized] = useState(false);
  const [blur, setBlur] = useState(false);

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
            zoomDelta: 0.2,
            zoomSnap: 0.2,
            wheelPxPerZoomLevel: 360,
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
    if (!list || list.length === 0) {
      setUrl(empty);
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

  const prev = useCallback(async (): Promise<void> => {
    if (url === empty) return;

    const dir = await myAPI.dirname(url);
    if (!dir) {
      setUrl(empty);
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0) {
      setUrl(empty);
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

    await myAPI.moveToTrash(url);
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

    if (e.key === '0') {
      if (mapObj.current) mapObj.current.setZoom(0);
    }
  };

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isWin32) return;

    e.preventDefault();
    myAPI.contextMenu();
  };

  const onMinimize = async () => {
    if (!isWin32) return;

    await myAPI.minimizeWindow();
  };

  const onMaximize = async () => {
    if (!isWin32) return;

    setMaximized(!maximized);
    await myAPI.maximizeWindow();
  };

  const onRestore = async () => {
    if (!isWin32) return;

    setMaximized(!maximized);
    await myAPI.restoreWindow();
  };

  const onClose = async () => {
    if (!isWin32) return;
    await myAPI.closeWindow();
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
    myAPI.resized(async () => setMaximized(false));

    return () => {
      myAPI.removeResized();
    };
  }, []);

  useEffect(() => {
    myAPI.getFocus(async () => setBlur(false));

    return () => {
      myAPI.removeGetFocus();
    };
  }, [blur]);

  useEffect(() => {
    myAPI.getBlur(async () => setBlur(true));

    return () => {
      myAPI.removeGetBlur();
    };
  });

  useEffect(() => {
    myAPI.maximized(async () => setMaximized(true));

    return () => {
      myAPI.removeMaximized();
    };
  }, []);

  useEffect(() => {
    myAPI.unMaximized(async () => setMaximized(false));

    return () => {
      myAPI.removeUnMaximized();
    };
  }, []);

  useEffect(() => {
    const title = url !== empty ? url : 'LeafView';

    updateTitle(title);
  }, [url]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        const width = entries[0].contentRect.width;
        const height = entries[0].contentRect.height;

        draw(width, height);
      }
    );

    if (mapRef.current) resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [draw]);

  return (
    <div
      className="container"
      onContextMenu={onContextMenu}
      onDragEnter={preventDefault}
      onDragOver={preventDefault}
      onDragLeave={preventDefault}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
    >
      {isWin32 && (
        <div
          className={blur ? 'titlebar blur' : 'titlebar'}
          onDoubleClick={(e) => e.preventDefault()}
        >
          <div className="title-icon">
            <img src="title_icon.png" />
          </div>
          <div className={blur ? 'title-container blur' : 'title-container'}>
            <p>{url === empty ? 'LeafView' : url.match(/[ \w-]+\..*$/)}</p>
          </div>
          <div className="controls">
            <div
              className={blur ? 'button-container blur' : 'button-container'}
              onClick={onMinimize}
            >
              <svg
                width="10"
                height="1"
                viewBox="0 0 10 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="10" height="1" fill="black" />
              </svg>
            </div>
            {maximized ? (
              <div
                className={blur ? 'button-container blur' : 'button-container'}
                onClick={onRestore}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9 1H3V2H2V1V0H3H9H10V1V7V8H9H8V7H9V1Z"
                    fill="black"
                  />
                  <rect x="0.5" y="2.5" width="7" height="7" stroke="black" />
                </svg>
              </div>
            ) : (
              <div
                className={blur ? 'button-container blur' : 'button-container'}
                onClick={onMaximize}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="0.5" y="0.5" width="9" height="9" stroke="black" />
                </svg>
              </div>
            )}
            <div
              className={
                blur ? 'button-container close blur' : 'button-container close'
              }
              onClick={onClose}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 11L11 1" className="close" />
                <path d="M1 1L11 11" className="close" />
              </svg>
            </div>
          </div>
        </div>
      )}
      <div className="bottom">
        <Float
          onClickOpen={onClickOpen}
          prev={prev}
          next={next}
          remove={remove}
        />
      </div>
      <div className={isWin32 ? 'content-win32' : 'content'}>
        <div className={url === empty ? 'view init' : 'view'} ref={mapRef} />
      </div>
    </div>
  );
};
