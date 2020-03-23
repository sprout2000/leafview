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

import './styles.scss';

const { ipcRenderer } = window;

const App = (): JSX.Element => {
  const initList: string[] = [];
  const [list, setList] = useState(initList);
  const [index, setIndex] = useState(0);
  const [sidebar, setSidebar] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.MutableRefObject<L.Map | null> = useRef(null);

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

  const onResize = (): void => {
    const node = containerRef.current;
    if (node) draw(list[index], node.clientWidth, node.clientHeight);
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
      const list: string[] = await ipcRenderer.invoke(
        'selected-file',
        file.path
      );

      if (list.length === 0) return;
      const index = list.indexOf(file.path);

      for (const item of list) console.log(item);

      setIndex(() => {
        const newIndex = index;
        setList(list);

        return newIndex;
      });
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
    if (node) draw(list[index], node.clientWidth, node.clientHeight);
  }, [draw, list, index]);

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
              <div className="icon-container">
                <FontAwesomeIcon icon={faArrowAltCircleLeft} size="2x" />
              </div>
              <div className="icon-container">
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
