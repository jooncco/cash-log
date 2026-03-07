# Build and Test Instructions - Electron Desktop App

## Quick Start (권장)

```bash
# 전체 앱 시작 (데이터베이스 + 백엔드 + 데스크톱 앱)
./start-app.sh

# 종료
./stop-app.sh
```

---

## Prerequisites

- macOS 11.0 (Big Sur) or later
- Node.js 18+
- npm 9+
- Running Spring Boot backend on localhost:8080

## Build Instructions

### 1. Install Dependencies

```bash
cd apps/frontend
npm install
```

Expected output:
```
added 975 packages in 20s
```

### 2. Build All Processes

```bash
npm run build
```

This runs three build steps:
1. `npm run build:main` - Builds main process (Electron)
2. `npm run build:preload` - Builds preload script
3. `npm run build:renderer` - Builds renderer process (React)

Expected output:
```
dist/main/index.js      5.28 kB │ gzip: 2.06 kB
dist/preload/index.js   0.58 kB │ gzip: 0.26 kB
dist/renderer/assets/   ~320 kB total
✓ built in 886ms
```

### 3. Verify Build Output

```bash
ls -la dist/
```

Should contain:
- `dist/main/index.js` - Main process
- `dist/preload/index.js` - Preload script
- `dist/renderer/` - Renderer files and assets

## Run Instructions

### Development Mode

```bash
npm run dev
```

Features:
- Hot reload for renderer process
- DevTools automatically opened
- Source maps enabled
- Fast iteration

### Production Mode

```bash
npm start
```

Runs the built application from `dist/` directory.

## Package Instructions

### Create macOS PKG Installer

```bash
npm run package:mac
```

Output: `release/Cash Log-1.0.0.pkg`

Build artifacts:
- Universal binary (Intel + Apple Silicon)
- PKG installer for macOS
- App bundle in `release/mac-universal/`

### Install and Test

1. Locate PKG: `release/Cash Log-1.0.0.pkg`
2. Double-click to install
3. App installs to `/Applications/Cash Log.app`
4. Launch from Applications or Spotlight

## Testing

### Manual Testing Checklist

#### Application Launch
- [ ] App launches without errors
- [ ] Main window appears
- [ ] System tray icon appears
- [ ] No console errors

#### Navigation
- [ ] Dashboard page loads
- [ ] Transactions page loads
- [ ] Settings page loads
- [ ] Navigation between pages works

#### Window Controls
- [ ] Minimize button works
- [ ] Maximize/restore button works
- [ ] Close button works
- [ ] Window state persists (size, position)

#### Desktop Features
- [ ] System tray menu shows
- [ ] System tray "Show Window" works
- [ ] System tray "Quit" works
- [ ] Native notifications appear
- [ ] File export dialog opens (CSV, Excel, PDF)

#### Settings
- [ ] Theme toggle works (light/dark)
- [ ] Language toggle works (Korean/English)
- [ ] Settings persist after restart

#### Backend Integration
- [ ] API calls succeed
- [ ] Data loads from backend
- [ ] Transactions can be created
- [ ] Error handling works when backend is down

### Unit Tests

```bash
npm test
```

Runs Jest tests for:
- React components
- Utility functions
- Store logic

### Build Verification

```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build

# Should complete without errors
echo $?  # Should output: 0
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### App Won't Start

```bash
# Check backend is running
curl http://localhost:8080

# Check build output exists
ls -la dist/main/index.js
ls -la dist/preload/index.js
ls -la dist/renderer/index.html

# Run in development mode for better error messages
npm run dev
```

### Package Fails

```bash
# Ensure build is complete
npm run build

# Check electron-builder config
cat electron-builder.yml

# Try packaging with verbose output
npm run package:mac -- --verbose
```

## Performance Benchmarks

### Build Times
- Clean build: ~20s
- Incremental build: ~1s (renderer only)
- Full package: ~30s

### Application Performance
- Startup time: < 3 seconds
- Memory usage: < 200 MB idle
- UI responsiveness: 60 FPS

### Bundle Sizes
- Main process: 5.2 KB
- Preload: 0.6 KB
- Renderer: ~320 KB (gzipped)
- Total app size: ~150 MB (with Electron runtime)

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Electron App
on: [push]
jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd apps/frontend && npm install
      - run: cd apps/frontend && npm run build
      - run: cd apps/frontend && npm run package:mac
      - uses: actions/upload-artifact@v3
        with:
          name: installer
          path: apps/frontend/release/*.pkg
```

## Next Steps

After successful build and test:
1. Create app icons (see `build/README.md`)
2. Configure code signing (optional)
3. Set up auto-update (optional)
4. Deploy to distribution channel
