export interface TrayData {
  todayTotal: number;
  transactionCount: number;
}

export interface AppConfig {
  api: {
    baseUrl: string;
  };
  db: {
    user: string;
    password: string;
    rootPassword: string;
    database: string;
    port: string;
  };
}

export interface ElectronAPI {
  config: {
    get: () => Promise<AppConfig | null>;
  };
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
