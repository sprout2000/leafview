import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

import ResizeDetector from 'react-resize-detector';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faListAlt,
  faFolderOpen,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
  faTrashAlt,
} from '@fortawesome/free-regular-svg-icons';

import empty from './empty.png';
import './styles.scss';

const { ipcRenderer } = window;

const App = (): JSX.Element => {
  const [dir, setDir] = useState('');
  const [list, setList] = useState([empty]);
  const [index, setIndex] = useState(0);
  const [sidebar, setSidebar] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.MutableRefObject<L.Map | null> = useRef(null);

  const updateTitle = async (title: string): Promise<void> => {
    await ipcRenderer.invoke('update-title', title);
  };

  const isDarwin = async (): Promise<boolean> => {
    const darwin: boolean = await ipcRenderer.invoke('platform');
    return darwin;
  };

  const draw = useCallback(
    (url: string, width: number, height: number): void => {
      const macOS = isDarwin();
      const node = mapRef.current;

      const img = new Image();
      img.onload = (): void => {
        let zoom = 1;
        if (img.width > width || img.height > height) {
          const zoomX = width / img.width;
          const zoomY = height / img.height;
          zoomX >= zoomY ? (zoom = zoomY) : (zoom = zoomX);
        }
        const size = { width: img.width * zoom, height: img.height * zoom };
        const bounds = new L.LatLngBounds([
          [0, 0],
          [size.height, size.width],
        ]);

        if (mapObj.current) {
          mapObj.current.off();
          mapObj.current.remove();
        }

        if (node) {
          mapObj.current = L.map(node, {
            maxBounds: bounds,
            crs: L.CRS.Simple,
            preferCanvas: true,
            zoomDelta: 0.3,
            zoomSnap: macOS ? 0.3 : 0,
            doubleClickZoom: false,
            zoomControl: false,
            attributionControl: false,
          });
          mapObj.current.fitBounds(bounds);

          mapObj.current.on('dblclick', () => {
            if (mapObj.current) {
              if (img.width < width && img.height < height) {
                mapObj.current.setZoom(0);
              } else {
                mapObj.current.fitBounds(bounds);
              }
            }
          });

          if (img.width < width && img.height < height) {
            mapObj.current.setZoom(0, { animate: false });
          }

          L.imageOverlay(img.src, bounds).addTo(mapObj.current);
        }

        if (node) {
          node.blur();
          node.focus();
        }
      };

      img.src = url;
    },
    []
  );

  const readdir = async (filepath: string): Promise<void> => {
    const dirpath = await ipcRenderer.invoke('getdir', filepath);

    if (!dirpath) {
      setList([empty]);
      return;
    }

    const newList: string[] | void = await ipcRenderer.invoke(
      'readdir',
      dirpath
    );

    if (!newList || newList.length === 0) {
      setList([empty]);
      return;
    }

    const newIndex = newList.indexOf(filepath);

    setIndex(() => {
      const idx = newIndex;
      setDir(dirpath);
      setList(newList);

      return idx;
    });
  };

  const diff = (old: string[], next: string[]): string[] => {
    return [...new Set(old)].filter((item) => next.includes(item));
  };

  const next = useCallback(async (): Promise<void> => {
    if (list.length <= 1) return;

    const newList: string[] | void = await ipcRenderer.invoke('readdir', dir);

    if (!newList || newList.length === 0) {
      setIndex(() => {
        const idx = 0;
        setList([empty]);

        return idx;
      });

      return;
    }

    const copy = list.slice();
    const diffList = diff(copy, newList);

    setList(diffList);

    if (index >= diffList.length - 1) {
      setIndex(0);
    } else {
      setIndex((index) => index + 1);
    }
  }, [dir, index, list]);

  const prev = useCallback(async (): Promise<void> => {
    if (list.length <= 1) return;

    const newList: string[] | void = await ipcRenderer.invoke('readdir', dir);

    if (!newList || newList.length === 0) {
      setIndex(() => {
        const idx = 0;
        setList([empty]);

        return idx;
      });

      return;
    }

    const copy = list.slice();
    const diffList = diff(copy, newList);

    setList(diffList);

    if (index === 0) {
      setIndex(diffList.length - 1);
    } else {
      setIndex((index) => index - 1);
    }
  }, [dir, index, list]);

  const onClickRight = (): Promise<void> => next();
  const onClickLeft = (): Promise<void> => prev();

  const onToggleSidebar = (): void => {
    setSidebar((hide) => !hide);
  };

  const preventDefault = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = useCallback((e: DragEvent) => {
    preventDefault(e);

    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];
      readdir(file.path);
    }
  }, []);

  const onClickOpen = async (): Promise<void> => {
    const filepath: string | void | undefined = await ipcRenderer.invoke(
      'open-dialog'
    );

    if (!filepath) return;

    readdir(filepath);
  };

  const onSelected = useCallback((filepath: string): void => {
    if (!filepath) return;

    readdir(filepath);
  }, []);

  const onClickRemove = async (): Promise<void> => {
    const result: boolean = await ipcRenderer.invoke(
      'move-to-trash',
      list[index]
    );

    if (!result) {
      setList([empty]);
      return;
    }

    const copies = list.slice();
    const newList = copies.splice(index, 1);

    let newIndex = index;
    if (index >= newList.length - 1) {
      newIndex = newList.length - 1;
    }

    setIndex(() => {
      setList(newList);

      return newIndex;
    });
  };

  const onClickThumb = async (id: number): Promise<void> => {
    const newList: string[] | void = await ipcRenderer.invoke('readdir', dir);

    if (!newList || newList.length === 0) {
      setIndex(() => {
        const newIndex = 0;
        setList([empty]);

        return newIndex;
      });

      return;
    }

    if (id > newList.length - 1) {
      setIndex(() => {
        const newIndex = newList.length - 1;
        setList(newList);

        return newIndex;
      });
    } else {
      setIndex(id);
    }
  };

  const onResize = (): void => {
    const node = containerRef.current;
    if (node) draw(list[index], node.clientWidth, node.clientHeight);
  };

  useEffect(() => {
    const node = containerRef.current;
    if (node) {
      node.addEventListener('dragenter', preventDefault);
      node.addEventListener('dragover', preventDefault);
      node.addEventListener('dragleave', preventDefault);
    }

    return (): void => {
      if (node) {
        node.removeEventListener('dragenter', preventDefault);
        node.removeEventListener('dragover', preventDefault);
        node.removeEventListener('dragleave', preventDefault);
      }
    };
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (node) node.addEventListener('drop', onDrop);

    return (): void => {
      if (node) node.removeEventListener('drop', onDrop);
    };
  }, [onDrop]);

  useEffect(() => {
    ipcRenderer.on('selected-file', (_e, filepath) => onSelected(filepath));

    return (): void => ipcRenderer.removeAllListeners('selected-file');
  }, [onSelected]);

  useEffect(() => {
    ipcRenderer.on('menu-next', () => next());

    return (): void => ipcRenderer.removeAllListeners('menu-next');
  }, [next]);

  useEffect(() => {
    ipcRenderer.on('menu-prev', () => prev());

    return (): void => ipcRenderer.removeAllListeners('menu-prev');
  }, [prev]);

  useEffect(() => {
    ipcRenderer.on('toggle-sidebar', onToggleSidebar);

    return (): void => {
      ipcRenderer.removeAllListeners('toggle-sidebar');
    };
  }, []);

  useEffect(() => {
    let title = 'LessView';

    if (list[0] !== empty) {
      title = list[index];
    }

    updateTitle(title);
  }, [list, index]);

  useEffect(() => {
    const node = document.getElementById(`${index}`);
    if (node) node.scrollIntoView({ block: 'center' });
  }, [index]);

  useEffect(() => {
    const node = containerRef.current;
    if (node) draw(list[index], node.clientWidth, node.clientHeight);
  }, [draw, list, index]);

  const thumbnails = list.map((item, key) => {
    if (item === empty) {
      return;
    } else {
      return (
        <div
          key={key}
          id={`${key}`}
          onClick={(): Promise<void> => onClickThumb(key)}
          className={key === index ? 'thumb-focus' : 'thumb'}>
          <img className="thumb-item" src={item} alt="" />
        </div>
      );
    }
  });

  return (
    <div className="wrapper">
      <div className={sidebar ? 'sidebar' : 'sidebar-hide'}>{thumbnails}</div>
      <div ref={containerRef} className={sidebar ? 'content-side' : 'content'}>
        <ResizeDetector handleWidth handleHeight onResize={onResize} />
        <div className="bottom">
          <div className="toolbar">
            <div className="controls">
              <div onClick={onToggleSidebar} className="icon-container">
                <FontAwesomeIcon icon={faListAlt} size="2x" />
              </div>
              <div onClick={onClickOpen} className="icon-container">
                <FontAwesomeIcon icon={faFolderOpen} size="2x" />
              </div>
            </div>
            <div className="arrows">
              <div onClick={onClickLeft} className="icon-container">
                <FontAwesomeIcon icon={faArrowAltCircleLeft} size="2x" />
              </div>
              <div onClick={onClickRight} className="icon-container">
                <FontAwesomeIcon icon={faArrowAltCircleRight} size="2x" />
              </div>
            </div>
            <div className="trash">
              <div onClick={onClickRemove} className="icon-container">
                <FontAwesomeIcon icon={faTrashAlt} size="2x" />
              </div>
            </div>
          </div>
        </div>
        <div ref={mapRef} className="map"></div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
