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
  const [url, setUrl] = useState(empty);
  const [sidebar, setSidebar] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.MutableRefObject<L.Map | null> = useRef(null);

  const dirRef: React.MutableRefObject<string> = useRef('');
  const listRef: React.MutableRefObject<string[]> = useRef([]);
  const indexRef: React.MutableRefObject<number> = useRef(0);

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

  const next = async (): Promise<void> => {
    if (listRef.current.length <= 1) return;

    const list: string[] = await ipcRenderer.invoke('readdir', dirRef.current);

    if (list.length === 0) {
      setUrl(empty);
      listRef.current = [];
      indexRef.current = 0;
      return;
    } else if (indexRef.current > list.length - 1) {
      const index = list.length - 1;
      listRef.current = list;
      indexRef.current = index;
      setUrl(listRef.current[indexRef.current]);
    } else if (indexRef.current === list.length - 1) {
      const index = 0;
      listRef.current = list;
      indexRef.current = index;
      setUrl(listRef.current[indexRef.current]);
    } else {
      const index = indexRef.current + 1;
      listRef.current = list;
      indexRef.current = index;
      setUrl(listRef.current[indexRef.current]);
    }
  };

  const prev = async (): Promise<void> => {
    if (listRef.current.length <= 1) return;

    const list: string[] = await ipcRenderer.invoke('readdir', dirRef.current);

    if (list.length === 0) {
      setUrl(empty);
      listRef.current = [];
      indexRef.current = 0;
      return;
    } else if (indexRef.current > list.length - 1) {
      const index = list.length - 1;
      listRef.current = list;
      indexRef.current = index;
      setUrl(listRef.current[indexRef.current]);
    } else if (indexRef.current === 0) {
      const index = listRef.current.length - 1;
      listRef.current = list;
      indexRef.current = index;
      setUrl(listRef.current[indexRef.current]);
    } else {
      const index = indexRef.current - 1;
      listRef.current = list;
      indexRef.current = index;
      setUrl(listRef.current[indexRef.current]);
    }
  };

  const onClickRight = (): Promise<void> => next();
  const onClickLeft = (): Promise<void> => prev();

  const onResize = (): void => {
    const node = containerRef.current;
    if (node) draw(url, node.clientWidth, node.clientHeight);
  };

  const onClickToggle = (): void => {
    setSidebar((sidebar) => !sidebar);
  };

  const preventDefault = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = useCallback(async (e: DragEvent) => {
    preventDefault(e);

    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0];
      const dirpath = await ipcRenderer.invoke('selected-file', file.path);

      if (!dirpath) {
        setUrl(empty);
        return;
      }

      const list: string[] = await ipcRenderer.invoke('readdir', dirpath);

      if (list.length === 0) {
        setUrl(empty);
        return;
      }
      const index = list.indexOf(file.path);

      for (const item of list) console.log(item);

      dirRef.current = dirpath;
      listRef.current = list;
      indexRef.current = index;

      setUrl(listRef.current[indexRef.current]);
    }
  }, []);

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
    const node = containerRef.current;
    if (node) draw(url, node.clientWidth, node.clientHeight);
  }, [draw, url]);

  return (
    <div className="wrapper">
      <div className={sidebar ? 'sidebar' : 'sidebar collapsed'}></div>
      <div ref={containerRef} className="content">
        <ResizeDetector handleWidth handleHeight onResize={onResize} />
        <div className="bottom">
          <div className="toolbar">
            <div className="controls">
              <div onClick={onClickToggle} className="icon-container">
                <FontAwesomeIcon icon={faListAlt} size="2x" />
              </div>
              <div className="icon-container">
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
              <div className="icon-container">
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
