import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('myAPI', {
  mimecheck: async (filepath: string): Promise<boolean> =>
    await ipcRenderer.invoke('mime-check', filepath),

  motioncheck: async (filepath: string): Promise<number> =>
    await ipcRenderer.invoke('motion-check', filepath),

  motionAsDataURL: async (
    filepath: string,
    motionStart: number
  ): Promise<string> =>
    await ipcRenderer.invoke('motion-as-data-url', filepath, motionStart),

  history: (filepath: string) => ipcRenderer.send('file-history', filepath),

  dirname: async (filepath: string): Promise<string> =>
    await ipcRenderer.invoke('dirname', filepath),

  readdir: async (dirpath: string): Promise<void | string[]> =>
    await ipcRenderer.invoke('readdir', dirpath),

  moveToTrash: async (filepath: string): Promise<boolean> =>
    await ipcRenderer.invoke('move-to-trash', filepath),

  openDialog: async (): Promise<string | void | undefined> =>
    await ipcRenderer.invoke('open-dialog'),

  updateTitle: async (filepath: string): Promise<void> =>
    await ipcRenderer.invoke('update-title', filepath),

  menuNext: (listener: () => Promise<void>) =>
    ipcRenderer.on('menu-next', listener),
  removeMenuNext: () => ipcRenderer.removeAllListeners('menu-next'),

  menuPrev: (listener: () => Promise<void>) =>
    ipcRenderer.on('menu-prev', listener),
  removeMenuPrev: () => ipcRenderer.removeAllListeners('menu-prev'),

  menuMotion: (listener: () => Promise<void>) =>
    ipcRenderer.on('menu-motion', listener),
  removeMenuMotion: () => ipcRenderer.removeAllListeners('menu-motion'),

  menuRemove: (listener: () => Promise<void>) =>
    ipcRenderer.on('menu-remove', listener),
  removeMenuRemove: () => ipcRenderer.removeAllListeners('menu-remove'),

  menuOpen: (listener: (_e: Event, filepath: string) => Promise<void>) =>
    ipcRenderer.on('menu-open', listener),
  removeMenuOpen: () => ipcRenderer.removeAllListeners('menu-open'),
});
