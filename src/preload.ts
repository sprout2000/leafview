import {
  contextBridge,
  type IpcRendererEvent,
  ipcRenderer,
  webUtils,
} from "electron";

/**
 * Returns a function that subscribes a listener to an IPC message from the
 * main process, and returns a function to unsubscribe it.
 */
const listen =
  <Args extends unknown[] = []>(channel: string) =>
  (listener: (e: IpcRendererEvent, ...args: Args) => Promise<void>) => {
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeAllListeners(channel);
  };

contextBridge.exposeInMainWorld("myAPI", {
  showFilePath: (file: File) => webUtils.getPathForFile(file),

  getLocale: (): Promise<string> => ipcRenderer.invoke("get-locale"),

  contextMenu: (): Promise<void> => ipcRenderer.invoke("show-context-menu"),

  history: (filepath: string): Promise<void> =>
    ipcRenderer.invoke("file-history", filepath),

  mimecheck: (filepath: string): Promise<boolean> =>
    ipcRenderer.invoke("mime-check", filepath),

  dirname: (filepath: string): Promise<string> =>
    ipcRenderer.invoke("dirname", filepath),

  readdir: (dirpath: string): Promise<string[] | undefined> =>
    ipcRenderer.invoke("readdir", dirpath),

  moveToTrash: (filepath: string): Promise<void> =>
    ipcRenderer.invoke("move-to-trash", filepath),

  openDialog: (): Promise<string | undefined> =>
    ipcRenderer.invoke("open-dialog"),

  updateTitle: (filepath: string): Promise<void> =>
    ipcRenderer.invoke("update-title", filepath),

  menuNext: listen("menu-next"),
  menuPrev: listen("menu-prev"),
  menuRemove: listen("menu-remove"),
  menuOpen: listen<[filepath: string]>("menu-open"),
  toggleGrid: listen("toggle-grid"),
  dirChanged: listen<[dir: string]>("dir-changed"),
});
