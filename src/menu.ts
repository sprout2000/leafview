import { MenuItemConstructorOptions } from 'electron';

export const template: MenuItemConstructorOptions[] = [
  { role: 'fileMenu' },
  { role: 'editMenu' },
  { role: 'viewMenu' },
  { role: 'windowMenu' },
];

if (process.platform === 'darwin') {
  template.unshift({ role: 'appMenu' });
}
