declare global {
  interface Window {
    myAPI: IElectronAPI;
  }
}

export interface IElectronAPI {
  mimecheck: (filepath: string) => Promise<boolean>;

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
}
