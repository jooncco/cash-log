# Code Generation Plan - Electron Desktop App

## Unit Context

**Unit Name**: Electron Desktop App (Complete Frontend Transformation)

**Scope**: Transform Next.js web app to Electron desktop app

**Stories Implemented**: All functional requirements from requirements.md
- FR1: Desktop Application Framework
- FR2: Backend Communication
- FR3: Component Reuse Strategy
- FR4: Desktop-Specific Features
- FR5: Single-User Desktop App
- FR6: Core Feature Parity

**Dependencies**:
- Existing backend API (apps/backend) - unchanged
- Existing MySQL database - unchanged

**Code Location**: apps/frontend (transform in-place)

---

## Generation Approach

**Strategy**: Transform existing Next.js app to Electron app
- Remove Next.js framework and dependencies
- Add Electron framework and dependencies
- Rebuild app structure for desktop
- Reuse React components, stores, API clients
- Add desktop-specific features

**File Operations**:
- **Remove**: Next.js-specific files (next.config.js, app router structure)
- **Modify**: package.json, tsconfig.json, existing React components
- **Create**: Electron main process, preload script, IPC handlers, desktop components, build configs

---

## Code Generation Steps

### Phase 1: Project Structure Setup

#### Step 1: Update package.json
- [x] Remove Next.js dependencies
- [x] Add Electron dependencies (electron, electron-builder)
- [x] Add Vite dependencies (vite, @vitejs/plugin-react)
- [x] Add export libraries (papaparse, exceljs, pdfkit)
- [x] Add electron-store for persistence
- [x] Update scripts for Electron development and build
- [x] Keep existing dependencies (React, Zustand, Axios, Tailwind, Chart.js)

**File**: `apps/frontend/package.json`

---

#### Step 2: Create Electron Main Process Entry
- [ ] Create main process entry point
- [ ] Initialize Electron app
- [ ] Create main window with security settings
- [ ] Handle app lifecycle events
- [ ] Register IPC handlers

**File**: `apps/frontend/src/main/index.ts`

---

#### Step 3: Create Preload Script
- [ ] Create preload script with contextBridge
- [ ] Expose IPC APIs (fileSystem, notifications, window, state)
- [ ] Define TypeScript interfaces for exposed APIs

**Files**:
- `apps/frontend/src/preload/index.ts`
- `apps/frontend/src/preload/types.ts`

---

#### Step 4: Create IPC Handlers
- [ ] Create IPC handler registration
- [ ] Implement file operation handlers
- [ ] Implement notification handlers
- [ ] Implement window control handlers
- [ ] Implement state sync handlers

**File**: `apps/frontend/src/main/ipc-handlers.ts`

---

### Phase 2: Main Process Services

#### Step 5: Create Window Management Service
- [ ] Implement window creation with saved state
- [ ] Implement window state persistence
- [ ] Implement show/hide/minimize/maximize/close methods

**File**: `apps/frontend/src/main/services/window-management.service.ts`

---

#### Step 6: Create File System Service
- [ ] Implement native file dialogs
- [ ] Implement CSV export
- [ ] Implement Excel export
- [ ] Implement PDF export

**File**: `apps/frontend/src/main/services/file-system.service.ts`

---

#### Step 7: Create Notification Service
- [ ] Implement native notification sending
- [ ] Implement notification click handling

**File**: `apps/frontend/src/main/services/notification.service.ts`

---

#### Step 8: Create System Tray Manager
- [ ] Create system tray with icon
- [ ] Build tray context menu
- [ ] Implement menu item handlers
- [ ] Implement tray data updates

**File**: `apps/frontend/src/main/managers/system-tray.manager.ts`

---

#### Step 9: Create Native Menu Manager
- [ ] Build macOS native menu structure
- [ ] Implement menu item handlers
- [ ] Set application menu

**File**: `apps/frontend/src/main/managers/native-menu.manager.ts`

---

### Phase 3: Renderer Process Structure

#### Step 10: Create Renderer Entry Point
- [ ] Create renderer HTML entry
- [ ] Create renderer TypeScript entry
- [ ] Initialize React app
- [ ] Mount to DOM

**Files**:
- `apps/frontend/src/renderer/index.html`
- `apps/frontend/src/renderer/index.tsx`

---

#### Step 11: Create App Shell Component
- [ ] Create root App component
- [ ] Implement navigation state management
- [ ] Render current view based on navigation
- [ ] Add error boundaries per page

**File**: `apps/frontend/src/renderer/App.tsx`

---

#### Step 12: Create Navigation Service
- [ ] Implement navigation state management
- [ ] Implement view switching
- [ ] Export navigation hooks

**File**: `apps/frontend/src/renderer/services/navigation.service.ts`

---

#### Step 13: Create IPC Bridge Service
- [ ] Create typed IPC bridge interface
- [ ] Implement fileSystem APIs
- [ ] Implement notifications APIs
- [ ] Implement window APIs
- [ ] Implement state APIs

**File**: `apps/frontend/src/renderer/services/ipc-bridge.service.ts`

---

### Phase 4: Component Adaptation

#### Step 14: Adapt Header Component
- [ ] Remove Next.js Link imports
- [ ] Add window control buttons (minimize, maximize, close)
- [ ] Use IPC bridge for window controls
- [ ] Use navigation service for routing

**File**: `apps/frontend/src/renderer/components/layout/Header.tsx` (modify existing)

---

#### Step 15: Adapt ExportDialog Component
- [ ] Remove browser download logic
- [ ] Use IPC bridge for native file dialogs
- [ ] Use IPC bridge for file save operations

**File**: `apps/frontend/src/renderer/components/modals/ExportDialog.tsx` (modify existing)

---

#### Step 16: Adapt TransactionFormModal Component
- [ ] Use IPC bridge for success notifications
- [ ] Keep existing form logic

**File**: `apps/frontend/src/renderer/components/modals/TransactionFormModal.tsx` (modify existing)

---

#### Step 17: Adapt Page Components
- [ ] Remove Next.js-specific imports
- [ ] Convert to regular React components
- [ ] Keep existing logic and UI

**Files** (modify existing):
- `apps/frontend/src/renderer/pages/DashboardPage.tsx`
- `apps/frontend/src/renderer/pages/TransactionsPage.tsx`
- `apps/frontend/src/renderer/pages/BudgetsPage.tsx`
- `apps/frontend/src/renderer/pages/AnalyticsPage.tsx`
- `apps/frontend/src/renderer/pages/SettingsPage.tsx`

---

### Phase 5: State Management

#### Step 18: Adapt Zustand Stores
- [ ] Keep existing store structure
- [ ] Add electron-store persistence for sessionStore
- [ ] No changes to other stores

**Files** (modify existing):
- `apps/frontend/src/renderer/lib/stores/sessionStore.ts`

---

#### Step 19: Keep API Client As-Is
- [ ] No changes needed to API client
- [ ] Reuse existing API modules

**Files** (no changes):
- `apps/frontend/src/renderer/lib/api/client.ts`
- `apps/frontend/src/renderer/lib/api/*.ts`

---

### Phase 6: Build Configuration

#### Step 20: Create Vite Config for Renderer
- [ ] Configure Vite for renderer process
- [ ] Set up React plugin
- [ ] Configure build output
- [ ] Configure code splitting

**File**: `apps/frontend/vite.renderer.config.ts`

---

#### Step 21: Create Vite Config for Main
- [ ] Configure Vite for main process
- [ ] Set up library mode
- [ ] Configure build output

**File**: `apps/frontend/vite.main.config.ts`

---

#### Step 22: Create Vite Config for Preload
- [ ] Configure Vite for preload script
- [ ] Set up library mode
- [ ] Configure build output

**File**: `apps/frontend/vite.preload.config.ts`

---

#### Step 23: Create Electron Builder Config
- [ ] Configure electron-builder
- [ ] Set up macOS PKG target
- [ ] Configure Universal binary
- [ ] Set app metadata

**File**: `apps/frontend/electron-builder.yml`

---

#### Step 24: Update TypeScript Config
- [ ] Update paths for new structure
- [ ] Add Electron types
- [ ] Configure for main and renderer

**File**: `apps/frontend/tsconfig.json` (modify existing)

---

### Phase 7: Environment and Assets

#### Step 25: Create Environment Config
- [ ] Create .env.example with API URL
- [ ] Document environment variables

**File**: `apps/frontend/.env.example` (modify existing)

---

#### Step 26: Create App Icons
- [ ] Create macOS app icon (icns)
- [ ] Create tray icon (png)

**Files**:
- `apps/frontend/build/icon.icns`
- `apps/frontend/build/tray-icon.png`

---

### Phase 8: Cleanup

#### Step 27: Remove Next.js Files
- [ ] Remove next.config.js
- [ ] Remove app directory structure
- [ ] Remove Next.js-specific files

**Files to remove**:
- `apps/frontend/next.config.js`
- `apps/frontend/app/` directory
- `apps/frontend/next-env.d.ts`

---

### Phase 9: Documentation

#### Step 28: Create Implementation Summary
- [ ] Document all files created
- [ ] Document all files modified
- [ ] Document all files removed
- [ ] Document project structure
- [ ] Document build and run instructions

**File**: `aidlc-docs/construction/electron-app/code/implementation-summary.md`

---

#### Step 29: Update README
- [ ] Update README with Electron instructions
- [ ] Document development workflow
- [ ] Document build process
- [ ] Document distribution

**File**: `apps/frontend/README.md` (modify existing)

---

## Step Summary

**Total Steps**: 29
**Phases**: 9
- Phase 1: Project Structure Setup (4 steps)
- Phase 2: Main Process Services (5 steps)
- Phase 3: Renderer Process Structure (4 steps)
- Phase 4: Component Adaptation (4 steps)
- Phase 5: State Management (2 steps)
- Phase 6: Build Configuration (5 steps)
- Phase 7: Environment and Assets (2 steps)
- Phase 8: Cleanup (1 step)
- Phase 9: Documentation (2 steps)

**File Operations**:
- Create: ~20 new files
- Modify: ~15 existing files
- Remove: ~5 Next.js files

**Code Location**: All application code in `apps/frontend/`, documentation in `aidlc-docs/construction/electron-app/code/`
