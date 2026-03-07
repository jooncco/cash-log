# Services

## Service Overview

Services provide cross-cutting functionality and orchestration between components. The Electron desktop app uses services in both main and renderer processes.

---

## Main Process Services

### 1. Window Management Service

**Purpose**: Centralized window lifecycle management

**Responsibilities**:
- Create and configure application windows
- Track window state and instances
- Handle window events and lifecycle
- Coordinate window actions across components

**Service Interface**:
```typescript
class WindowManagementService {
  private mainWindow: BrowserWindow | null
  
  createMainWindow(): BrowserWindow
  getMainWindow(): BrowserWindow | null
  showWindow(): void
  hideWindow(): void
  minimizeWindow(): void
  maximizeWindow(): void
  closeWindow(): void
  isWindowVisible(): boolean
}
```

**Used By**:
- Application Manager (window creation)
- System Tray Manager (show/hide window)
- IPC Handler (window actions)

---

### 2. Notification Service

**Purpose**: Centralized notification management

**Responsibilities**:
- Send native desktop notifications
- Track notification state
- Handle notification interactions
- Manage notification queue

**Service Interface**:
```typescript
class NotificationService {
  send(title: string, body: string, options?: NotificationOptions): void
  handleClick(notificationId: string): void
  checkPermissions(): boolean
  private queueNotification(notification: Notification): void
}
```

**Used By**:
- IPC Handler (notification requests from renderer)
- State Sync Manager (background notifications)

---

### 3. File System Service

**Purpose**: Centralized file operations

**Responsibilities**:
- Handle file dialogs
- Read/write files
- Export data in multiple formats
- Manage file permissions and errors

**Service Interface**:
```typescript
class FileSystemService {
  showSaveDialog(options: SaveDialogOptions): Promise<string | null>
  showOpenDialog(options: OpenDialogOptions): Promise<string[] | null>
  writeFile(path: string, data: Buffer | string): Promise<void>
  readFile(path: string): Promise<Buffer>
  exportToCSV(path: string, data: any[]): Promise<void>
  exportToExcel(path: string, data: any[]): Promise<void>
  exportToPDF(path: string, data: any[]): Promise<void>
}
```

**Used By**:
- IPC Handler (file operation requests)
- File System Manager (delegates to this service)

---

### 4. IPC Coordination Service

**Purpose**: Orchestrate IPC communication patterns

**Responsibilities**:
- Register and manage IPC handlers
- Route IPC messages to appropriate services
- Handle IPC errors and timeouts
- Provide IPC security layer

**Service Interface**:
```typescript
class IPCCoordinationService {
  registerAllHandlers(): void
  routeFileOperation(operation: FileOperation): Promise<any>
  routeNotification(data: NotificationData): void
  routeWindowAction(action: WindowAction): void
  routeStateSync(): TrayData
  handleError(error: Error, context: string): void
}
```

**Used By**:
- IPC Handler (delegates routing to this service)
- All main process managers (via IPC Handler)

---

### 5. State Sync Service

**Purpose**: Synchronize minimal state between processes

**Responsibilities**:
- Maintain tray display data
- Broadcast state updates to renderer
- Handle state sync requests
- Manage state consistency

**Service Interface**:
```typescript
class StateSyncService {
  private trayData: TrayData
  
  updateTrayData(data: TrayData): void
  getTrayData(): TrayData
  broadcastToRenderer(event: string, data: any): void
  syncFromRenderer(data: Partial<TrayData>): void
}
```

**Used By**:
- State Sync Manager (delegates to this service)
- System Tray Manager (gets tray data)
- IPC Handler (state sync requests)

---

## Renderer Process Services

### 6. API Client Service (Reused)

**Purpose**: Communicate with Spring Boot backend

**Responsibilities**:
- Make HTTP requests to backend API
- Handle request/response transformation
- Manage API errors and retries
- Configure API base URL

**Service Interface**:
```typescript
class APIClientService {
  private baseURL: string
  private httpClient: AxiosInstance
  
  // Reused from apps/frontend/lib/api/client.ts
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>
}
```

**Used By**:
- All Zustand stores (transactions, budgets, tags, categories)
- Page components (direct API calls)

---

### 7. IPC Bridge Service

**Purpose**: Provide typed IPC interface to renderer components

**Responsibilities**:
- Expose IPC APIs to React components
- Handle async IPC invocations
- Manage IPC errors
- Provide type-safe IPC interface

**Service Interface**:
```typescript
class IPCBridgeService {
  fileSystem: {
    saveFile(data: any, format: 'csv' | 'excel' | 'pdf'): Promise<void>
    openFile(): Promise<string[]>
  }
  
  notifications: {
    send(title: string, body: string): void
  }
  
  window: {
    minimize(): void
    maximize(): void
    close(): void
  }
  
  state: {
    getTrayData(): Promise<TrayData>
    updateTrayData(data: Partial<TrayData>): void
  }
}
```

**Used By**:
- ExportDialog (file operations)
- Header (window controls)
- TransactionFormModal (notifications)
- All components needing IPC communication

---

### 8. Navigation Service

**Purpose**: Manage client-side routing without Next.js

**Responsibilities**:
- Track current view/route
- Handle navigation transitions
- Manage navigation history
- Provide navigation API to components

**Service Interface**:
```typescript
class NavigationService {
  private currentView: ViewType
  private history: ViewType[]
  
  navigateTo(view: ViewType): void
  goBack(): void
  getCurrentView(): ViewType
  getHistory(): ViewType[]
  canGoBack(): boolean
}
```

**Used By**:
- App Shell (renders current view)
- Navigation Manager (delegates to this service)
- All page components (navigation actions)

---

### 9. Store Orchestration Service

**Purpose**: Coordinate multiple Zustand stores

**Responsibilities**:
- Initialize all stores on app start
- Coordinate cross-store operations
- Handle store hydration
- Manage store cleanup

**Service Interface**:
```typescript
class StoreOrchestrationService {
  initializeAllStores(): Promise<void>
  resetAllStores(): void
  hydrateStores(): Promise<void>
  cleanupStores(): void
}
```

**Used By**:
- App Shell (store initialization)
- Settings page (store reset)

---

## Service Interaction Patterns

### Main Process Service Flow

```
IPC Request from Renderer
    ↓
IPC Handler
    ↓
IPC Coordination Service (routes request)
    ↓
Specific Service (Window/Notification/FileSystem)
    ↓
Service executes operation
    ↓
Response back through IPC Handler
    ↓
Renderer receives response
```

### Renderer Process Service Flow

```
User Action in Component
    ↓
Component calls Service
    ↓
Service Type Decision:
    ├─ API Client Service → Backend API
    ├─ IPC Bridge Service → Main Process
    ├─ Navigation Service → View Change
    └─ Store → State Update
    ↓
Service executes operation
    ↓
Component updates UI
```

---

## Service Dependencies

### Main Process Service Dependencies

```
Application Manager
    └─ Window Management Service

System Tray Manager
    ├─ Window Management Service
    └─ State Sync Service

IPC Handler
    ├─ IPC Coordination Service
    ├─ Window Management Service
    ├─ Notification Service
    ├─ File System Service
    └─ State Sync Service

State Sync Manager
    └─ State Sync Service
```

### Renderer Process Service Dependencies

```
App Shell
    ├─ Navigation Service
    └─ Store Orchestration Service

Page Components
    ├─ API Client Service
    ├─ Navigation Service
    └─ Zustand Stores

Desktop-Adapted Components
    ├─ IPC Bridge Service
    └─ API Client Service

Zustand Stores
    └─ API Client Service
```

---

## Service Summary

**Main Process Services**: 5
- Window Management Service
- Notification Service
- File System Service
- IPC Coordination Service
- State Sync Service

**Renderer Process Services**: 4
- API Client Service (reused)
- IPC Bridge Service
- Navigation Service
- Store Orchestration Service

**Total Services**: 9

All services provide clear separation of concerns and enable testable, maintainable code architecture.
