# NFR Design Patterns - Electron Desktop App

## Electron Architecture Patterns

### Pattern 1: Main/Renderer Process Separation
**Pattern**: Strict separation with minimal main process logic
**Implementation**:
- **Main Process**: Native OS integrations only (window, tray, notifications, file system)
- **Renderer Process**: All UI logic, business logic, API calls, state management
- **Communication**: IPC via contextBridge

**Rationale**: Keep renderer process focused on UI, main process focused on native features

---

### Pattern 2: Secure IPC with Context Bridge
**Pattern**: Feature-based IPC channels with contextBridge
**Implementation**:
```typescript
// Preload script exposes APIs via contextBridge
contextBridge.exposeInMainWorld('electron', {
  fileSystem: {
    saveFile: (data, format) => ipcRenderer.invoke('file:save', data, format),
    openFile: () => ipcRenderer.invoke('file:open')
  },
  notifications: {
    send: (title, body) => ipcRenderer.invoke('notification:send', title, body)
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close')
  },
  state: {
    getTrayData: () => ipcRenderer.invoke('state:getTrayData'),
    updateTrayData: (data) => ipcRenderer.invoke('state:updateTrayData', data)
  }
});
```

**IPC Channel Naming Convention**: `<feature>:<operation>`
- `file:save`, `file:open`
- `notification:send`
- `window:minimize`, `window:maximize`, `window:close`
- `state:getTrayData`, `state:updateTrayData`

**Security Configuration**:
```javascript
{
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  webSecurity: true
}
```

**Rationale**: Maximum security, organized by feature, type-safe interface

---

### Pattern 3: Preload Script Structure
**Pattern**: Single preload script with feature-grouped APIs
**Implementation**:
```
src/
├── main/
│   ├── index.ts              # Main process entry
│   ├── ipc-handlers.ts       # IPC handler registration
│   └── services/             # Main process services
└── preload/
    └── index.ts              # Preload script with contextBridge
```

**Rationale**: Centralized API exposure, easy to maintain

---

## Performance Optimization Patterns

### Pattern 4: Route-Based Code Splitting
**Pattern**: Split code by page/view for optimal loading
**Implementation**:
```typescript
// Lazy load page components
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = React.lazy(() => import('./pages/TransactionsPage'));
const BudgetsPage = React.lazy(() => import('./pages/BudgetsPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

// Render with Suspense
<Suspense fallback={<Spinner />}>
  {currentView === 'dashboard' && <DashboardPage />}
  {currentView === 'transactions' && <TransactionsPage />}
  {/* ... */}
</Suspense>
```

**Rationale**: Faster initial load, load pages on demand

---

### Pattern 5: Asset Optimization
**Pattern**: Standard optimization with Vite
**Implementation**:
- Tree-shaking unused code
- Minification in production
- Image compression (basic)
- Font subsetting (if needed)
- Remove source maps in production

**Vite Configuration**:
```typescript
export default defineConfig({
  build: {
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2']
        }
      }
    }
  }
});
```

**Rationale**: Balance between bundle size and development speed

---

### Pattern 6: Memory Management
**Pattern**: Standard cleanup with reasonable caching
**Implementation**:
- Cleanup on app idle (5 minutes of inactivity)
- Limit transaction list to 1000 items in memory
- Cache API responses for 5 minutes
- Clear cache on navigation away from page

**Rationale**: Balance between performance and memory usage

---

## Error Handling and Resilience Patterns

### Pattern 7: Per-Page Error Boundaries
**Pattern**: Error boundary for each page component
**Implementation**:
```typescript
// ErrorBoundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <DashboardPage />
</ErrorBoundary>
```

**Rationale**: Isolate errors to specific pages, prevent full app crash

---

### Pattern 8: IPC Error Handling
**Pattern**: Try-catch with user-friendly error messages
**Implementation**:
```typescript
// Main process IPC handler
ipcMain.handle('file:save', async (event, data, format) => {
  try {
    const result = await fileSystemService.saveFile(data, format);
    return { success: true, result };
  } catch (error) {
    console.error('File save error:', error);
    return { success: false, error: error.message };
  }
});

// Renderer process IPC call
try {
  const response = await window.electron.fileSystem.saveFile(data, format);
  if (!response.success) {
    throw new Error(response.error);
  }
  // Success handling
} catch (error) {
  // Show user-friendly error message
  showErrorNotification('Failed to save file', error.message);
}
```

**Rationale**: Graceful error handling, clear error messages

---

### Pattern 9: API Error Handling with Retry
**Pattern**: Retry transient errors with exponential backoff
**Implementation**:
```typescript
// Axios interceptor with retry logic
axios.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    
    // Don't retry if already retried max times
    if (!config || config.__retryCount >= 3) {
      return Promise.reject(error);
    }
    
    // Retry only on network errors or 5xx errors
    if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
      config.__retryCount = config.__retryCount || 0;
      config.__retryCount++;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, config.__retryCount - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return axios(config);
    }
    
    return Promise.reject(error);
  }
);
```

**Rationale**: Resilient to transient network errors, better UX

---

### Pattern 10: Graceful Degradation
**Pattern**: App continues to function with reduced features when backend is unavailable
**Implementation**:
- Show clear error message when backend is down
- Disable features that require backend
- Allow user to retry connection
- Keep UI responsive

**Rationale**: Better user experience during backend downtime

---

## Desktop Integration Patterns

### Pattern 11: System Tray Pattern
**Pattern**: System tray with context menu and state updates
**Implementation**:
```typescript
class SystemTrayManager {
  private tray: Tray;
  
  createTray() {
    this.tray = new Tray(trayIconPath);
    this.updateTrayMenu({ todayTotal: 0, transactionCount: 0 });
  }
  
  updateTrayMenu(data: TrayData) {
    const menu = Menu.buildFromTemplate([
      { label: `Today: $${data.todayTotal}`, enabled: false },
      { label: `Transactions: ${data.transactionCount}`, enabled: false },
      { type: 'separator' },
      { label: 'Show Window', click: () => this.showWindow() },
      { label: 'Quick Add Transaction', click: () => this.quickAdd() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ]);
    this.tray.setContextMenu(menu);
  }
}
```

**Rationale**: Quick access to app features, always visible

---

### Pattern 12: Native Notification Pattern
**Pattern**: Native notifications with click handling
**Implementation**:
```typescript
class NotificationManager {
  send(title: string, body: string) {
    const notification = new Notification({ title, body });
    
    notification.on('click', () => {
      // Focus main window on notification click
      const mainWindow = windowManagementService.getMainWindow();
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
    
    notification.show();
  }
}
```

**Rationale**: Native macOS notifications, focus window on click

---

### Pattern 13: File System Access Pattern
**Pattern**: All file operations in main process via IPC
**Implementation**:
```typescript
// Main process
class FileSystemService {
  async saveFile(data: any, format: 'csv' | 'excel' | 'pdf') {
    // Show native save dialog
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `transactions.${format}`,
      filters: [{ name: format.toUpperCase(), extensions: [format] }]
    });
    
    if (!filePath) return null;
    
    // Write file based on format
    switch (format) {
      case 'csv':
        await this.exportToCSV(filePath, data);
        break;
      case 'excel':
        await this.exportToExcel(filePath, data);
        break;
      case 'pdf':
        await this.exportToPDF(filePath, data);
        break;
    }
    
    return filePath;
  }
}
```

**Rationale**: Secure file access, native dialogs

---

### Pattern 14: Window Management Pattern
**Pattern**: Persist and restore window state
**Implementation**:
```typescript
class WindowManagementService {
  createMainWindow() {
    // Load saved window state
    const windowState = this.loadWindowState();
    
    const window = new BrowserWindow({
      width: windowState.width || 1200,
      height: windowState.height || 800,
      x: windowState.x,
      y: windowState.y,
      webPreferences: { /* ... */ }
    });
    
    // Save window state on close
    window.on('close', () => {
      const bounds = window.getBounds();
      this.saveWindowState(bounds);
    });
    
    return window;
  }
  
  private loadWindowState() {
    // Load from electron-store or similar
    return store.get('windowState', {});
  }
  
  private saveWindowState(bounds) {
    store.set('windowState', bounds);
  }
}
```

**Rationale**: Remember user's window preferences

---

## State Management Patterns

### Pattern 15: Zustand Store Pattern for Desktop
**Pattern**: Renderer-only stores with minimal main process sync
**Implementation**:
- All Zustand stores remain in renderer process
- Only tray display data synced to main process
- Use existing store structure from web app

**Rationale**: Maximize code reuse, minimize IPC overhead

---

### Pattern 16: State Persistence Pattern
**Pattern**: Persist all user preferences
**Implementation**:
```typescript
// Use electron-store for persistence
import Store from 'electron-store';

const store = new Store({
  defaults: {
    theme: 'light',
    language: 'en',
    windowState: { width: 1200, height: 800 }
  }
});

// Session store with persistence
const useSessionStore = create(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language })
    }),
    {
      name: 'session-storage',
      storage: {
        getItem: (name) => store.get(name),
        setItem: (name, value) => store.set(name, value),
        removeItem: (name) => store.delete(name)
      }
    }
  )
);
```

**Persisted State**:
- Theme (light/dark)
- Language (en/ko)
- Window size and position

**Rationale**: Remember user preferences across sessions

---

## Logging Pattern

### Pattern 17: Console Logging
**Pattern**: Simple console logging for development and production
**Implementation**:
```typescript
// Simple logging utility
const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  }
};
```

**Rationale**: Simple and sufficient for personal use

---

## Pattern Summary

| Pattern | Category | Purpose |
|---------|----------|---------|
| Main/Renderer Separation | Architecture | Clear process boundaries |
| Secure IPC with Context Bridge | Architecture | Maximum security |
| Preload Script Structure | Architecture | Centralized API exposure |
| Route-Based Code Splitting | Performance | Faster initial load |
| Asset Optimization | Performance | Smaller bundle size |
| Memory Management | Performance | Efficient resource usage |
| Per-Page Error Boundaries | Resilience | Isolate errors |
| IPC Error Handling | Resilience | Graceful IPC errors |
| API Error Handling with Retry | Resilience | Resilient to network errors |
| Graceful Degradation | Resilience | Function during backend downtime |
| System Tray Pattern | Desktop Integration | Quick access |
| Native Notification Pattern | Desktop Integration | Native notifications |
| File System Access Pattern | Desktop Integration | Secure file operations |
| Window Management Pattern | Desktop Integration | Remember window state |
| Zustand Store Pattern | State Management | Maximize code reuse |
| State Persistence Pattern | State Management | Remember preferences |
| Console Logging | Logging | Simple logging |

**Total Patterns**: 17 design patterns covering all NFR requirements
