import React, { useRef, useCallback, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ResizeDetector from 'react-resize-detector';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImages,
  faFolderOpen,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
  faTrashAlt,
} from '@fortawesome/free-regular-svg-icons';

import {
  Arrows,
  Bottom,
  Container,
  Controls,
  GlobalStyle,
  Icon,
  Initial,
  Toolbar,
  Trash,
  View,
} from './styles';
import empty from './empty.png';

const { ipcRenderer } = window;

const App = (): JSX.Element => {
  const [url, setUrl] = useState(empty);
  const [onDrag, setOnDrag] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.MutableRefObject<L.Map | null> = useRef(null);

  const isDarwin = async (): Promise<boolean> => {
    const result: boolean = await ipcRenderer.invoke('platform');
    return result;
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

  const onResize = (): void => {
    const node = containerRef.current;
    if (node) draw(url, node.clientWidth, node.clientHeight);
  };

  const preventDefault = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    preventDefault(e);
    setOnDrag(true);
  }, []);

  const onDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      preventDefault(e);
      setOnDrag(false);
    },
    []
  );

  const onDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    preventDefault(e);

    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];

      const mime: boolean = await ipcRenderer.invoke('mime-check', file.path);
      if (mime) {
        setUrl(file.path);
        setOnDrag(false);
        ipcRenderer.send('file-histoy', file.path);
      }
    }
  };

  const next = useCallback(async (): Promise<void> => {
    if (url === empty) return;

    const dir = await ipcRenderer.invoke('dirname', url);
    if (!dir) {
      setUrl(empty);
      return;
    }

    const list: void | string[] = await ipcRenderer.invoke('readdir', dir);
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

    const dir = await ipcRenderer.invoke('dirname', url);
    if (!dir) {
      setUrl(empty);
      return;
    }

    const list: void | string[] = await ipcRenderer.invoke('readdir', dir);
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

    const dir = await ipcRenderer.invoke('dirname', url);
    if (!dir) {
      setUrl(empty);
      return;
    }

    const list: string[] | void = await ipcRenderer.invoke('readdir', dir);
    if (!list || list.length === 0 || !list.includes(url)) {
      setUrl(empty);
      return;
    }

    const index = list.indexOf(url);

    const result: boolean = await ipcRenderer.invoke('move-to-trash', url);

    if (!result) {
      setUrl(empty);
      return;
    } else {
      const newList: string[] | void = await ipcRenderer.invoke('readdir', dir);
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
    const filepath = await ipcRenderer.invoke('open-dialog');
    if (!filepath) return;

    const mime = await ipcRenderer.invoke('mime-check', filepath);
    if (mime) {
      setUrl(filepath);
      ipcRenderer.send('file-history', filepath);
    }
  };

  const onMenuOpen = useCallback(async (_e: Event, filepath: string) => {
    if (!filepath) return;

    const mime = await ipcRenderer.invoke('mime-check', filepath);
    if (mime) {
      setUrl(filepath);
      ipcRenderer.send('file-history', filepath);
    }
  }, []);

  const updateTitle = async (filepath: string): Promise<void> => {
    await ipcRenderer.invoke('update-title', filepath);
  };

  useEffect(() => {
    ipcRenderer.on('menu-next', next);

    return (): void => {
      ipcRenderer.removeAllListeners('menu-next');
    };
  }, [next]);

  useEffect(() => {
    ipcRenderer.on('menu-prev', prev);

    return (): void => {
      ipcRenderer.removeAllListeners('menu-prev');
    };
  }, [prev]);

  useEffect(() => {
    ipcRenderer.on('menu-remove', remove);

    return (): void => {
      ipcRenderer.removeAllListeners('menu-remove');
    };
  }, [remove]);

  useEffect(() => {
    ipcRenderer.on('menu-open', onMenuOpen);

    return (): void => {
      ipcRenderer.removeAllListeners('menu-open');
    };
  }, [onMenuOpen]);

  useEffect(() => {
    let title = 'LessView';

    if (url !== empty) {
      title = url;
    }

    updateTitle(title);
  }, [url]);

  useEffect(() => {
    const node = containerRef.current;
    if (node) draw(url, node.clientWidth, node.clientHeight);
  }, [draw, url]);

  return (
    <React.Fragment>
      <GlobalStyle />
      <Container
        ref={containerRef}
        onDragEnter={(e): void => onDragOver(e)}
        onDragOver={(e): void => onDragOver(e)}
        onDragLeave={(e): void => onDragLeave(e)}
        onDrop={(e): Promise<void> => onDrop(e)}>
        <ResizeDetector handleWidth handleHeight onResize={onResize} />
        {url === empty && (
          <Initial onClick={onClickOpen} drag={onDrag}>
            <FontAwesomeIcon icon={faImages} size="3x" />
          </Initial>
        )}
        <Bottom>
          <Toolbar>
            <Controls>
              <Icon onClick={onClickOpen}>
                <FontAwesomeIcon icon={faFolderOpen} size="2x" />
              </Icon>
            </Controls>
            <Arrows>
              <Icon onClick={prev}>
                <FontAwesomeIcon icon={faArrowAltCircleLeft} size="2x" />
              </Icon>
              <Icon onClick={next}>
                <FontAwesomeIcon icon={faArrowAltCircleRight} size="2x" />
              </Icon>
            </Arrows>
            <Trash>
              <Icon onClick={remove}>
                <FontAwesomeIcon icon={faTrashAlt} size="2x" />
              </Icon>
            </Trash>
          </Toolbar>
        </Bottom>
        <View init={url === empty} ref={mapRef}></View>
      </Container>
    </React.Fragment>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
