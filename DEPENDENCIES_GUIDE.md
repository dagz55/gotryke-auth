# GoTryke Dependencies & Module Requirements

## Complete Package List - Updated for Supabase Auth Migration

### Core Dependencies (Required)

```json
{
  "dependencies": {
    // ========== FRAMEWORK & RUNTIME ==========
    "next": "15.3.3",                    // Next.js framework (App Router)
    "react": "^18",                      // React library
    "react-dom": "^18",                  // React DOM renderer
    "typescript": "^5",                  // TypeScript compiler

    // ========== UI COMPONENTS ==========
    "@radix-ui/react-accordion": "^1.2.2",
    "@radix-ui/react-alert-dialog": "^1.1.4",
    "@radix-ui/react-aspect-ratio": "^1.1.1",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-checkbox": "^1.1.3",
    "@radix-ui/react-collapsible": "^1.1.2",
    "@radix-ui/react-context-menu": "^2.2.4",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-hover-card": "^1.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-menubar": "^1.1.4",
    "@radix-ui/react-navigation-menu": "^1.2.3",
    "@radix-ui/react-popover": "^1.1.4",
    "@radix-ui/react-progress": "^1.1.1",
    "@radix-ui/react-radio-group": "^1.2.2",
    "@radix-ui/react-scroll-area": "^1.2.2",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-separator": "^1.1.1",
    "@radix-ui/react-slider": "^1.2.2",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-switch": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-toggle": "^1.1.1",
    "@radix-ui/react-toggle-group": "^1.1.1",
    "@radix-ui/react-tooltip": "^1.1.5",

    // ========== STYLING ==========
    "tailwindcss": "^3.4.17",           // Utility-first CSS
    "tailwindcss-animate": "^1.0.7",    // Animation utilities
    "tailwind-merge": "^2.7.0",         // Merge Tailwind classes
    "class-variance-authority": "^0.7.1", // Component variants
    "clsx": "^2.1.1",                    // Class name utility

    // ========== ANIMATIONS ==========
    "framer-motion": "^11.15.0",        // Animation library

    // ========== SUPABASE SERVICES (PRIMARY) ==========
    "@supabase/supabase-js": "^2.43.5",  // Supabase client
    "@supabase/ssr": "^0.6.1",           // Supabase SSR helpers
    
    // ========== FIREBASE SERVICES (LEGACY) ==========
    "firebase": "^11.1.0",               // Firebase SDK (legacy)
    "firebase-admin": "^13.0.2",         // Firebase Admin SDK (legacy)

    // ========== AUTHENTICATION ==========
    "bcrypt": "^6.0.0",                  // PIN hashing (Supabase-compatible)
    "@types/bcrypt": "^6.0.0",           // bcrypt TypeScript types
    "jose": "^5.2.2",                    // JWT handling (Next.js compatible)
    "twilio": "^5.3.7",                  // Twilio SMS service
    "jsonwebtoken": "^9.0.2",            // JWT tokens (legacy)

    // ========== MAPPING ==========
    "mapbox-gl": "^3.9.0",               // Mapbox GL JS
    "react-map-gl": "^7.1.7",            // React Mapbox wrapper
    "@mapbox/mapbox-gl-geocoder": "^5.0.3", // Address search

    // ========== FORMS & VALIDATION ==========
    "react-hook-form": "^7.54.2",       // Form management
    "@hookform/resolvers": "^3.9.1",    // Form resolvers
    "zod": "^3.24.1",                    // Schema validation

    // ========== DATA VISUALIZATION ==========
    "recharts": "^2.15.0",               // Chart library

    // ========== AI/ML ==========
    "@genkit-ai/ai": "^0.9.0",          // Google Genkit AI
    "@genkit-ai/core": "^0.9.0",        // Genkit Core
    "@genkit-ai/firebase": "^0.9.0",    // Firebase integration
    "@genkit-ai/googleai": "^0.9.0",    // Google AI integration

    // ========== DATE & TIME ==========
    "date-fns": "^4.1.0",                // Date utilities

    // ========== ICONS ==========
    "lucide-react": "^0.469.0",         // Icon library

    // ========== UTILITIES ==========
    "cmdk": "1.0.4",                     // Command menu
    "embla-carousel-react": "^8.5.2",   // Carousel component
    "input-otp": "^1.4.1",               // OTP input component
    "next-themes": "^0.4.4",             // Theme management
    "react-day-picker": "8.10.1",       // Date picker
    "react-resizable-panels": "^2.1.7", // Resizable panels
    "sonner": "^1.7.1",                  // Toast notifications
    "vaul": "^1.1.2"                    // Drawer component
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@types/node": "^20",                // Node.js types
    "@types/react": "^18",               // React types
    "@types/react-dom": "^18",           // React DOM types
    "@types/bcryptjs": "^2.4.6",        // bcrypt types
    "@types/jsonwebtoken": "^9.0.7",    // JWT types
    "eslint": "^8",                      // Linter
    "eslint-config-next": "15.3.3",     // Next.js ESLint config
    "postcss": "^8",                     // CSS processor
    "autoprefixer": "^10.4.20"          // CSS vendor prefixes
  }
}
```

## Module Breakdown by Feature

### 1. Authentication System (Supabase Migration)
```javascript
Required Packages:
- @supabase/supabase-js (Primary authentication)
- @supabase/ssr (SSR support)
- bcrypt (PIN hashing - production grade)
- @types/bcrypt (TypeScript support)
- jose (JWT handling - Next.js optimized)
- twilio (SMS OTP - international)
- semaphore-sms (SMS OTP - Philippines) *Custom implementation
- zod (Input validation)
- firebase (Legacy fallback)
- firebase-admin (Legacy server operations)
```

### 2. User Interface
```javascript
Required Packages:
- All @radix-ui/* packages (UI primitives)
- tailwindcss (Styling)
- framer-motion (Animations)
- lucide-react (Icons)
- next-themes (Dark mode)
```

### 3. Real-time Tracking
```javascript
Required Packages:
- mapbox-gl (Map rendering)
- react-map-gl (React integration)
- firebase (Real-time database)
- date-fns (Time calculations)
```

### 4. Data Management (PostgreSQL + Supabase)
```javascript
Required Packages:
- @supabase/supabase-js (PostgreSQL operations)
- @supabase/ssr (Server-side data fetching)
- react-hook-form (Form state)
- zod (Data validation + PostgreSQL schemas)
- firebase (Legacy Firestore - migration only)
- firebase-admin (Legacy server operations)
```

### 5. Analytics & Reporting
```javascript
Required Packages:
- recharts (Charts)
- date-fns (Date formatting)
- firebase (Analytics)
```

### 6. AI Features
```javascript
Required Packages:
- @genkit-ai/ai (AI core)
- @genkit-ai/googleai (Gemini integration)
- @genkit-ai/firebase (Firebase ML)
```

## Installation Commands

### Complete Installation
```bash
# Install all dependencies
npm install

# Or using specific package manager
yarn install
pnpm install
```

### Selective Installation by Feature

#### Core Only
```bash
npm install next@15.3.3 react react-dom typescript
```

#### Add Supabase Authentication
```bash
# Primary Supabase setup
npm install @supabase/supabase-js @supabase/ssr bcrypt @types/bcrypt jose twilio zod

# Legacy Firebase (for migration)
npm install firebase firebase-admin jsonwebtoken
```

#### Add UI Components
```bash
npm install @radix-ui/react-dialog @radix-ui/react-select tailwindcss framer-motion lucide-react
```

#### Add Mapping
```bash
npm install mapbox-gl react-map-gl @mapbox/mapbox-gl-geocoder
```

#### Add AI Features
```bash
npm install @genkit-ai/ai @genkit-ai/core @genkit-ai/googleai @genkit-ai/firebase
```

## Environment Setup

### Required Environment Variables (Supabase Migration)
```env
# Supabase Configuration (Primary)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SMS Services (Required for phone auth)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_VERIFY_SERVICE_SID=your-verify-service-sid
TWILIO_FROM_PHONE=+1234567890
SEMAPHORE_API_KEY=your-semaphore-key
SEMAPHORE_SENDER_NAME=GoTryke

# SMS Provider Configuration
SMS_PROVIDER=semaphore        # 'semaphore' for PH, 'twilio' for international
USE_REAL_SMS=true            # Set to false for testing only

# Security Keys (Critical)
APP_SECRET_KEY=your-32-byte-secret    # For PIN encryption
JWT_SECRET_KEY=your-jwt-secret        # For session tokens

# Firebase (Legacy - for migration only)
NEXT_PUBLIC_FIREBASE_API_KEY=your-legacy-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-legacy-project
FIREBASE_ADMIN_SERVICE_ACCOUNT=path-to-service-account.json

# Maps (Required for tracking)
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# AI Services (Optional)
GOOGLE_GENAI_API_KEY=your-gemini-key
ANTHROPIC_API_KEY=your-anthropic-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:9002
NODE_ENV=development
```

## Version Compatibility Matrix

| Package | Min Version | Max Version | Notes |
|---------|------------|-------------|-------|
| Node.js | 18.17.0 | 20.x | Required for Next.js 15 |
| npm | 9.x | 10.x | Or use yarn/pnpm |
| Next.js | 15.3.3 | 15.x | App Router required |
| React | 18.2.0 | 18.x | Server Components |
| TypeScript | 5.0.0 | 5.x | Strict mode recommended |
| **Supabase** | **2.43.5** | **2.x** | **Primary backend** |
| **bcrypt** | **6.0.0** | **6.x** | **Production PIN hashing** |
| **jose** | **5.2.2** | **5.x** | **Next.js JWT handling** |
| Firebase | 11.0.0 | 11.x | Legacy (migration only) |

## Package Size Analysis

### Bundle Size Impact (Supabase Migration)
```
Critical (affects initial load):
- next: ~90kb (framework)
- react + react-dom: ~45kb
- @supabase/supabase-js: ~35kb (smaller than Firebase)
- mapbox-gl: ~200kb (lazy load recommended)

UI Components (tree-shakeable):
- @radix-ui/*: ~5-10kb per component
- tailwindcss: ~10kb (purged)
- framer-motion: ~40kb (lazy load)

Backend only (not in bundle):
- @supabase/ssr: N/A (server only)
- bcrypt: N/A (server only)
- jose: N/A (server only - Next.js optimized)
- twilio: N/A (server only)
- firebase-admin: N/A (legacy server only)

Bundle Size Improvement:
- Supabase (~35kb) vs Firebase (~50kb) = 15kb smaller
- jose (~8kb) vs jsonwebtoken (~15kb) = 7kb smaller
- Total savings: ~22kb in client bundle
```

## Troubleshooting Common Issues

### 1. Supabase Connection Issues
```bash
# Verify Supabase environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
curl -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/profiles?select=*"
```

### 1a. Firebase Admin Not Working (Legacy)
```bash
# Ensure service account key is configured (for migration only)
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
```

### 2. SMS Not Sending (Twilio/Semaphore)
```bash
# Test Twilio
curl -X POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json \
--data-urlencode "From=+1234567890" \
--data-urlencode "To=+639171841002" \
--data-urlencode "Body=Test GoTryke OTP" \
-u {AccountSid}:{AuthToken}

# Test Semaphore (Philippines)
curl -X POST https://semaphore.co/api/v4/messages \
-H "Authorization: your-api-key" \
-H "Content-Type: application/json" \
-d '{
  "message": "Test GoTryke OTP: 123456",
  "number": "09171841002",
  "sender_name": "GoTryke"
}'
```

### 3. bcrypt vs bcryptjs Issues
```bash
# If bcrypt installation fails, try bcryptjs as fallback
npm uninstall bcrypt
npm install bcryptjs @types/bcryptjs

# Update code to use bcryptjs
// import bcrypt from 'bcrypt';
import bcrypt from 'bcryptjs';
```

### 4. Mapbox Not Rendering
```javascript
// Check token validity
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
```

### 5. Supabase RLS Policy Errors
```sql
-- Debug RLS policies in Supabase SQL editor
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Test policy with specific user
SET request.jwt.claims = '{"sub": "user-uuid-here", "role": "authenticated"}';
SELECT * FROM profiles WHERE id = auth.uid();
```

### 6. TypeScript Errors
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

## Performance Optimization Tips (Supabase)

1. **Supabase Query Optimization**: Use select() to limit columns
```javascript
// Good - only fetch needed columns
const { data } = await supabase
  .from('profiles')
  .select('id, name, phone, role')
  .eq('role', 'rider');

// Bad - fetches all columns
const { data } = await supabase
  .from('profiles')
  .select('*');
```

2. **Code Splitting**: Use dynamic imports for heavy components
```javascript
const MapComponent = dynamic(() => import('@/components/maps/MapView'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
});
```

2. **Tree Shaking**: Import only what you need
```javascript
// Good
import { Dialog } from '@radix-ui/react-dialog';

// Bad
import * as RadixUI from '@radix-ui/react-dialog';
```

3. **Lazy Load Supabase**: 
```javascript
// Client-side lazy loading
const getSupabaseClient = async () => {
  const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs');
  return createClientComponentClient();
};

// Server-side lazy loading
const getSupabaseServer = async () => {
  const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs');
  return createServerComponentClient();
};
```

4. **Database Connection Pooling**:
```javascript
// Use Supabase connection pooling for better performance
const supabase = createClient(url, key, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: { 'x-my-custom-header': 'gotryke-app' }
  }
});
```

---

## Migration Summary

### Dependencies Added for Supabase:
- @supabase/supabase-js (2.43.5)
- @supabase/ssr (0.6.1) 
- bcrypt (6.0.0) + @types/bcrypt
- jose (5.2.2)

### Dependencies Moved to Legacy:
- firebase (legacy fallback)
- firebase-admin (migration only)
- jsonwebtoken (replaced by jose)
- bcryptjs (replaced by bcrypt)

### Performance Improvements:
- **22kb smaller** client bundle
- **Better TypeScript** support with jose
- **PostgreSQL performance** vs Firestore
- **Real-time subscriptions** with Supabase

---

*Dependencies Guide v2.0 - Supabase Migration*  
*Last Updated: January 2025*  
*Total Production Dependencies: 52+ (optimized)*  
*Estimated Total Bundle Size: ~378kb gzipped (22kb improvement)*