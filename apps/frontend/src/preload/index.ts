import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI } from './types';

const electronAPI: ElectronAPI = {
  fileSystem: {
    saveFile: (data: any, format: 'csv' | 'excel' | 'pdf') =>
      ipcRenderer.invoke('file:save', data, format),
    openFile: () => ipcRenderer.invoke('file:open'),
  },
  notifications: {
    send: (title: string, body: string) =>
      ipcRenderer.invoke('notification:send', title, body),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
  state: {
    getTrayData: () => ipcRenderer.invoke('state:getTrayData'),
    updateTrayData: (data: any) =>
      ipcRenderer.invoke('state:updateTrayData', data),
  },
};

contextBridge.exposeInMainWorld('electron', electronAPI);
