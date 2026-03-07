# Cash Log - Desktop App

> Electron-based desktop application for personal finance management. Built with React, TypeScript, and Electron.

## Features

- 💰 Transaction management (income/expenses)
- 📊 Budget tracking and analytics
- 🏷️ Tag system for categorization
- 📈 Visual charts and reports
- 📤 Data export (CSV, Excel, PDF)
- 🌓 Dark mode support
- 🌍 Multi-language (Korean/English)
- 🖥️ Native macOS integration

## Requirements

- **macOS**: 11.0 (Big Sur) or later
- **Node.js**: 18+ 
- **Backend**: Spring Boot API running on localhost:8080

## Quick Start

### 가장 빠른 방법 (권장)

프로젝트 루트에서:
```bash
./start-app.sh  # 데이터베이스 + 백엔드 + 데스크톱 앱 시작
./stop-app.sh   # 종료
```

**또는 설치된 앱 사용:**
```bash
# 앱 빌드 및 설치
cd apps/frontend
npm run build
npm run package:mac
sudo installer -pkg "release/Cash Log-1.0.0-universal.pkg" -target /

# 앱 실행 (DB와 백엔드 자동 시작)
open -a "Cash Log"

# 앱 종료 시 DB와 백엔드도 자동으로 종료됨
```

### 수동 실행

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Environment

Create `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

#### 3. Start Backend

Make sure the Spring Boot backend is running:

```bash
cd ../backend
./mvnw spring-boot:run
```

#### 4. Run Development Mode

```bash
npm run dev
```

The app will launch with hot reload enabled for the renderer process.

## Build & Package

### Build Application

```bash
npm run build
```

This creates production builds in `dist/`:
- `dist/main/` - Main process
- `dist/preload/` - Preload script
- `dist/renderer/` - Renderer process

### Create PKG Installer

```bash
npm run package:mac
```

Output: `release/Cash Log-1.0.0.pkg`

### Install & Run

1. Double-click the PKG file
2. Follow installation prompts
3. App installs to `/Applications/Cash Log.app`
4. Launch from Applications folder or Spotlight

## Development

### Project Structure

```
apps/frontend/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Entry point
│   │   ├── ipc-handlers.ts
│   │   ├── services/      # Window, file system, notifications
│   │   └── managers/      # System tray, native menu
│   ├── preload/           # Preload script
│   │   ├── index.ts       # Context bridge
│   │   └── types.ts       # IPC API types
│   └── renderer/          # React application
│       ├── index.tsx      # React entry
│       ├── App.tsx        # Root component
│       ├── components/    # React components
│       ├── pages/         # Page components
│       ├── lib/           # Stores, API client
│       └── services/      # IPC bridge
├── build/                 # App icons
├── vite.*.config.ts       # Vite configurations
├── electron-builder.yml   # Packaging config
└── package.json
```

### Scripts

```bash
# Development
npm run dev              # Start dev mode
npm run dev:main         # Build main process only
npm run dev:renderer     # Start renderer dev server

# Build
npm run build            # Build all processes
npm run build:main       # Build main process
npm run build:preload    # Build preload script
npm run build:renderer   # Build renderer

# Package
npm run package          # Package for current platform
npm run package:mac      # Package for macOS

# Other
npm run lint             # Lint code
npm run test             # Run tests
```

### Hot Reload

- **Renderer process**: Full HMR with Vite
- **Main process**: Requires manual restart

### Debugging

**Renderer Process**:
- Open DevTools: `Cmd+Option+I` (in development)
- Or from View menu → Toggle Developer Tools

**Main Process**:
- Use VS Code debugger
- Or add `console.log()` statements

## Desktop Features

### System Tray

Click the tray icon to:
- View today's total and transaction count
- Show/hide main window
- Quit application

### Native Menu

- **Cash Log**: About, Hide, Quit
- **Edit**: Undo, Redo, Cut, Copy, Paste
- **Window**: Minimize, Zoom, Bring All to Front

### Window Controls

Custom title bar with:
- Minimize button
- Maximize/restore button
- Close button

### Notifications

Native macOS notifications for:
- Transaction saved
- File exported
- Errors and warnings

### File Operations

Native file dialogs for:
- Export transactions (CSV, Excel, PDF)
- Choose save location
- Select files to import

## Configuration

### Environment Variables

- `VITE_API_BASE_URL`: Backend API URL (default: `http://localhost:8080`)

### User Preferences

Stored in `~/Library/Application Support/cash-log-desktop/`:
- Theme (light/dark)
- Language (Korean/English)
- Window size and position

## Troubleshooting

### App won't start

1. Check backend is running: `curl http://localhost:8080`
2. Check console for errors: `npm run dev`
3. Clear cache: `rm -rf dist node_modules && npm install`

### "Unidentified Developer" warning

This app is not code-signed. To open:
1. Right-click app → Open
2. Click "Open" in dialog
3. Or: System Preferences → Security & Privacy → Open Anyway

### Hot reload not working

- Renderer: Check Vite dev server is running on port 5173
- Main: Restart the app manually

### Build fails

1. Check Node.js version: `node --version` (need 18+)
2. Clean build: `rm -rf dist && npm run build`
3. Check for TypeScript errors: `npx tsc --noEmit`

## Tech Stack

- **Electron**: 28.x (LTS)
- **React**: 18.x
- **TypeScript**: 5.x
- **Vite**: 5.x
- **Zustand**: 4.x (state management)
- **Tailwind CSS**: 3.x
- **Chart.js**: 4.x
- **Axios**: 1.x

## License

MIT License - see [LICENSE](../../LICENSE) file

## Support

For issues or questions, please open an issue on GitHub.
