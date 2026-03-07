# Tech Stack Decisions - Electron Desktop App

## Core Framework

### Electron
**Decision**: Electron LTS version
**Rationale**: 
- Long-term support for stability
- Well-tested and mature
- Good balance between features and stability
**Version**: Latest LTS (e.g., Electron 28.x LTS)

---

## Build and Packaging

### Build Tool: electron-builder
**Decision**: Use electron-builder for packaging
**Rationale**:
- Popular and feature-rich
- Excellent documentation
- Wide community support
- Supports PKG format for macOS
- Easy configuration for Universal binary
**Configuration**: `electron-builder.yml`

### Bundler: Vite
**Decision**: Use Vite for renderer process bundling
**Rationale**:
- Fast development server with HMR
- Modern and better developer experience
- Native ESM support
- Excellent TypeScript support
- Smaller bundle sizes than Webpack
**Configuration**: `vite.config.ts` for renderer

### Main Process Build: esbuild (via Vite)
**Decision**: Use esbuild for main process
**Rationale**:
- Fast compilation
- Simple configuration
- Good TypeScript support
**Configuration**: Separate Vite config for main process

---

## Frontend Stack

### UI Framework: React 18
**Decision**: React 18 (reused from web app)
**Rationale**:
- Existing components can be reused
- Team familiarity
- Large ecosystem
**Version**: React 18.x

### State Management: Zustand
**Decision**: Zustand (reused from web app)
**Rationale**:
- Existing stores can be reused
- Lightweight and simple
- Good TypeScript support
**Version**: Zustand 4.x

### Styling: Tailwind CSS
**Decision**: Tailwind CSS (reused from web app)
**Rationale**:
- Existing styles can be reused
- Utility-first approach
- Good for rapid development
**Version**: Tailwind CSS 3.x

### HTTP Client: Axios
**Decision**: Axios (reused from web app)
**Rationale**:
- Existing API client can be reused
- Good error handling
- Interceptor support
**Version**: Axios 1.x

---

## Desktop Integration

### IPC Communication: Electron IPC + contextBridge
**Decision**: Use contextBridge with preload script
**Rationale**:
- Maximum security (contextIsolation: true)
- Type-safe IPC interface
- No direct Node.js access from renderer
**Pattern**: Expose minimal APIs via contextBridge

### Native Notifications: Electron Notification API
**Decision**: Use Electron's built-in Notification API
**Rationale**:
- Native macOS notifications
- Simple API
- No additional dependencies

### File System: Node.js fs + Electron dialog
**Decision**: Use Node.js fs module in main process
**Rationale**:
- Full file system access in main process
- Native file dialogs via Electron
- Secure (no renderer access)

### System Tray: Electron Tray API
**Decision**: Use Electron's built-in Tray API
**Rationale**:
- Native system tray integration
- Simple API
- Cross-platform (if needed in future)

---

## Development Tools

### Language: TypeScript
**Decision**: TypeScript for all code
**Rationale**:
- Type safety
- Better IDE support
- Catch errors at compile time
**Version**: TypeScript 5.x
**Configuration**: Strict mode enabled

### Linting: ESLint
**Decision**: ESLint with TypeScript support
**Rationale**:
- Code quality enforcement
- Consistent code style
**Configuration**: Reuse existing ESLint config from web app

### Formatting: Prettier
**Decision**: Prettier for code formatting
**Rationale**:
- Consistent formatting
- Automatic formatting on save
**Configuration**: Reuse existing Prettier config from web app

### Testing: Jest + React Testing Library
**Decision**: Jest for unit tests, React Testing Library for component tests
**Rationale**:
- Same testing approach as web app
- Good React support
- Familiar to team
**Version**: Jest 29.x, React Testing Library 14.x

---

## Data Export Libraries

### CSV Export: papaparse
**Decision**: Use papaparse for CSV generation
**Rationale**:
- Simple API
- Good TypeScript support
- Lightweight
**Version**: papaparse 5.x

### Excel Export: exceljs
**Decision**: Use exceljs for Excel generation
**Rationale**:
- Pure JavaScript (no native dependencies)
- Good feature set
- Works in Electron main process
**Version**: exceljs 4.x

### PDF Export: pdfkit
**Decision**: Use pdfkit for PDF generation
**Rationale**:
- Works in Node.js environment
- Good control over layout
- Lightweight
**Version**: pdfkit 0.13.x

---

## Configuration Management

### Environment Variables: dotenv
**Decision**: Use dotenv for environment configuration
**Rationale**:
- Simple configuration management
- Separate dev and prod configs
**Configuration**: `.env` file with `VITE_API_BASE_URL`

### Build Configuration: electron-builder.yml
**Decision**: YAML configuration for electron-builder
**Rationale**:
- Clear and readable
- Standard for electron-builder
**Configuration**: Separate configs for dev and prod

---

## Security Configuration

### Electron Security Settings
**Decision**: Maximum security configuration
**Configuration**:
```javascript
{
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  webSecurity: true,
  allowRunningInsecureContent: false
}
```
**Rationale**: Prevent security vulnerabilities

### Content Security Policy
**Decision**: Strict CSP for renderer process
**Configuration**: CSP meta tag in HTML
**Rationale**: Additional security layer

---

## Platform-Specific Decisions

### macOS Architecture
**Decision**: Universal binary (x64 + arm64)
**Rationale**: Support both Intel and Apple Silicon Macs
**Configuration**: electron-builder target: `mac` with `universal` arch

### macOS Minimum Version
**Decision**: macOS 11.0 (Big Sur)
**Rationale**: Balance between features and user base
**Configuration**: `electronVersion` and `macOS` target in electron-builder

### Installer Format
**Decision**: PKG installer
**Rationale**: Standard macOS installation package
**Configuration**: electron-builder target: `pkg`

### Code Signing
**Decision**: No code signing or notarization
**Rationale**: Personal use only, no Apple Developer account needed
**Configuration**: Skip signing in electron-builder config

---

## Performance Optimizations

### Bundle Optimization
**Decision**: Standard optimization with Vite
**Techniques**:
- Tree-shaking unused code
- Code splitting for large dependencies
- Minification in production
- Source maps in development only

### Asset Optimization
**Decision**: Standard asset optimization
**Techniques**:
- Image compression (basic)
- Font subsetting (if needed)
- Remove unused assets

### Lazy Loading
**Decision**: Lazy load heavy components
**Rationale**: Faster initial load
**Implementation**: React.lazy() for large components

---

## Development Workflow

### Hot Module Replacement
**Decision**: Vite HMR for renderer process
**Rationale**: Fast development iteration
**Configuration**: Vite dev server with HMR enabled

### Main Process Development
**Decision**: Manual restart for main process changes
**Rationale**: Main process changes require full restart
**Tool**: nodemon or electron-reload (optional)

### Debugging
**Decision**: Chrome DevTools for renderer, Node.js debugger for main
**Configuration**: DevTools enabled in development mode
**Rationale**: Standard Electron debugging workflow

---

## Tech Stack Summary

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| Framework | Electron | LTS | Stability and long-term support |
| Build Tool | electron-builder | Latest | Feature-rich, good docs |
| Bundler | Vite | 5.x | Fast, modern DX |
| UI Framework | React | 18.x | Reuse existing components |
| State Management | Zustand | 4.x | Reuse existing stores |
| Styling | Tailwind CSS | 3.x | Reuse existing styles |
| Language | TypeScript | 5.x | Type safety |
| HTTP Client | Axios | 1.x | Reuse existing API client |
| Testing | Jest + RTL | 29.x + 14.x | Same as web app |
| CSV Export | papaparse | 5.x | Simple and lightweight |
| Excel Export | exceljs | 4.x | Pure JS, no native deps |
| PDF Export | pdfkit | 0.13.x | Works in Node.js |
| Linting | ESLint | 8.x | Code quality |
| Formatting | Prettier | 3.x | Consistent formatting |

---

## Dependencies to Add

### New Dependencies (not in web app)
```json
{
  "electron": "^28.0.0",
  "electron-builder": "^24.0.0",
  "papaparse": "^5.4.0",
  "exceljs": "^4.3.0",
  "pdfkit": "^0.13.0"
}
```

### Dependencies to Keep (from web app)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "zustand": "^4.4.0",
  "axios": "^1.6.0",
  "tailwindcss": "^3.3.0",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "react-hook-form": "^7.48.0"
}
```

### Dependencies to Remove (Next.js specific)
```json
{
  "next": "14.x",
  "next-intl": "3.x"
}
```

---

## Build Output Structure

```
dist/
├── mac/
│   └── cash-log-1.0.0.pkg          # PKG installer
├── mac-universal/
│   └── cash-log.app/               # Universal app bundle
│       ├── Contents/
│       │   ├── MacOS/
│       │   │   └── cash-log        # Universal binary
│       │   ├── Resources/
│       │   │   ├── app.asar        # Packaged app
│       │   │   └── assets/
│       │   └── Info.plist
│       └── ...
└── ...
```

---

## Configuration Files Required

1. **electron-builder.yml** - Build and packaging configuration
2. **vite.config.ts** - Renderer process bundling
3. **vite.main.config.ts** - Main process bundling
4. **tsconfig.json** - TypeScript configuration
5. **.env** - Environment variables
6. **package.json** - Dependencies and scripts

---

## Migration from Next.js

### Remove
- Next.js framework and dependencies
- App Router structure
- Server components
- SSR/SSG logic
- next.config.js

### Keep
- React components
- Zustand stores
- API client
- Types
- Tailwind CSS
- UI components

### Add
- Electron main process
- Electron preload script
- IPC handlers
- Desktop-specific components
- Vite configuration
- electron-builder configuration

---

## Decision Rationale Summary

All technology choices prioritize:
1. **Component reuse** - Maximize reuse from existing web app
2. **Modern tooling** - Vite for fast development
3. **Security** - Maximum IPC security with contextBridge
4. **Performance** - Meet < 3s startup, 60 FPS, < 200MB memory targets
5. **Simplicity** - Standard tools with good documentation
6. **Personal use** - No code signing, PKG installer for easy installation
