# Logical Components - Electron Desktop App

## Overview

Logical components represent the infrastructure and architectural elements needed to implement NFR requirements. These are not business logic components but rather technical components that support the application's non-functional requirements.

---

## IPC Infrastructure Components

### 1. IPC Channel Registry
**Purpose**: Centralized registry of all IPC channels
**Type**: Configuration/Registry
**Implementation**: TypeScript interface defining all IPC channels

```typescript
interface IPCChannels {
  // File operations
  'file:save': (data: any, format: string) => Promise<string | null>;
  'file:open': () => Promise<string[] | null>;
  
  // Notifications
  'notification:send': (title: string, body: string) => void;
  
  // Window operations
  'window:minimize': () => void;
  'window:maximize': () => void;
  'window:close': () => void;
  
  // State sync
  'state:getTrayData': () => Promise<TrayData>;
  'state:updateTrayData': (data: Partial<TrayData>) => void;
}
```

**Rationale**: Type-safe IPC communication, single source of truth

---

### 2. Context Bridge API
**Purpose**: Expose secure IPC APIs to renderer process
**Type**: Security Layer
**Location**: Preload script

```typescript
const electronAPI = {
  fileSystem: {
    saveFile: (data: any, format: string) => 
      ipcRenderer.invoke('file:save', data, format),
    openFile: () => 
      ipcRenderer.invoke('file:open')
  },
  notifications: {
    send: (title: string, body: string) => 
      ipcRenderer.invoke('notification:send', title, body)
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close')
  },
  state: {
    getTrayData: () => ipcRenderer.invoke('state:getTrayData'),
    updateTrayData: (data: Partial<TrayData>) => 
      ipcRenderer.invoke('state:updateTrayData', data)
  }
};

contextBridge.exposeInMainWorld('electron', electronAPI);
```

**Rationale**: Secure, type-safe renderer→main communication

---

## State Management Components

### 3. Electron Store
**Purpose**: Persist user preferences and window state
**Type**: Storage Layer
**Technology**: electron-store

```typescript
import Store from 'electron-store';

interface StoreSchema {
  theme: 'light' | 'dark';
  language: 'en' | 'ko';
  windowState: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
}

const store = new Store<StoreSchema>({
  defaults: {
    theme: 'light',
    language: 'en',
    windowState: { width: 1200, height: 800 }
  }
});
```

**Persisted Data**:
- User preferences (theme, language)
- Window state (size, position)

**Rationale**: Persistent storage for user preferences

---

### 4. Tray Data Sync Component
**Purpose**: Synchronize minimal state between main and renderer
**Type**: State Sync Layer
**Data Flow**: Renderer → Main Process → System Tray

```typescript
interface TrayData {
  todayTotal: number;
  transactionCount: number;
}

// Renderer updates tray data
window.electron.state.updateTrayData({
  todayTotal: 150.50,
  transactionCount: 5
});

// Main process updates tray menu
systemTrayManager.updateTrayMenu(trayData);
```

**Rationale**: Keep system tray updated with latest data

---

## Error Handling Components

### 5. Error Boundary Component
**Purpose**: Catch React errors and prevent full app crash
**Type**: Error Handling Layer
**Scope**: Per-page error boundaries

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**Rationale**: Isolate errors to specific pages

---

### 6. API Retry Interceptor
**Purpose**: Automatically retry failed API requests
**Type**: Resilience Layer
**Technology**: Axios interceptor

```typescript
axios.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    
    if (!config || config.__retryCount >= 3) {
      return Promise.reject(error);
    }
    
    if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      const delay = Math.pow(2, config.__retryCount - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return axios(config);
    }
    
    return Promise.reject(error);
  }
);
```

**Retry Logic**:
- Max 3 retries
- Exponential backoff (1s, 2s, 4s)
- Only retry network errors and 5xx errors

**Rationale**: Resilient to transient network errors

---

## Performance Components

### 7. Code Splitting Loader
**Purpose**: Lazy load page components
**Type**: Performance Layer
**Technology**: React.lazy + Suspense

```typescript
// Lazy loaded components
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

### 8. Memory Cleanup Manager
**Purpose**: Clean up memory on app idle
**Type**: Performance Layer

```typescript
class MemoryCleanupManager {
  private idleTimer: NodeJS.Timeout | null = null;
  private readonly IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  
  resetIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    
    this.idleTimer = setTimeout(() => {
      this.performCleanup();
    }, this.IDLE_TIMEOUT);
  }
  
  private performCleanup() {
    // Clear cached API responses
    apiCache.clear();
    
    // Trigger garbage collection (if available)
    if (global.gc) {
      global.gc();
    }
  }
}
```

**Rationale**: Efficient memory usage during idle periods

---

## Desktop Integration Components

### 9. Native Menu Builder
**Purpose**: Build macOS native menu structure
**Type**: Desktop Integration Layer

```typescript
class NativeMenuBuilder {
  buildMenu(): Menu {
    const template: MenuItemConstructorOptions[] = [
      {
        label: 'Cash Log',
        submenu: [
          { label: 'About Cash Log', role: 'about' },
          { type: 'separator' },
          { label: 'Preferences...', accelerator: 'Cmd+,', click: () => this.openSettings() },
          { type: 'separator' },
          { label: 'Hide Cash Log', role: 'hide' },
          { label: 'Hide Others', role: 'hideOthers' },
          { label: 'Show All', role: 'unhide' },
          { type: 'separator' },
          { label: 'Quit', accelerator: 'Cmd+Q', role: 'quit' }
        ]
      },
      {
        label: 'File',
        submenu: [
          { label: 'New Transaction', accelerator: 'Cmd+N', click: () => this.newTransaction() },
          { type: 'separator' },
          { label: 'Export...', accelerator: 'Cmd+E', click: () => this.export() }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'Cmd+Z', role: 'undo' },
          { label: 'Redo', accelerator: 'Shift+Cmd+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'Cmd+X', role: 'cut' },
          { label: 'Copy', accelerator: 'Cmd+C', role: 'copy' },
          { label: 'Paste', accelerator: 'Cmd+V', role: 'paste' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { label: 'Dashboard', accelerator: 'Cmd+1', click: () => this.navigate('dashboard') },
          { label: 'Transactions', accelerator: 'Cmd+2', click: () => this.navigate('transactions') },
          { label: 'Budgets', accelerator: 'Cmd+3', click: () => this.navigate('budgets') },
          { label: 'Analytics', accelerator: 'Cmd+4', click: () => this.navigate('analytics') },
          { type: 'separator' },
          { label: 'Reload', accelerator: 'Cmd+R', role: 'reload' },
          { label: 'Toggle Developer Tools', accelerator: 'Alt+Cmd+I', role: 'toggleDevTools' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { label: 'Minimize', accelerator: 'Cmd+M', role: 'minimize' },
          { label: 'Zoom', role: 'zoom' },
          { type: 'separator' },
          { label: 'Bring All to Front', role: 'front' }
        ]
      }
    ];
    
    return Menu.buildFromTemplate(template);
  }
}
```

**Rationale**: Native macOS menu experience

---

### 10. System Tray Menu Builder
**Purpose**: Build system tray context menu
**Type**: Desktop Integration Layer

```typescript
class SystemTrayMenuBuilder {
  buildMenu(data: TrayData): Menu {
    const template: MenuItemConstructorOptions[] = [
      { label: `Today: $${data.todayTotal.toFixed(2)}`, enabled: false },
      { label: `Transactions: ${data.transactionCount}`, enabled: false },
      { type: 'separator' },
      { label: 'Show Window', click: () => this.showWindow() },
      { label: 'Quick Add Transaction', click: () => this.quickAdd() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ];
    
    return Menu.buildFromTemplate(template);
  }
}
```

**Rationale**: Quick access to app features from tray

---

## Build and Packaging Components

### 11. Vite Configuration
**Purpose**: Configure Vite for Electron renderer process
**Type**: Build Configuration

```typescript
// vite.renderer.config.ts
export default defineConfig({
  root: './src/renderer',
  build: {
    outDir: '../../dist/renderer',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'form-vendor': ['react-hook-form']
        }
      }
    }
  },
  plugins: [react()]
});

// vite.main.config.ts
export default defineConfig({
  root: './src/main',
  build: {
    outDir: '../../dist/main',
    lib: {
      entry: 'index.ts',
      formats: ['cjs']
    },
    minify: 'esbuild',
    sourcemap: false
  }
});
```

**Rationale**: Optimized builds for main and renderer processes

---

### 12. Electron Builder Configuration
**Purpose**: Configure electron-builder for packaging
**Type**: Build Configuration

```yaml
# electron-builder.yml
appId: com.cashlog.app
productName: Cash Log
directories:
  output: release
  buildResources: build
files:
  - dist/**/*
  - package.json
mac:
  target:
    - target: pkg
      arch:
        - universal
  category: public.app-category.finance
  icon: build/icon.icns
  minimumSystemVersion: "11.0"
pkg:
  installLocation: /Applications
```

**Rationale**: Universal binary PKG installer for macOS

---

## Logging Components

### 13. Logger Utility
**Purpose**: Simple console logging
**Type**: Logging Layer

```typescript
const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${new Date().toISOString()} ${message}`, ...args);
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, error);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} ${message}`, ...args);
    }
  }
};
```

**Rationale**: Simple and sufficient for personal use

---

## Component Summary

| Component | Type | Purpose |
|-----------|------|---------|
| IPC Channel Registry | Configuration | Type-safe IPC channels |
| Context Bridge API | Security | Secure IPC interface |
| Electron Store | Storage | Persist preferences |
| Tray Data Sync | State Sync | Update system tray |
| Error Boundary | Error Handling | Catch React errors |
| API Retry Interceptor | Resilience | Retry failed requests |
| Code Splitting Loader | Performance | Lazy load pages |
| Memory Cleanup Manager | Performance | Clean up on idle |
| Native Menu Builder | Desktop Integration | macOS menu |
| System Tray Menu Builder | Desktop Integration | Tray menu |
| Vite Configuration | Build | Optimized builds |
| Electron Builder Config | Packaging | PKG installer |
| Logger Utility | Logging | Console logging |

**Total Logical Components**: 13 infrastructure components supporting NFR requirements
