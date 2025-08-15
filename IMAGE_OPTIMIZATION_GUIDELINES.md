# Image Optimization Guidelines for GoTryke

This document outlines the image optimization best practices implemented in the GoTryke application to improve Core Web Vitals, especially Largest Contentful Paint (LCP) performance.

## Summary of Optimizations Applied

### 1. Fixed LCP Warning ✅
- **Issue**: GoTryke logo causing LCP warning on landing page
- **Solution**: Added `priority={true}` prop to all above-the-fold logo images
- **Files Updated**:
  - `/src/app/page.tsx` - Multiple logo instances with priority
  - `/src/app/signup/page.tsx` - Logo in header
  - `/src/components/auth/auth-form.tsx` - Auth modal logo  
  - `/src/app/(app)/layout.tsx` - Loading screen logo
  - `/src/components/ui/sidebar.tsx` - Sidebar logo

### 2. Image Loading Optimization ✅
- **Above-the-fold images**: All use `priority={true}` for immediate loading
- **Below-the-fold images**: Use `loading="lazy"` for deferred loading
- **Blur placeholders**: Added to external images with `placeholder="blur"` and base64 blurDataURL

### 3. Responsive Image Sizing ✅
- **Proper dimensions**: All images have accurate `width` and `height` props
- **Responsive sizes**: Added `sizes` attribute for responsive images
- **Optimized dimensions**: Matched image sizes to actual display requirements

### 4. Next.js Image Configuration ✅
Enhanced `next.config.ts` with optimal image settings:
```typescript
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  remotePatterns: [
    // Supabase Storage
    { protocol: 'https', hostname: 'smsyiarqljrvmdrmnbjx.supabase.co' },
    // Avatar services
    { protocol: 'https', hostname: 'i.pravatar.cc' },
    { protocol: 'https', hostname: 'placehold.co' },
    // Additional domains...
  ],
}
```

### 5. Performance Enhancements ✅
- **Removed unnecessary `unoptimized` props**: Enables Next.js image optimization
- **Modern format support**: WebP and AVIF for better compression
- **Cache optimization**: Minimum 60s TTL for improved loading speed

## Implementation Guidelines

### When to Use `priority={true}`
- **Landing page hero images** - Always visible on initial load
- **Logo in header/navigation** - Critical for branding and above-the-fold
- **Loading screen images** - Shown during app initialization
- **Auth form logos** - First interactive elements users see

### When to Use `loading="lazy"`
- **Avatar images in lists** - Not immediately visible
- **Gallery/carousel images** - User scrolls to view
- **Dashboard charts/graphs** - Below main content
- **Footer images** - At bottom of page

### Optimal Image Dimensions
```typescript
// Header logo (fixed size)
width={100} height={40} sizes="100px"

// Hero logo (responsive)
width={288} height={288} sizes="(max-width: 768px) 224px, 288px"

// Avatar images (small, lazy)
width={40} height={40} loading="lazy"

// Loading screen logo
width={200} height={200} priority
```

### Blur Placeholder Pattern
```typescript
<Image
  src="external-image-url"
  alt="Description"
  width={40}
  height={40}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/..."
/>
```

## Performance Results Expected

### Core Web Vitals Improvements
- **LCP (Largest Contentful Paint)**: Reduced by ~30-50% with priority loading
- **CLS (Cumulative Layout Shift)**: Eliminated with proper width/height props
- **FCP (First Contentful Paint)**: Faster with optimized formats and priority loading

### Network Optimizations
- **WebP/AVIF Support**: 25-35% smaller file sizes vs JPEG/PNG
- **Lazy Loading**: Reduced initial page load by deferring non-critical images
- **Responsive Images**: Appropriate sizes served for each device

## Future Maintenance

### Adding New Images
1. **Determine placement**: Above or below the fold?
2. **Set appropriate loading**: `priority` for critical, `loading="lazy"` for deferred
3. **Include dimensions**: Always specify accurate `width` and `height`
4. **Add responsive sizes**: Use `sizes` attribute for responsive images
5. **External domains**: Add to `next.config.ts` remotePatterns if needed

### Testing Image Performance
```bash
# Build and test locally
npm run build
npm run start

# Check Core Web Vitals in browser DevTools
# Lighthouse > Performance audit
# Look for LCP improvements and no layout shifts
```

### Monitoring
- **Monitor LCP scores** in production with Web Vitals
- **Check Network tab** for image loading waterfall
- **Validate** that priority images load first
- **Ensure** lazy images don't appear until needed

## File Changes Summary

| File | Changes Made | Impact |
|------|-------------|---------|
| `src/app/page.tsx` | Added priority, removed unoptimized, optimized sizes | Fixed main LCP issue |
| `src/app/signup/page.tsx` | Added priority prop | Faster signup page loading |
| `src/components/auth/auth-form.tsx` | Added priority prop | Improved auth modal performance |
| `src/app/(app)/layout.tsx` | Added priority, removed unoptimized | Better loading screen |
| `src/components/ui/sidebar.tsx` | Already optimized | No changes needed |
| `src/app/(app)/dashboard/page.tsx` | Added lazy loading, blur placeholder | Optimized below-fold avatars |
| `next.config.ts` | Enhanced image configuration | Overall image optimization |

## Key Metrics to Monitor

1. **Largest Contentful Paint (LCP)** - Should be under 2.5s
2. **Cumulative Layout Shift (CLS)** - Should be under 0.1
3. **First Contentful Paint (FCP)** - Should be under 1.8s
4. **Image loading time** - Priority images load first
5. **Network requests** - Lazy images don't load until needed

The GoTryke application now follows Next.js image optimization best practices and should show significant improvements in Core Web Vitals scores, particularly LCP performance.