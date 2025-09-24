import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],

  // RESTool-specific optimizations
  build: {
    // Keep same output directory for Jenkins/Maven compatibility
    outDir: 'build',
    sourcemap: true,

    // Optimize for RESTool's use case
    rollupOptions: {
      output: {
        // Better chunking for RESTool
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          ui: ['react-toastify', 'react-loading-skeleton'],
          editor: ['jsoneditor', 'jsoneditor-react'],
          utils: ['lodash', 'query-string', 'natural-orderby']
        }
      }
    }
  },

  // Better resolve for RESTool's structure
  resolve: {
    alias: [
      { find: /^~([^/])/, replacement: "$1" },
      { find: '@', replacement: resolve(__dirname, './src') }
    ],
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
  },

  // Handle legacy libraries that expect process.env
  define: {
    'process.env': 'import.meta.env',
    global: 'globalThis',
  },

  // Use relative paths for deployment
  base: './',
});
