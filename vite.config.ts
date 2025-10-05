import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    // Compress assets with gzip
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files larger than 1KB
    }),
    // Compress assets with brotli (better compression)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
    // Bundle analyzer (only in analyze mode)
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // SPA configuration
  build: {
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'esbuild', // esbuild is faster than terser
    target: 'es2015', // Target modern browsers
    // Ensure proper source maps for debugging
    sourcemap: false, // Disable in production for smaller builds
    // CSS code splitting
    cssCodeSplit: true,
    // Optimize CSS
    cssMinify: true,
    // Enable module preload for better performance
    modulePreload: {
      polyfill: true,
    },
  },
  // Ensure all routes fallback to index.html for SPA routing
  preview: {
    port: 5173,
    strictPort: true,
  },
});
