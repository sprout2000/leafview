import React, {
  useRef,
  useCallback,
  useState,
  useEffect,
  createElement,
} from 'react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Float } from './Float';
import empty from './empty.png';

const { myAPI } = window;

export const App: React.FC = () => {
  const [url, setUrl] = useState<string>(empty);
  const [motionUrl, setMotionUrl] = useState<string | null>(null);
  const [playVideo, setPlayVideo] = useState<boolean>(false);

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
        let media: HTMLImageElement | HTMLVideoElement;
        if (motionUrl && playVideo) {
          media = document.createElement('video');
        } else {
          media = new Image();
        }

        const onLoaded = (): void => {
          const mediaHeight =
            media instanceof HTMLVideoElement
              ? media.videoHeight
              : media.height;
          const mediaWidth =
            media instanceof HTMLVideoElement ? media.videoWidth : media.width;
          const zoom = getZoom(mediaWidth, width, mediaHeight, height);

          const bounds = new L.LatLngBounds([
            [mediaHeight * zoom, 0],
            [0, mediaWidth * zoom],
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

          if (media.width < width && media.height < height) {
            const center = bounds.getCenter();
            mapObj.current.setView(center, 0, { animate: false });
          }

          if (motionUrl && playVideo) {
            L.videoOverlay(media.src, bounds, {
              autoplay: true,
              loop: true,
            }).addTo(mapObj.current);
          } else {
            L.imageOverlay(media.src, bounds).addTo(mapObj.current);
          }

          node.blur();
          node.focus();
        };

        if (motionUrl && playVideo) {
          media.onloadeddata = onLoaded;
          media.src = motionUrl;
        } else {
          media.onload = onLoaded;
          media.src = url;
        }
      }
    },
    [url, motionUrl, playVideo]
  );

  const setMotionUrlFromFilepath = async (filepath: string): Promise<void> => {
    if (filepath === empty || filepath === null) {
      setMotionUrl(null);
      return;
    }

    const motionStart = await myAPI.motioncheck(filepath);
    if (motionStart < 0) {
      setMotionUrl(null);
      return;
    }

    const motionDataUrl = await myAPI.motionAsDataURL(filepath, motionStart);
    setMotionUrl(motionDataUrl);
  };

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
        setMotionUrlFromFilepath(file.path);
        setUrl(file.path);
        myAPI.history(file.path);
      }
    }
  };

  const next = useCallback(async (): Promise<void> => {
    if (url === empty) return;

    const dir = await myAPI.dirname(url);
    if (!dir) {
      setMotionUrl(null);
      setUrl(empty);
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0) {
      setMotionUrl(null);
      setUrl(empty);
      return;
    }

    if (list.length === 1) return;

    const index = list.indexOf(url);
    if (index === list.length - 1 || index === -1) {
      setMotionUrlFromFilepath(list[0]);
      setUrl(list[0]);
    } else {
      setMotionUrlFromFilepath(list[index + 1]);
      setUrl(list[index + 1]);
    }
  }, [url]);

  const prev = useCallback(async (): Promise<void> => {
    if (url === empty) return;

    const dir = await myAPI.dirname(url);
    if (!dir) {
      setMotionUrl(null);
      setUrl(empty);
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0) {
      setMotionUrl(null);
      setUrl(empty);
      return;
    }

    if (list.length === 1) return;

    const index = list.indexOf(url);
    if (index === 0) {
      setMotionUrlFromFilepath(list[list.length - 1]);
      setUrl(list[list.length - 1]);
    } else if (index === -1) {
      setMotionUrlFromFilepath(list[0]);
      setUrl(list[0]);
    } else {
      setMotionUrlFromFilepath(list[index - 1]);
      setUrl(list[index - 1]);
    }
  }, [url]);

  const motion = useCallback(async (): Promise<void> => {
    if (!motionUrl) return;

    setPlayVideo(!playVideo);
  }, [motionUrl, playVideo]);

  const remove = useCallback(async (): Promise<void> => {
    if (url === empty) return;

    const dir = await myAPI.dirname(url);
    if (!dir) {
      setMotionUrl(null);
      setUrl(empty);
      return;
    }

    const list = await myAPI.readdir(dir);
    if (!list || list.length === 0 || !list.includes(url)) {
      setMotionUrl(null);
      setUrl(empty);
      return;
    }

    const index = list.indexOf(url);

    await myAPI.moveToTrash(url);
    const newList = await myAPI.readdir(dir);

    if (!newList || newList.length === 0) {
      setMotionUrl(null);
      setUrl(empty);
      return;
    }

    if (index > newList.length - 1) {
      setMotionUrlFromFilepath(newList[0]);
      setUrl(newList[0]);
    } else {
      setMotionUrlFromFilepath(newList[index]);
      setUrl(newList[index]);
    }
  }, [url]);

  const onClickOpen = async (): Promise<void> => {
    const filepath = await myAPI.openDialog();
    if (!filepath) return;

    const mime = await myAPI.mimecheck(filepath);
    if (mime) {
      setMotionUrlFromFilepath(filepath);
      setUrl(filepath);
      myAPI.history(filepath);
    }
  };

  const onMenuOpen = useCallback(async (_e: Event, filepath: string) => {
    if (!filepath) return;

    const mime = await myAPI.mimecheck(filepath);
    if (mime) {
      setMotionUrlFromFilepath(filepath);
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
    myAPI.menuMotion(motion);

    return (): void => {
      myAPI.removeMenuMotion();
    };
  }, [motion]);

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
      onDragEnter={preventDefault}
      onDragOver={preventDefault}
      onDragLeave={preventDefault}
      onDrop={onDrop}
      onKeyDown={onKeyDown}>
      <div className="bottom">
        <Float
          onClickOpen={onClickOpen}
          prev={prev}
          motion={motion}
          next={next}
          remove={remove}
          motionEnabled={motionUrl !== null}
        />
      </div>
      <div className={url === empty ? 'view init' : 'view'} ref={mapRef} />
    </div>
  );
};
