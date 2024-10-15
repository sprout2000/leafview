declare global {
  interface Window {
    myAPI: IElectronAPI;
  }
}

export interface IElectronAPI {
  showFilePath: (file: File) => string;

  getLocale: () => Promise<string>;

  contextMenu: () => Promise<void>;

  history: (filepath: string) => Promise<void>;

  mimecheck: (filepath: string) => Promise<boolean>;

  dirname: (filepath: string) => Promise<string>;

  readdir: (dirpath: string) => Promise<void | string[]>;

  moveToTrash: (filepath: string) => Promise<void>;

  openDialog: () => Promise<string | void | undefined>;

  updateTitle: (filepath: string) => Promise<void>;

  menuNext: (listener: () => Promise<void>) => () => Electron.IpcRenderer;

  menuPrev: (listener: () => Promise<void>) => () => Electron.IpcRenderer;

  menuRemove: (listener: () => Promise<void>) => () => Electron.IpcRenderer;

  menuOpen: (
    listener: (
      _e: Electron.IpcRendererEvent,
      filepath: string,
    ) => Promise<void>,
  ) => () => Electron.IpcRenderer;

  toggleGrid: (listener: () => Promise<void>) => () => Electron.IpcRenderer;
}
