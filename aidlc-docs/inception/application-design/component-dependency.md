# Component Dependencies

## Dependency Overview

This document maps the dependencies and communication patterns between components in the Electron desktop application.

---

## Main Process Component Dependencies

### Dependency Graph

```
Application Manager
    ├─ depends on: Window Management Service
    └─ creates: Main Window

System Tray Manager
    ├─ depends on: Window Management Service
    ├─ depends on: State Sync Service
    └─ communicates with: Main Window (via Window Management Service)

Native Menu Manager
    ├─ depends on: Window Management Service
    └─ communicates with: Main Window (via Window Management Service)

Notification Manager
    ├─ depends on: Notification Service
    └─ communicates with: Main Window (focus on click)

File System Manager
    ├─ depends on: File System Service
    └─ communicates with: Renderer (via IPC)

IPC Handler
    ├─ depends on: IPC Coordination Service
    ├─ depends on: Window Management Service
    ├─ depends on: Notification Service
    ├─ depends on: File System Service
    ├─ depends on: State Sync Service
    └─ communicates with: Renderer Process (bidirectional)

State Sync Manager
    ├─ depends on: State Sync Service
    ├─ communicates with: System Tray Manager
    └─ communicates with: Renderer Process (via IPC)
```

---

## Renderer Process Component Dependencies

### Dependency Graph

```
App Shell
    ├─ depends on: Navigation Service
    ├─ depends on: Store Orchestration Service
    ├─ depends on: IPC Bridge Service
    ├─ contains: Header
    ├─ contains: Sidebar (if applicable)
    └─ renders: Current Page Component

Navigation Manager
    ├─ depends on: Navigation Service
    └─ used by: App Shell

Header (Modified)
    ├─ depends on: IPC Bridge Service (window controls)
    ├─ depends on: Navigation Service
    └─ used by: App Shell

Page Components (Dashboard, Transactions, Budgets, Analytics, Settings)
    ├─ depend on: API Client Service
    ├─ depend on: Navigation Service
    ├─ depend on: Zustand Stores
    ├─ depend on: IPC Bridge Service (for notifications, file operations)
    └─ contain: UI Components and Modals

UI Components (Button, Input, Card, etc.)
    └─ used by: Page Components, Modals

Form Modals (TransactionFormModal, BudgetFormModal, etc.)
    ├─ depend on: Zustand Stores
    ├─ depend on: API Client Service
    ├─ depend on: IPC Bridge Service (notifications)
    └─ used by: Page Components

ExportDialog (Modified)
    ├─ depends on: IPC Bridge Service (file operations)
    └─ used by: Transactions Page, Budgets Page

Zustand Stores
    ├─ depend on: API Client Service
    └─ used by: Page Components, Modals

IPC Bridge Service
    ├─ communicates with: Main Process (via IPC)
    └─ used by: Header, Page Components, Modals
```

---

## Inter-Process Communication Patterns

### Main → Renderer Communication

**Pattern**: Event Broadcasting

```
Main Process Component
    ↓
State Sync Service
    ↓
IPC Handler (webContents.send)
    ↓
Renderer Process (window.electron.on)
    ↓
React Component Updates
```

**Use Cases**:
- Tray data updates
- Background notifications
- Window state changes

---

### Renderer → Main Communication

**Pattern**: Invoke/Handle

```
React Component
    ↓
IPC Bridge Service (window.electron.invoke)
    ↓
IPC Handler (ipcMain.handle)
    ↓
IPC Coordination Service
    ↓
Specific Service (Window/Notification/FileSystem)
    ↓
Response back to Renderer
```

**Use Cases**:
- File operations (save, open, export)
- Window controls (minimize, maximize, close)
- Notifications
- State sync requests

---

## Component Communication Matrix

### Main Process Components

| Component | Depends On | Communicates With |
|-----------|-----------|-------------------|
| Application Manager | Window Management Service | Main Window |
| System Tray Manager | Window Management Service, State Sync Service | Main Window, Renderer |
| Native Menu Manager | Window Management Service | Main Window |
| Notification Manager | Notification Service | Main Window |
| File System Manager | File System Service | Renderer (IPC) |
| IPC Handler | All Services | Renderer (IPC) |
| State Sync Manager | State Sync Service | System Tray, Renderer |

---

### Renderer Process Components

| Component | Depends On | Communicates With |
|-----------|-----------|-------------------|
| App Shell | Navigation Service, Store Orchestration Service | All Page Components |
| Navigation Manager | Navigation Service | App Shell |
| Header | IPC Bridge Service, Navigation Service | App Shell, Main Process |
| Page Components | API Client, Navigation, Stores, IPC Bridge | Backend API, Main Process |
| Form Modals | Stores, API Client, IPC Bridge | Backend API, Main Process |
| ExportDialog | IPC Bridge Service | Main Process |
| Zustand Stores | API Client Service | Backend API |
| IPC Bridge Service | - | Main Process |

---

## Data Flow Diagrams

### Transaction Creation Flow

```
User fills form in TransactionFormModal
    ↓
Modal calls transactionStore.addTransaction()
    ↓
Store calls API Client Service
    ↓
API Client makes HTTP POST to Backend
    ↓
Backend saves to MySQL
    ↓
Backend returns Transaction
    ↓
Store updates state
    ↓
Modal calls IPC Bridge Service.notifications.send()
    ↓
IPC Bridge invokes Main Process
    ↓
Notification Service sends native notification
    ↓
User sees notification
```

---

### File Export Flow

```
User clicks Export in TransactionsPage
    ↓
ExportDialog opens
    ↓
User selects format (CSV/Excel/PDF)
    ↓
ExportDialog calls IPC Bridge Service.fileSystem.saveFile()
    ↓
IPC Bridge invokes Main Process
    ↓
File System Service shows native save dialog
    ↓
User selects save location
    ↓
File System Service writes file
    ↓
Response returns to Renderer
    ↓
ExportDialog shows success message
    ↓
IPC Bridge Service.notifications.send()
    ↓
User sees notification
```

---

### System Tray Update Flow

```
Transaction created in Renderer
    ↓
Store updates transaction list
    ↓
Component calls IPC Bridge Service.state.updateTrayData()
    ↓
IPC Bridge invokes Main Process
    ↓
State Sync Service updates tray data
    ↓
System Tray Manager updates tray menu
    ↓
User sees updated tray menu
```

---

## Dependency Rules

### Main Process Rules

1. **Services are shared**: All managers use shared services
2. **No direct renderer access**: All renderer communication via IPC Handler
3. **Single window instance**: Window Management Service ensures single main window
4. **State sync is minimal**: Only tray data synced to main process

---

### Renderer Process Rules

1. **No direct main process access**: All main process communication via IPC Bridge Service
2. **Stores are renderer-only**: Zustand stores live in renderer, no main process stores
3. **API calls from renderer**: All backend API calls from renderer process
4. **Component reuse maximized**: Reuse existing React components where possible

---

## Security Boundaries

### Context Isolation

```
Main Process (Node.js APIs)
    ↕ (IPC with contextBridge)
Preload Script (exposes safe APIs)
    ↕ (window.electron)
Renderer Process (web content)
```

**Exposed APIs** (via preload script):
- `window.electron.fileSystem.*`
- `window.electron.notifications.*`
- `window.electron.window.*`
- `window.electron.state.*`

**Not Exposed**:
- Direct Node.js APIs
- Direct file system access
- Direct process control

---

## Circular Dependency Prevention

### Rules

1. **Services don't depend on managers**: Services are low-level, managers are high-level
2. **Managers don't depend on each other**: Managers coordinate via services
3. **Components don't depend on services directly**: Components use service interfaces
4. **Stores don't depend on components**: Stores are independent state containers

---

## Component Coupling Summary

### Tight Coupling (Acceptable)

- Page Components ↔ Zustand Stores
- Modals ↔ Zustand Stores
- Managers ↔ Services (main process)
- Components ↔ IPC Bridge Service

### Loose Coupling (Desired)

- Main Process ↔ Renderer Process (via IPC)
- Components ↔ API Client (via stores)
- Managers ↔ Managers (via services)

---

## Total Dependencies

**Main Process**: 7 components, 5 services, ~20 dependencies
**Renderer Process**: 8 component groups, 4 services, ~30 dependencies
**Cross-Process**: 2 IPC channels (invoke/handle, event broadcasting)

**Total**: 50+ dependency relationships managed through clear interfaces and services
