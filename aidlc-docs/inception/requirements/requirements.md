# Requirements Document - Electron Desktop App Migration

## Intent Analysis

### User Request
Migrate the existing Next.js-based frontend to an Electron-based desktop application.

### Request Type
**Migration** - Technology stack change from web (Next.js) to desktop (Electron)

### Scope Estimate
**System-wide** - Complete frontend transformation affecting all UI components and application structure

### Complexity Estimate
**Complex** - Significant architectural changes, framework migration, desktop-specific features

---

## Functional Requirements

### FR1: Desktop Application Framework
- **Description**: Transform apps/frontend from Next.js web app to Electron desktop app
- **Details**:
  - Remove Next.js framework completely
  - Rebuild with React + Electron architecture
  - Reuse existing React components where applicable
  - Rebuild routing and application structure for desktop
- **Priority**: High

### FR2: Backend Communication
- **Description**: Maintain API communication with existing Spring Boot backend
- **Details**:
  - Direct API calls to Spring Boot backend (same as current web app)
  - Reuse existing API client logic from apps/frontend/lib/api/
  - Always-online mode (require backend connection)
  - No local database or offline capabilities
- **Priority**: High

### FR3: Component Reuse Strategy
- **Description**: Reuse existing React components with desktop adaptations
- **Details**:
  - Reuse UI components from apps/frontend/components/
  - Reuse Zustand stores from apps/frontend/lib/stores/
  - Reuse type definitions from apps/frontend/types/
  - Rebuild routing structure (remove Next.js App Router)
  - Adapt components for desktop window management
- **Priority**: High

### FR4: Desktop-Specific Features
- **Description**: Implement native desktop functionality
- **Details**:
  - System tray integration for quick access
  - Native desktop notifications
  - File system access for import/export (CSV, Excel, PDF)
  - Native file dialogs for save/open operations
  - Menu bar integration (macOS native menus)
- **Priority**: Medium

### FR5: Single-User Desktop App
- **Description**: Local-only authentication model
- **Details**:
  - No login/authentication required
  - Single-user desktop application
  - Remove authentication UI components
  - Direct access to all features on app launch
- **Priority**: High

### FR6: Core Feature Parity
- **Description**: Maintain all existing features from web app
- **Details**:
  - Transaction management (CRUD operations)
  - Budget tracking and management
  - Tag system for categorization
  - Analytics dashboard with charts
  - Settings (theme, language preferences)
  - Data export (CSV, Excel, PDF)
- **Priority**: High

---

## Non-Functional Requirements

### NFR1: Platform Support
- **Description**: macOS-only desktop application
- **Details**:
  - Target platform: macOS (Intel + Apple Silicon)
  - Minimum macOS version: 11.0 (Big Sur)
  - Native macOS UI patterns and behaviors
  - **Note**: Windows and Linux support explicitly excluded
- **Priority**: High

### NFR2: Distribution Method
- **Description**: Direct download distribution for personal use
- **Details**:
  - DMG installer for macOS
  - No app store distribution
  - No auto-update mechanism required
  - Personal use only (not for public distribution)
- **Priority**: Medium

### NFR3: Performance
- **Description**: Desktop-optimized performance
- **Details**:
  - Fast application startup (< 3 seconds)
  - Smooth UI interactions (60 FPS)
  - Efficient memory usage (< 200MB idle)
  - Quick backend API response handling
- **Priority**: Medium

### NFR4: Development Workflow
- **Description**: Replace existing frontend project structure
- **Details**:
  - Transform apps/frontend into desktop-only app
  - Remove Next.js dependencies completely
  - Add Electron dependencies and configuration
  - Maintain existing backend (apps/backend) unchanged
  - Update build scripts for Electron packaging
- **Priority**: High

### NFR5: Testing Strategy
- **Description**: Unit testing with Jest
- **Details**:
  - Same testing approach as current web app
  - Jest for unit tests
  - React Testing Library for component tests
  - No E2E testing required initially
- **Priority**: Medium

---

## Technical Constraints

### TC1: Technology Stack
- **Frontend Framework**: React 18 (remove Next.js)
- **Desktop Framework**: Electron (latest stable)
- **State Management**: Zustand (existing)
- **Styling**: Tailwind CSS (existing)
- **Build Tool**: Webpack or Vite (for Electron)
- **Backend**: Spring Boot (unchanged)
- **Database**: MySQL (unchanged)

### TC2: Architecture Constraints
- **No web version**: Complete replacement, no parallel web deployment
- **No offline mode**: Always require backend connection
- **No authentication**: Single-user local app
- **macOS only**: No cross-platform support needed

### TC3: Code Reuse Boundaries
- **Reuse**: React components, Zustand stores, types, API clients, utilities
- **Rebuild**: Routing, app structure, entry points, build configuration
- **Remove**: Next.js-specific code (App Router, server components, SSR)

---

## User Scenarios

### US1: Application Launch
1. User double-clicks app icon
2. App launches without login screen
3. Main dashboard appears immediately
4. System tray icon appears

### US2: Transaction Management
1. User clicks "Add Transaction" button
2. Transaction form modal opens
3. User fills in transaction details
4. User clicks "Save"
5. API call to backend saves transaction
6. Transaction list updates
7. Desktop notification confirms save

### US3: Data Export
1. User navigates to Transactions page
2. User clicks "Export" button
3. Native file dialog opens
4. User selects save location and format (CSV/Excel/PDF)
5. File is saved to selected location
6. Desktop notification confirms export

### US4: System Tray Interaction
1. User clicks system tray icon
2. Quick menu appears with options:
   - Show/Hide main window
   - Quick add transaction
   - View today's summary
   - Quit application

---

## Success Criteria

1. ✅ Electron app launches successfully on macOS
2. ✅ All existing features work identically to web app
3. ✅ Desktop-specific features implemented (tray, notifications, file access)
4. ✅ No authentication required for single-user access
5. ✅ React components successfully reused from web app
6. ✅ Backend API integration works without changes
7. ✅ DMG installer can be built and distributed
8. ✅ App performs smoothly on macOS (< 3s startup, 60 FPS UI)

---

## Out of Scope

- ❌ Web version maintenance (complete replacement)
- ❌ Windows and Linux support
- ❌ App store distribution
- ❌ Auto-update mechanism
- ❌ Offline mode / local database
- ❌ Multi-user authentication
- ❌ Cloud sync features
- ❌ Mobile app versions
