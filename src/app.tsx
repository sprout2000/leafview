import React, { useRef, useCallback, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ResizeDetector from 'react-resize-detector';

import { Howl } from 'howler';
import Audio from './audio/trash.mp3';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  AiOutlineFolderOpen,
  AiOutlineLeftCircle,
  AiOutlineRightCircle,
  AiOutlineDelete,
} from 'react-icons/ai';

import {
  Arrows,
  Bottom,
  Container,
  Controls,
  GlobalStyle,
  Icon,
  Toolbar,
  Trash,
  View,
} from './styles';
import empty from './empty.png';

const { ipcRenderer } = window;

const App = (): JSX.Element => {
  const [url, setUrl] = useState(empty);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.MutableRefObject<L.Map | null> = useRef(null);

  const isDarwin = async (): Promise<boolean> => {
    const result: boolean = await ipcRenderer.invoke('platform');
    return result;
  };

  const draw = useCallback((): void => {
    const macOS = isDarwin();
    const node = mapRef.current;

    if (node) {
      const img = new Image();
      img.onload = (): void => {
        let zoom = 1;
        if (img.width > node.clientWidth || img.height > node.clientHeight) {
          const zoomX = node.clientWidth / img.width;
          const zoomY = node.clientHeight / img.height;
          zoomX >= zoomY ? (zoom = zoomY) : (zoom = zoomX);
        }

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
          zoomSnap: macOS ? 0.3 : 0,
          doubleClickZoom: false,
          zoomControl: false,
          attributionControl: false,
        }).fitBounds(bounds);

        mapObj.current.on('dblclick', () => {
          const center = bounds.getCenter();
          if (mapObj.current) mapObj.current.setView(center, 0);
        });

        if (img.width < node.clientWidth && img.height < node.clientHeight) {
          const center = bounds.getCenter();
          mapObj.current.setView(center, 0, { animate: false });
        }

        L.imageOverlay(img.src, bounds).addTo(mapObj.current);

        node.blur();
        node.focus();
      };

      img.src = url;
    }
  }, [url]);

  const onResize = (): void => draw();

  const preventDefault = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    preventDefault(e);

    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];

      const mime: boolean = await ipcRenderer.invoke('mime-check', file.path);
      if (mime) {
        setUrl(file.path);
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
      const sound = new Howl({
        src: [Audio],
      });
      sound.play();

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

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (url === empty) return;

    if (e.keyCode === 48) {
      if (mapObj.current) mapObj.current.setZoom(0);
    }
  };

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

  useEffect(() => draw(), [draw]);

  return (
    <React.Fragment>
      <GlobalStyle />
      <Container
        onDragEnter={preventDefault}
        onDragOver={preventDefault}
        onDragLeave={preventDefault}
        onDrop={onDrop}
        onKeyDown={onKeyDown}>
        <Bottom>
          <Toolbar>
            <Controls>
              <Icon onClick={onClickOpen}>
                <AiOutlineFolderOpen size="2rem" />
              </Icon>
            </Controls>
            <Arrows>
              <Icon onClick={prev}>
                <AiOutlineLeftCircle size="2rem" />
              </Icon>
              <Icon onClick={next}>
                <AiOutlineRightCircle size="2rem" />
              </Icon>
            </Arrows>
            <Trash>
              <Icon onClick={remove}>
                <AiOutlineDelete size="2rem" />
              </Icon>
            </Trash>
          </Toolbar>
        </Bottom>
        <View init={url === empty} ref={mapRef}>
          <ResizeDetector handleWidth handleHeight onResize={onResize} />
        </View>
      </Container>
    </React.Fragment>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
