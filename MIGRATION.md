# Migrating to Vite (from Create React App)

RESTool has migrated its build system from **Create React App (CRA)** to **Vite**. This change eliminates known npm vulnerabilities, significantly improves build and hot reload performance, and moves the project to modern, actively maintained tooling.

For general documentation, see the [README](./README.md).

<br />

## Table of Contents

- [Quick Summary](#quick-summary)
- [For config.json Users](#for-configjson-users)
- [For config.js Users](#for-configjs-users)
- [For Developers and Contributors](#for-developers-and-contributors)
  - [Development Workflow](#development-workflow)
  - [Project Structure Changes](#project-structure-changes)
  - [SCSS Changes](#scss-changes)
  - [TypeScript Changes](#typescript-changes)
  - [Environment Variables](#environment-variables)
  - [Import Changes](#import-changes)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

<br />

## Quick Summary

| What | Before (CRA) | After (Vite) |
| --- | --- | --- |
| Build tool | `react-scripts` | `vite` |
| Dev command | `npm start` | `npm run dev` (or `npm start`) |
| Build command | `npm run build` | `npm run build` (unchanged) |
| Config format (`.js`) | `export default {...}` | `window.config = {...};` |
| Config format (`.json`) | No change | No change |
| Build output | `build/` | `build/` (unchanged) |
| Dev server port | `3000` | `3000` (unchanged) |

<br />

## For config.json Users

If you use `config.json`, **no changes are needed**. Your configuration works exactly as before. Just update your RESTool installation.

<br />

## For config.js Users

> **Breaking Change:** The `config.js` format has changed.

**Before (CRA):**
```javascript
export default {
  "name": "My App",
  // ... your config
}
```

**After (Vite):**
```javascript
window.config = {
  "name": "My App",
  // ... your config
};
```

**Why?** Vite uses native ES modules, and the old dynamic `import()` pattern for configuration files does not work reliably with Vite's module system. The new `window.config` approach uses script tag injection, which works consistently in both development and production.

**Where to place the file:**
- Place your `config.js` in the `public/` directory. Vite automatically copies it to the `build/` root during `npm run build`.
- **Note:** With CRA, the config.js had to be manually placed in `/build/static/js/`. This is no longer needed — Vite handles it automatically.

All JavaScript features in your config (such as `onChange`, `showFieldWhen`, `dataTransform`) continue to work exactly as before.

<br />

## For Developers and Contributors

### Development Workflow

**Before (CRA):**
```
npm start          # react-scripts start
npm run server     # Start mock API server
```

**After (Vite):**
```
npm run dev        # vite (preferred)
npm start          # Also starts vite
npm run server     # Start mock API server (unchanged)
```

Both `npm run dev` and `npm start` work identically. The development server runs on `http://localhost:3000/` as before and supports hot module replacement.

### Project Structure Changes

| File | Change |
| --- | --- |
| `index.html` | Moved from `public/index.html` to project root (Vite requirement) |
| `vite.config.mts` | New — Vite build configuration |
| `vite-env.d.ts` | New — TypeScript declarations for Vite environment |
| `public/` | Still exists, holds static assets (config files, favicon, etc.) |

### SCSS Changes

All `@import` statements have been replaced with the modern Sass `@use` and `@forward` syntax.

**Before:**
```scss
@import '../../common/styles/functions';
```

**After:**
```scss
@use '../../common/styles/functions' as *;
```

The `as *` suffix makes all members available without a namespace prefix, preserving the same usage pattern as the old `@import`.

### TypeScript Changes

| Setting | Before | After |
| --- | --- | --- |
| `target` | `ES5` | `ESNext` |
| `jsx` | `react` | `react-jsx` |
| `types` | `react-scripts` | `vite/client` |

TypeScript has also been moved from `dependencies` to `devDependencies`.

### Environment Variables

**Before (CRA):**
```typescript
process.env.NODE_ENV === 'production'
process.env.PUBLIC_URL
```

**After (Vite):**
```typescript
import.meta.env.MODE === 'production'
import.meta.env.BASE_URL
```

A compatibility shim is included in `vite.config.mts` (`'process.env': 'import.meta.env'`), so most existing code works without changes. New code should use `import.meta.env` directly.

### Import Changes

All `require()` calls have been replaced with ES module `import` statements.

**Before:**
```typescript
const { unflatten } = require('flat');
const { JsonEditor } = require('jsoneditor-react');
```

**After:**
```typescript
import { unflatten } from 'flat';
import { JsonEditor } from 'jsoneditor-react';
```

<br />

## Deployment

The production deployment process remains the same:

1. Run `npm run build`
2. Deploy the `build/` folder
3. Your `config.json` or `config.js` from `public/` is automatically copied to the `build/` root

**Note:** With CRA, `config.js` had to be manually placed in `/build/static/js/`. Vite now copies all files from `public/` to the build root automatically, so no manual step is needed.

<br />

## Troubleshooting

| Issue | Solution |
| --- | --- |
| "Config not found" error | Make sure your `config.js` uses `window.config = {...};` instead of `export default {...}` |
| Styles look broken | Check that any custom SCSS uses `@use` instead of `@import` |
| Environment variables not working | Replace `process.env.X` with `import.meta.env.X` |
| Build output structure changed | Asset files are now in `build/assets/` instead of `build/static/` |
