import { Menu, app } from 'electron';
import { WindowManagementService } from '../services/window-management.service';

export class NativeMenuManager {
  constructor(private windowService: WindowManagementService) {}

  createMenu() {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'Cash Log',
        submenu: [
          { label: 'About Cash Log', role: 'about' },
          { type: 'separator' },
          { label: 'Hide Cash Log', role: 'hide' },
          { label: 'Hide Others', role: 'hideOthers' },
          { label: 'Show All', role: 'unhide' },
          { type: 'separator' },
          { label: 'Quit', accelerator: 'Cmd+Q', role: 'quit' },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'Cmd+Z', role: 'undo' },
          { label: 'Redo', accelerator: 'Shift+Cmd+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'Cmd+X', role: 'cut' },
          { label: 'Copy', accelerator: 'Cmd+C', role: 'copy' },
          { label: 'Paste', accelerator: 'Cmd+V', role: 'paste' },
        ],
      },
      {
        label: 'Window',
        submenu: [
          { label: 'Minimize', accelerator: 'Cmd+M', role: 'minimize' },
          { label: 'Zoom', role: 'zoom' },
          { type: 'separator' },
          { label: 'Bring All to Front', role: 'front' },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}
