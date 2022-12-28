/* eslint-disable no-undef */
declare global {
  interface Window {
    myAPI: IElectronAPI;
  }
}

export interface IElectronAPI {
  getLocale: () => Promise<string>;

  contextMenu: () => Promise<void>;

  history: (filepath: string) => Promise<void>;

  mimecheck: (filepath: string) => Promise<boolean>;

  isVideo: (filepath: string) => Promise<boolean>;

  dirname: (filepath: string) => Promise<string>;

  readdir: (dirpath: string) => Promise<void | string[]>;

  moveToTrash: (filepath: string) => Promise<void>;

  openDialog: () => Promise<string | void | undefined>;

  updateTitle: (filepath: string) => Promise<void>;

  menuNext: (listener: () => Promise<void>) => () => Electron.IpcRenderer;

  menuPrev: (listener: () => Promise<void>) => () => Electron.IpcRenderer;

  menuRemove: (listener: () => Promise<void>) => () => Electron.IpcRenderer;

  menuOpen: (
    listener: (_e: Event, filepath: string) => Promise<void>,
  ) => () => Electron.IpcRenderer;

  toggleGrid: (
    listener: (_e: Event, filepath: string) => Promise<void>,
  ) => () => Electron.IpcRenderer;
}

export interface GalleryContextInterface {
  folderPath: string | '';
  setFolderPath(folderPath: string): void;
  imgList: string[];
  setImgList(imgList: string[]): void;
  imgURL: string;
  setImgURL(imgURL: string): void;
  onNext(): Promise<void>;
  onPrevious(): Promise<void>;
  onRemove(): Promise<void>;
  onClickOpen(): Promise<void>;
  onMenuOpen(_e: Event, filefolderPath: string): Promise<void>;
}
