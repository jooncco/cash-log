# Component Methods

## Main Process Component Methods

### Application Manager

```typescript
class ApplicationManager {
  createWindow(): BrowserWindow
  handleWindowEvents(window: BrowserWindow): void
  handleActivate(): void
  handleWindowAllClosed(): void
  quit(): void
}
```

**Method Details**:
- `createWindow()`: Creates main BrowserWindow with configuration (size, title, webPreferences)
- `handleWindowEvents()`: Registers window event listeners (close, minimize, maximize)
- `handleActivate()`: Handles macOS activate event (recreate window if none exist)
- `handleWindowAllClosed()`: Handles all windows closed (quit on non-macOS)
- `quit()`: Performs clean shutdown

---

### System Tray Manager

```typescript
class SystemTrayManager {
  createTray(): Tray
  updateTrayMenu(data: TrayData): void
  handleTrayClick(): void
  handleShowWindow(): void
  handleHideWindow(): void
  handleQuickAdd(): void
  handleQuit(): void
}
```

**Method Details**:
- `createTray()`: Creates system tray icon with initial menu
- `updateTrayMenu(data)`: Updates menu with latest transaction summary
- `handleTrayClick()`: Shows/hides main window on tray click
- `handleShowWindow()`: Shows and focuses main window
- `handleHideWindow()`: Hides main window
- `handleQuickAdd()`: Opens quick add transaction dialog
- `handleQuit()`: Quits application

---

### Native Menu Manager

```typescript
class NativeMenuManager {
  createMenu(): Menu
  updateMenuState(state: MenuState): void
  handleMenuAction(action: string): void
}
```

**Method Details**:
- `createMenu()`: Builds macOS native menu structure (App, File, Edit, View, Window, Help)
- `updateMenuState(state)`: Enables/disables menu items based on app state
- `handleMenuAction(action)`: Routes menu selections to appropriate handlers

---

### Notification Manager

```typescript
class NotificationManager {
  sendNotification(title: string, body: string, options?: NotificationOptions): void
  handleNotificationClick(notificationId: string): void
  checkPermissions(): boolean
}
```

**Method Details**:
- `sendNotification()`: Displays native desktop notification
- `handleNotificationClick()`: Handles user clicking notification (focus window, navigate)
- `checkPermissions()`: Verifies notification permissions

---

### File System Manager

```typescript
class FileSystemManager {
  showSaveDialog(options: SaveDialogOptions): Promise<string | null>
  showOpenDialog(options: OpenDialogOptions): Promise<string[] | null>
  writeFile(path: string, data: Buffer | string): Promise<void>
  readFile(path: string): Promise<Buffer>
  exportCSV(path: string, data: any[]): Promise<void>
  exportExcel(path: string, data: any[]): Promise<void>
  exportPDF(path: string, data: any[]): Promise<void>
}
```

**Method Details**:
- `showSaveDialog()`: Shows native save file dialog, returns selected path
- `showOpenDialog()`: Shows native open file dialog, returns selected paths
- `writeFile()`: Writes data to file at specified path
- `readFile()`: Reads file from specified path
- `exportCSV()`: Exports data to CSV format
- `exportExcel()`: Exports data to Excel format
- `exportPDF()`: Exports data to PDF format

---

### IPC Handler

```typescript
class IPCHandler {
  registerHandlers(): void
  handleFileOperation(event: IpcMainInvokeEvent, operation: FileOperation): Promise<any>
  handleNotification(event: IpcMainInvokeEvent, data: NotificationData): void
  handleWindowAction(event: IpcMainInvokeEvent, action: WindowAction): void
  handleStateSyncRequest(event: IpcMainInvokeEvent): TrayData
}
```

**Method Details**:
- `registerHandlers()`: Registers all IPC invoke handlers
- `handleFileOperation()`: Routes file operations (save, open, export)
- `handleNotification()`: Sends desktop notification
- `handleWindowAction()`: Handles window controls (minimize, maximize, close)
- `handleStateSyncRequest()`: Returns current tray data for sync

---

### State Sync Manager

```typescript
class StateSyncManager {
  syncTrayData(data: TrayData): void
  broadcastUpdate(event: string, data: any): void
  getTrayData(): TrayData
}
```

**Method Details**:
- `syncTrayData()`: Updates tray menu with latest data
- `broadcastUpdate()`: Sends state updates to all renderer windows
- `getTrayData()`: Returns current tray display data

---

## Renderer Process Component Methods

### App Shell

```typescript
function AppShell(): JSX.Element
function initializeStores(): void
function handleNavigation(view: string): void
```

**Method Details**:
- `AppShell()`: Root component rendering layout and current view
- `initializeStores()`: Initializes all Zustand stores on app start
- `handleNavigation()`: Updates navigation state and renders new view

---

### Navigation Manager

```typescript
class NavigationManager {
  setCurrentView(view: ViewType): void
  getCurrentView(): ViewType
  renderView(): JSX.Element
  navigateTo(view: ViewType): void
}
```

**Method Details**:
- `setCurrentView()`: Updates current view state
- `getCurrentView()`: Returns current active view
- `renderView()`: Renders component for current view
- `navigateTo()`: Navigates to specified view

---

### IPC Bridge Service

```typescript
interface IPCBridge {
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
  }
}
```

**Method Details**:
- `fileSystem.saveFile()`: Invokes main process file save via IPC
- `fileSystem.openFile()`: Invokes main process file open via IPC
- `notifications.send()`: Invokes main process notification via IPC
- `window.minimize/maximize/close()`: Invokes window actions via IPC
- `state.getTrayData()`: Requests tray data from main process

---

### Desktop-Adapted Components

#### ExportDialog (Modified)

```typescript
function ExportDialog(props: ExportDialogProps): JSX.Element
async function handleExport(format: 'csv' | 'excel' | 'pdf'): Promise<void>
```

**Method Details**:
- `ExportDialog()`: Renders export dialog with format selection
- `handleExport()`: Uses IPC bridge to save file via native dialog

---

#### Header (Modified)

```typescript
function Header(props: HeaderProps): JSX.Element
function handleMinimize(): void
function handleMaximize(): void
function handleClose(): void
```

**Method Details**:
- `Header()`: Renders header with window controls
- `handleMinimize/Maximize/Close()`: Uses IPC bridge for window actions

---

#### TransactionFormModal (Modified)

```typescript
function TransactionFormModal(props: TransactionFormModalProps): JSX.Element
async function handleSave(data: TransactionData): Promise<void>
function showSuccessNotification(): void
```

**Method Details**:
- `TransactionFormModal()`: Renders transaction form
- `handleSave()`: Saves transaction and triggers notification
- `showSuccessNotification()`: Uses IPC bridge to show native notification

---

### Page Components

All page components follow similar pattern:

```typescript
function DashboardPage(): JSX.Element
function TransactionsPage(): JSX.Element
function BudgetsPage(): JSX.Element
function AnalyticsPage(): JSX.Element
function SettingsPage(): JSX.Element
```

**Method Details**:
- Each page component renders its view
- Uses existing Zustand stores for state
- Uses existing API client for backend calls
- No Next.js-specific code

---

### API Client Service (Reused)

```typescript
// Reused from apps/frontend/lib/api/
interface APIClient {
  transactions: {
    getAll(filters?: TransactionFilters): Promise<Transaction[]>
    create(data: TransactionData): Promise<Transaction>
    update(id: string, data: TransactionData): Promise<Transaction>
    delete(id: string): Promise<void>
  }
  budgets: {
    getAll(): Promise<Budget[]>
    create(data: BudgetData): Promise<Budget>
    update(id: string, data: BudgetData): Promise<Budget>
    delete(id: string): Promise<void>
  }
  tags: {
    getAll(): Promise<Tag[]>
    create(data: TagData): Promise<Tag>
    update(id: string, data: TagData): Promise<Tag>
    delete(id: string): Promise<void>
  }
  categories: {
    getAll(): Promise<Category[]>
    create(data: CategoryData): Promise<Category>
    update(id: string, data: CategoryData): Promise<Category>
    delete(id: string): Promise<void>
  }
  analytics: {
    getMonthlyTrend(): Promise<MonthlyTrend[]>
    getCategoryBreakdown(): Promise<CategoryBreakdown[]>
  }
}
```

**Note**: All API client methods reused as-is from existing web app

---

### Store Components (Zustand - Reused)

```typescript
// Reused from apps/frontend/lib/stores/
interface TransactionStore {
  transactions: Transaction[]
  addTransaction(data: TransactionData): Promise<void>
  updateTransaction(id: string, data: TransactionData): Promise<void>
  deleteTransaction(id: string): Promise<void>
  fetchTransactions(filters?: TransactionFilters): Promise<void>
}

interface BudgetStore {
  budgets: Budget[]
  addBudget(data: BudgetData): Promise<void>
  updateBudget(id: string, data: BudgetData): Promise<void>
  deleteBudget(id: string): Promise<void>
  fetchBudgets(): Promise<void>
}

interface TagStore {
  tags: Tag[]
  addTag(data: TagData): Promise<void>
  updateTag(id: string, data: TagData): Promise<void>
  deleteTag(id: string): Promise<void>
  fetchTags(): Promise<void>
}

interface CategoryStore {
  categories: Category[]
  addCategory(data: CategoryData): Promise<void>
  updateCategory(id: string, data: CategoryData): Promise<void>
  deleteCategory(id: string): Promise<void>
  fetchCategories(): Promise<void>
}

interface SessionStore {
  theme: 'light' | 'dark'
  language: 'en' | 'ko'
  setTheme(theme: 'light' | 'dark'): void
  setLanguage(language: 'en' | 'ko'): void
}

interface UIStore {
  isModalOpen: boolean
  isLoading: boolean
  openModal(modalType: string): void
  closeModal(): void
  setLoading(loading: boolean): void
}
```

**Note**: All store interfaces reused as-is from existing web app

---

## Method Summary

**Main Process**: 7 components with 35+ methods
**Renderer Process**: 8 component groups with 50+ methods (including reused components)
**Total**: 85+ methods across all components

**Note**: Detailed business rules and implementation logic will be defined in Functional Design phase (if executed) or during Code Generation.
