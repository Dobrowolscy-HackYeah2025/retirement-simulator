# Performance Optimizations for PageSpeed Insights

This document outlines all the performance optimizations implemented to improve the Google PageSpeed Insights score, specifically addressing the "Requests are blocking the page's initial render" issue.

## 🚀 Optimizations Implemented

### 1. **Code Splitting & Lazy Loading**

#### Charts Lazy Loading

All Highcharts components are now lazy-loaded to reduce the initial bundle size:

- `PensionForecastChart`
- `ScenariosChart`
- `ContributionHistoryChart`
- `RegionalBenchmarkChart`
- `ReplacementRateChart`
- `SickLeaveImpactChart`

**Impact**: Reduces initial JavaScript bundle by ~200-300KB

#### PostHog Lazy Loading

Analytics library (PostHog) is now lazy-loaded to avoid blocking initial render:

```typescript
const PostHogProviderLazy = lazy(async () => {
  const { PostHogProvider } = await import('posthog-js/react');
  // ...
});
```

**Impact**: Reduces initial bundle by ~100KB

### 2. **Bundle Optimization**

#### Manual Chunk Splitting

Large libraries are split into separate chunks for better caching:

- `react-vendor` - React & React DOM
- `highcharts` - Charting library
- `jotai` - State management
- `posthog` - Analytics
- `motion` - Framer Motion animations
- `vendor` - Other dependencies

**Impact**: Improves caching and parallel loading

#### Build Configuration

```typescript
{
  minify: 'esbuild',  // Fast minification
  target: 'es2015',   // Modern browsers only
  chunkSizeWarningLimit: 1000
}
```

### 3. **Asset Compression**

#### Gzip & Brotli Compression

All assets are pre-compressed during build:

- Gzip compression for broad compatibility
- Brotli compression for better compression ratios (20-30% smaller)

**Impact**: Reduces transfer size by 60-80%

### 4. **Resource Hints**

#### Preconnect

Added preconnect to external domains:

```html
<link rel="preconnect" href="https://eu.i.posthog.com" crossorigin />
```

**Impact**: Reduces DNS lookup and connection time for analytics

### 5. **Loading States**

#### Skeleton Screens

Added skeleton loading states for charts to improve perceived performance:

```typescript
const ChartSkeleton = ({ fullWidth }) => (
  <div className="animate-pulse rounded-lg border bg-card">
    {/* Skeleton UI */}
  </div>
);
```

**Impact**: Better user experience during lazy loading

### 6. **HTML Optimizations**

- Set correct language: `<html lang="pl">`
- Added meta description for SEO
- Optimized resource loading order

## 📊 Expected Improvements

### Before Optimizations

- **LCP (Largest Contentful Paint)**: ~3-4s
- **FCP (First Contentful Paint)**: ~1.5-2s
- **TBT (Total Blocking Time)**: ~500-800ms
- **Bundle Size**: ~800KB (uncompressed)

### After Optimizations

- **LCP**: ~1.5-2s (50% improvement)
- **FCP**: ~0.8-1.2s (40% improvement)
- **TBT**: ~200-300ms (60% improvement)
- **Initial Bundle**: ~300-400KB (50% reduction)
- **Compressed Size**: ~100-150KB with Brotli

## 🔧 How to Verify

### 1. Build and Analyze

```bash
npm run build:analyze
```

This will:

- Build the production bundle
- Generate a visual bundle analysis
- Open `dist/stats.html` in your browser

### 2. Test Locally

```bash
npm run build
npm run preview
```

Then test with:

- Chrome DevTools Lighthouse
- Google PageSpeed Insights
- WebPageTest.org

### 3. Check Compression

After deploying, verify compression is working:

```bash
curl -H "Accept-Encoding: br,gzip" -I https://your-domain.com
```

Look for `Content-Encoding: br` or `gzip` in response headers.

## 📝 Deployment Notes

### Server Configuration Required

#### For Nginx

```nginx
# Enable Brotli compression
brotli on;
brotli_types text/css text/javascript application/javascript application/json image/svg+xml;

# Enable Gzip as fallback
gzip on;
gzip_types text/css text/javascript application/javascript application/json image/svg+xml;

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### For Apache

```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>
```

#### For Vercel/Netlify

These platforms automatically:

- Serve pre-compressed files (.gz, .br)
- Set appropriate cache headers
- Enable HTTP/2 for parallel loading

No additional configuration needed! ✅

## 🎯 Next Steps for Further Optimization

1. **Image Optimization**
   - Convert images to WebP format
   - Add responsive images with `srcset`
   - Lazy load below-the-fold images

2. **Critical CSS Inlining**
   - Extract and inline critical CSS for above-the-fold content
   - Use `vite-plugin-critical` or similar

3. **Service Worker**
   - Implement service worker for offline support
   - Cache static assets aggressively

4. **HTTP/2 Server Push**
   - Push critical resources before they're requested
   - Requires server configuration

5. **Resource Prioritization**
   - Add `fetchpriority="high"` to critical resources
   - Defer non-critical scripts

## 📚 Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
