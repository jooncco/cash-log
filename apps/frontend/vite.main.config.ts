import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.join(__dirname, 'src/main/index.ts'),
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    outDir: 'dist/main',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'electron',
        'electron-store',
        'papaparse',
        'exceljs',
        'pdfkit',
        'path',
        'fs',
        'fs/promises',
      ],
    },
  },
  resolve: {
    // Ensure Node.js built-ins are not bundled
    browserField: false,
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
});
