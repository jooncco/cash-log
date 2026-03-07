import { ipcMain, app } from 'electron';
import { WindowManagementService } from './services/window-management.service';
import { FileSystemService } from './services/file-system.service';
import { NotificationService } from './services/notification.service';
import { SystemTrayManager } from './managers/system-tray.manager';
import fs from 'fs';
import path from 'path';

const fileSystemService = new FileSystemService();
const notificationService = new NotificationService();

export function registerIPCHandlers(
  windowService: WindowManagementService,
  trayManager: SystemTrayManager
) {
  // Get config
  ipcMain.handle('config:get', async () => {
    try {
      const resourcesPath = app.isPackaged
        ? path.join(process.resourcesPath, 'resources')
        : path.join(__dirname, '../../build/resources');
      const configPath = path.join(resourcesPath, 'config.json');
      
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return config;
      }
      return null;
    } catch (error) {
      console.error('Config read error:', error);
      return null;
    }
  });

  // File operations
  ipcMain.handle('file:save', async (_, data, format) => {
    try {
      return await fileSystemService.saveFile(data, format);
    } catch (error) {
      console.error('File save error:', error);
      return null;
    }
  });

  ipcMain.handle('file:open', async () => {
    try {
      return await fileSystemService.openFile();
    } catch (error) {
      console.error('File open error:', error);
      return null;
    }
  });

  // Notifications
  ipcMain.handle('notification:send', (_, title, body) => {
    notificationService.send(title, body);
  });

  // Window controls
  ipcMain.handle('window:minimize', () => {
    windowService.minimizeWindow();
  });

  ipcMain.handle('window:maximize', () => {
    windowService.maximizeWindow();
  });

  ipcMain.handle('window:close', () => {
    windowService.closeWindow();
  });

  // State sync
  ipcMain.handle('state:getTrayData', () => {
    return trayManager.getTrayData();
  });

  ipcMain.handle('state:updateTrayData', (_, data) => {
    trayManager.updateTrayData(data);
  });
}
