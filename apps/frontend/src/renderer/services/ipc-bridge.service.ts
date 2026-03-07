export const ipcBridge = {
  fileSystem: {
    saveFile: (data: any, format: 'csv' | 'excel' | 'pdf') =>
      window.electron.fileSystem.saveFile(data, format),
    openFile: () => window.electron.fileSystem.openFile(),
  },
  notifications: {
    send: (title: string, body: string) =>
      window.electron.notifications.send(title, body),
  },
  window: {
    minimize: () => window.electron.window.minimize(),
    maximize: () => window.electron.window.maximize(),
    close: () => window.electron.window.close(),
  },
  state: {
    getTrayData: () => window.electron.state.getTrayData(),
    updateTrayData: (data: any) => window.electron.state.updateTrayData(data),
  },
};
