export interface TrayData {
  todayTotal: number;
  transactionCount: number;
}

export interface ElectronAPI {
  fileSystem: {
    saveFile: (data: any, format: 'csv' | 'excel' | 'pdf') => Promise<string | null>;
    openFile: () => Promise<string[] | null>;
  };
  notifications: {
    send: (title: string, body: string) => void;
  };
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
  state: {
    getTrayData: () => Promise<TrayData>;
    updateTrayData: (data: Partial<TrayData>) => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
