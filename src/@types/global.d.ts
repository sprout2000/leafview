declare global {
  interface Window {
    myAPI: Sandbox;
  }
}

export interface Sandbox {
  mimecheck: (filepath: string) => Promise<boolean>;

  history: (filepath: string) => void;

  dirname: (filepath: string) => Promise<string>;

  readdir: (dirpath: string) => Promise<void | string[]>;

  moveToTrash: (filepath: string) => Promise<void>;

  openDialog: () => Promise<string | void | undefined>;

  updateTitle: (filepath: string) => Promise<void>;

  menuNext: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeMenuNext: () => Electron.IpcRenderer;

  menuPrev: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeMenuPrev: () => Electron.IpcRenderer;

  menuRemove: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeMenuRemove: () => Electron.IpcRenderer;

  menuOpen: (
    listener: (_e: Event, filepath: string) => Promise<void>
  ) => Electron.IpcRenderer;
  removeMenuOpen: () => Electron.IpcRenderer;

  contextMenu: () => void;

  close: () => Promise<void>;
  restore: () => Promise<void>;
  maximize: () => Promise<void>;
  minimize: () => Promise<void>;

  resized: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeResized: () => Electron.IpcRenderer;

  maximized: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeMaximized: () => Electron.IpcRenderer;

  unMaximized: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeUnMaximized: () => Electron.IpcRenderer;

  getFocus: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeGetFocus: () => Electron.IpcRenderer;

  getBlur: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeGetBlur: () => Electron.IpcRenderer;
}
