# Application Components

## Component Overview

The Electron desktop application consists of two main process types with distinct component responsibilities:

### Main Process Components
Components running in the Electron main process, handling native OS integrations.

### Renderer Process Components
Components running in the browser context, handling UI and user interactions.

---

## Main Process Components

### 1. Application Manager
**Purpose**: Core application lifecycle and window management

**Responsibilities**:
- Initialize Electron application
- Create and manage main application window
- Handle application lifecycle events (ready, quit, activate)
- Manage window state (minimize, maximize, close)

**Interfaces**:
- `createWindow()`: Create main application window
- `handleWindowEvents()`: Handle window lifecycle events
- `quit()`: Clean shutdown of application

---

### 2. System Tray Manager
**Purpose**: Manage system tray icon and menu

**Responsibilities**:
- Create and update system tray icon
- Build and manage tray context menu
- Handle tray menu item clicks
- Show/hide main window from tray

**Interfaces**:
- `createTray()`: Initialize system tray
- `updateTrayMenu()`: Update menu items dynamically
- `handleTrayClick()`: Handle tray icon clicks
- `showQuickAddTransaction()`: Open quick add dialog

---

### 3. Native Menu Manager
**Purpose**: Manage macOS native menu bar

**Responsibilities**:
- Build application menu structure
- Handle menu item actions
- Update menu state based on application state

**Interfaces**:
- `createMenu()`: Build native menu
- `updateMenuState()`: Enable/disable menu items
- `handleMenuAction()`: Process menu selections

---

### 4. Notification Manager
**Purpose**: Handle native desktop notifications

**Responsibilities**:
- Send native notifications
- Handle notification clicks
- Manage notification permissions

**Interfaces**:
- `sendNotification(title, body, options)`: Display notification
- `handleNotificationClick()`: Process notification interactions

---

### 5. File System Manager
**Purpose**: Handle file operations via IPC

**Responsibilities**:
- Show native file dialogs (save/open)
- Write files to disk (CSV, Excel, PDF)
- Read files from disk (import)
- Manage file permissions

**Interfaces**:
- `showSaveDialog(options)`: Show save file dialog
- `showOpenDialog(options)`: Show open file dialog
- `writeFile(path, data)`: Write file to disk
- `readFile(path)`: Read file from disk

---

### 6. IPC Handler
**Purpose**: Coordinate inter-process communication

**Responsibilities**:
- Register IPC handlers for renderer requests
- Route messages between main and renderer
- Handle async IPC operations
- Manage IPC security

**Interfaces**:
- `registerHandlers()`: Register all IPC handlers
- `handleFileOperation(operation, data)`: Process file requests
- `handleNotification(data)`: Process notification requests
- `handleWindowAction(action)`: Process window control requests

---

### 7. State Sync Manager
**Purpose**: Synchronize minimal state between main and renderer

**Responsibilities**:
- Sync system tray display data
- Sync notification data
- Broadcast state updates to renderer

**Interfaces**:
- `syncTrayData(data)`: Update tray with latest data
- `broadcastUpdate(event, data)`: Send updates to renderer

---

## Renderer Process Components

### 8. App Shell
**Purpose**: Root application component and layout

**Responsibilities**:
- Render main application layout
- Manage navigation state
- Coordinate component rendering
- Handle global state initialization

**Interfaces**:
- `render()`: Render application shell
- `navigate(route)`: Handle navigation
- `initializeStores()`: Initialize Zustand stores

---

### 9. Navigation Manager
**Purpose**: Handle client-side routing without Next.js

**Responsibilities**:
- Manage current view/route state
- Render appropriate page component
- Handle navigation transitions

**Interfaces**:
- `setCurrentView(view)`: Change active view
- `getCurrentView()`: Get current view
- `renderView()`: Render current view component

---

### 10. Reused UI Components
**Purpose**: Existing React components from web app

**Components** (reused from apps/frontend/components/):
- **Layout Components**: Header, Sidebar (adapted for desktop)
- **Form Components**: TransactionFormModal, CategoryFormModal, BudgetFormModal, TagFormModal
- **UI Components**: Button, Input, Card, DateRangePicker, Spinner
- **Dashboard Components**: TransactionCalendar
- **Modals**: ExportDialog, ConfirmDialog

**Adaptation Strategy**:
- Use components as-is where possible
- Modify components that need desktop-specific features (file dialogs, notifications)
- Remove Next.js-specific imports (next/link, next/image)

---

### 11. Desktop-Adapted Components
**Purpose**: Modified components with desktop-specific features

**Components**:
- **ExportDialog (Modified)**: Use IPC for native file dialogs instead of browser download
- **Header (Modified)**: Add window controls (minimize, maximize, close)
- **TransactionFormModal (Modified)**: Use native notifications on save

---

### 12. Page Components
**Purpose**: Main application views

**Components**:
- **DashboardPage**: Overview with calendar and summary
- **TransactionsPage**: Transaction list with filters
- **BudgetsPage**: Budget management
- **AnalyticsPage**: Charts and analytics
- **SettingsPage**: Application settings

**Adaptation Strategy**:
- Remove Next.js page routing
- Convert to regular React components
- Render conditionally based on navigation state

---

### 13. API Client Service
**Purpose**: Communicate with Spring Boot backend (reused)

**Responsibilities**:
- Make HTTP requests to backend API
- Handle authentication (none for single-user app)
- Handle errors and retries
- Manage API base URL configuration

**Interfaces**:
- Reuse existing API client from apps/frontend/lib/api/client.ts
- Reuse existing API modules (transactions.ts, budgets.ts, tags.ts, etc.)

---

### 14. IPC Bridge Service
**Purpose**: Communicate with main process via IPC

**Responsibilities**:
- Expose IPC APIs to React components
- Handle async IPC calls
- Manage IPC errors

**Interfaces**:
- `fileSystem.saveFile(data, format)`: Request file save
- `fileSystem.openFile()`: Request file open
- `notifications.send(title, body)`: Request notification
- `window.minimize()`: Minimize window
- `window.maximize()`: Maximize window
- `window.close()`: Close window

---

### 15. Store Components (Zustand)
**Purpose**: Client-side state management (reused)

**Stores** (reused from apps/frontend/lib/stores/):
- **transactionStore**: Transaction data and operations
- **budgetStore**: Budget data and operations
- **tagStore**: Tag data and operations
- **categoryStore**: Category data and operations
- **sessionStore**: Session preferences (theme, language)
- **uiStore**: UI state (modals, loading)

**Adaptation Strategy**:
- Keep stores in renderer process
- Add minimal state sync for system tray data
- No changes to store structure

---

## Component Count Summary

**Main Process**: 7 components
- Application Manager
- System Tray Manager
- Native Menu Manager
- Notification Manager
- File System Manager
- IPC Handler
- State Sync Manager

**Renderer Process**: 8 component groups
- App Shell
- Navigation Manager
- Reused UI Components (10+ components)
- Desktop-Adapted Components (3 components)
- Page Components (5 components)
- API Client Service
- IPC Bridge Service
- Store Components (6 stores)

**Total**: 15 major component groups with 20+ individual components
