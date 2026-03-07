import { app, BrowserWindow } from 'electron';
import path from 'path';
import { WindowManagementService } from './services/window-management.service';
import { SystemTrayManager } from './managers/system-tray.manager';
import { NativeMenuManager } from './managers/native-menu.manager';
import { BackendManager } from './managers/backend.manager';
import { registerIPCHandlers } from './ipc-handlers';

class Application {
  private windowService: WindowManagementService;
  private trayManager: SystemTrayManager;
  private menuManager: NativeMenuManager;
  private backendManager: BackendManager;

  constructor() {
    this.windowService = new WindowManagementService();
    this.trayManager = new SystemTrayManager(this.windowService);
    this.menuManager = new NativeMenuManager(this.windowService);
    this.backendManager = new BackendManager();
  }

  async initialize() {
    // Start backend services (DB + API)
    if (process.env.AUTO_START_BACKEND !== 'false') {
      await this.backendManager.start();
    }

    // Register IPC handlers
    registerIPCHandlers(this.windowService, this.trayManager);

    // Create main window
    const mainWindow = this.windowService.createMainWindow();

    // Create system tray
    this.trayManager.createTray();

    // Create native menu
    this.menuManager.createMenu();

    // Load renderer
    if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
  }

  shutdown() {
    this.backendManager.stop();
  }
}

// App lifecycle
let appInstance: Application;

app.whenReady().then(() => {
  app.setName('Cash Log');
  appInstance = new Application();
  appInstance.initialize();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (appInstance) {
    appInstance.shutdown();
  }
});

app.on('will-quit', () => {
  if (appInstance) {
    appInstance.shutdown();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    appInstance = new Application();
    appInstance.initialize();
  }
});
