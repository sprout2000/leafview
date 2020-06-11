import React, { useRef, useCallback, useState, useEffect } from 'react';
import ResizeDetector from 'react-resize-detector';

import { Howl } from 'howler';
import Audio from './audio/trash.mp3';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Bottom, Container, GlobalStyle, View } from './styles';

import Float from './Float';
import empty from './empty.png';

const { myAPI } = window;

const App: React.FC = () => {
  const [url, setUrl] = useState(empty);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.MutableRefObject<L.Map | null> = useRef(null);

  const draw = useCallback((): void => {
    const macOS = window.navigator.userAgent.includes('Mac OS X');
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
      if (file.name.startsWith('._')) return;

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
      const sound = new Howl({
        src: [Audio],
      });
      sound.play();

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
    let title = 'LeafView';

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
          <Float
            onClickOpen={onClickOpen}
            prev={prev}
            next={next}
            remove={remove}
          />
        </Bottom>
        <View init={url === empty} ref={mapRef}>
          <ResizeDetector handleWidth handleHeight onResize={onResize} />
        </View>
      </Container>
    </React.Fragment>
  );
};

export default App;
