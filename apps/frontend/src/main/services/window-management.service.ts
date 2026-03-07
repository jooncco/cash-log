import { BrowserWindow } from 'electron';
import Store from 'electron-store';
import path from 'path';

interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export class WindowManagementService {
  private mainWindow: BrowserWindow | null = null;
  private store: Store<{ windowState: WindowState }>;

  constructor() {
    this.store = new Store({
      defaults: {
        windowState: { width: 1200, height: 800 },
      },
    });
  }

  createMainWindow(): BrowserWindow {
    const windowState = this.store.get('windowState');

    this.mainWindow = new BrowserWindow({
      width: windowState.width,
      height: windowState.height,
      x: windowState.x,
      y: windowState.y,
      title: 'Cash Log',
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    this.mainWindow.on('close', () => {
      if (this.mainWindow) {
        const bounds = this.mainWindow.getBounds();
        this.store.set('windowState', bounds);
      }
    });

    return this.mainWindow;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  showWindow() {
    if (this.mainWindow) {
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  hideWindow() {
    if (this.mainWindow) {
      this.mainWindow.hide();
    }
  }

  minimizeWindow() {
    if (this.mainWindow) {
      this.mainWindow.minimize();
    }
  }

  maximizeWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow.maximize();
      }
    }
  }

  closeWindow() {
    if (this.mainWindow) {
      this.mainWindow.close();
    }
  }
}
