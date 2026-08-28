/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', 'coverage'],
  rules: {
    // Vite's fast refresh only works when a module exports components alone.
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    // `_`-prefixed args are the codebase's convention for deliberately unused ones.
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-unused-vars': 'off',
  },
  overrides: [
    {
      files: ['src/**/__tests__/**/*.ts', 'src/**/*.test.ts', 'src/setupTests.ts', 'src/__mocks__/**'],
      env: { jest: true, node: true },
    },
  ],
};
