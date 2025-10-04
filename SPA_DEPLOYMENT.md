# SPA Deployment Guide

This application is configured as a Single Page Application (SPA) with hash-based routing for easy deployment to static hosting services.

## Features

- ✅ Hash-based routing (`/#/about` instead of `/about`)
- ✅ No server-side configuration required
- ✅ Works on any static hosting service
- ✅ TanStack Router with TanStack Query integration
- ✅ Built-in devtools for development

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:5174` (or next available port).

## Building for Production

```bash
npm run build:spa
```

This creates a `dist/` folder with all static assets ready for deployment.

## Deployment Options

### 1. Netlify

- Upload the `dist/` folder to Netlify
- The `_redirects` file is included for fallback routing

### 2. Vercel

- Upload the `dist/` folder to Vercel
- No additional configuration needed

### 3. GitHub Pages

- Upload the `dist/` folder contents to your GitHub Pages repository
- Works out of the box with hash routing

### 4. Apache Server

- Upload the `dist/` folder contents to your web server
- The `.htaccess` file is included for proper routing

### 5. Any Static Host

- Simply upload the `dist/` folder contents
- Hash routing ensures all routes work without server configuration

## URLs

With hash routing, your URLs will look like:

- Home: `https://yoursite.com/#/`
- About: `https://yoursite.com/#/about`

This ensures the app works on any static hosting service without server-side routing configuration.

## Testing Locally

After building, you can test the production build locally:

```bash
npm run serve
```

This serves the built files at `http://localhost:4173`.
