import { Tray, Menu, app, nativeImage } from 'electron';
import path from 'path';
import { WindowManagementService } from '../services/window-management.service';

interface TrayData {
  todayTotal: number;
  transactionCount: number;
}

export class SystemTrayManager {
  private tray: Tray | null = null;
  private trayData: TrayData = { todayTotal: 0, transactionCount: 0 };

  constructor(private windowService: WindowManagementService) {}

  createTray() {
    const iconPath = path.join(__dirname, '../../build/tray-icon.png');
    const icon = nativeImage.createFromPath(iconPath);
    this.tray = new Tray(icon.resize({ width: 16, height: 16 }));
    this.updateTrayMenu(this.trayData);
  }

  updateTrayMenu(data: TrayData) {
    this.trayData = { ...this.trayData, ...data };

    const menu = Menu.buildFromTemplate([
      { label: `Today: $${this.trayData.todayTotal.toFixed(2)}`, enabled: false },
      { label: `Transactions: ${this.trayData.transactionCount}`, enabled: false },
      { type: 'separator' },
      { label: 'Show Window', click: () => this.windowService.showWindow() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ]);

    this.tray?.setContextMenu(menu);
  }

  updateTrayData(data: Partial<TrayData>) {
    this.updateTrayMenu({ ...this.trayData, ...data });
  }

  getTrayData(): TrayData {
    return this.trayData;
  }
}
