[10:17:42.968] Running build in Washington, D.C., USA (East) – iad1
[10:17:42.969] Build machine configuration: 4 cores, 8 GB
[10:17:42.987] Cloning github.com/dagz55/gotryke (Branch: main, Commit: 096ab57)
[10:17:43.539] Warning: Failed to fetch one or more git submodules
[10:17:43.540] Cloning completed: 552.000ms
[10:17:48.051] Restored build cache from previous deployment (4dhgjMPbNMFyff5dcS6REGgFbY4G)
[10:17:55.709] Running "vercel build"
[10:17:56.219] Vercel CLI 44.7.3
[10:17:56.572] Running "install" command: `npm install`...
[10:17:59.746] npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
[10:18:00.740] npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
[10:19:18.065] 
[10:19:18.066] added 99 packages, removed 266 packages, changed 108 packages, and audited 679 packages in 1m
[10:19:18.066] 
[10:19:18.066] 79 packages are looking for funding
[10:19:18.066]   run `npm fund` for details
[10:19:18.817] 
[10:19:18.818] 10 moderate severity vulnerabilities
[10:19:18.818] 
[10:19:18.818] To address all issues, run:
[10:19:18.818]   npm audit fix
[10:19:18.818] 
[10:19:18.818] Run `npm audit` for details.
[10:19:18.894] Detected Next.js version: 15.3.3
[10:19:18.894] Running "npm run build"
[10:19:19.027] 
[10:19:19.027] > gotryke@2.1.0 build
[10:19:19.027] > next build
[10:19:19.027] 
[10:19:19.840]    ▲ Next.js 15.3.3
[10:19:19.840] 
[10:19:19.859]    Creating an optimized production build ...
[10:19:30.903] Failed to compile.
[10:19:30.903] 
[10:19:30.903] ./src/app/(app)/admin/components/add-user-form.tsx
[10:19:30.904] Module not found: Can't resolve '@/components/ui/button'
[10:19:30.904] 
[10:19:30.904] https://nextjs.org/docs/messages/module-not-found
[10:19:30.904] 
[10:19:30.904] Import trace for requested module:
[10:19:30.904] ./src/app/(app)/admin/components/data-table-toolbar.tsx
[10:19:30.904] ./src/app/(app)/admin/components/data-table.tsx
[10:19:30.904] ./src/app/(app)/admin/page.tsx
[10:19:30.904] 
[10:19:30.904] ./src/app/(app)/admin/components/add-user-form.tsx
[10:19:30.904] Module not found: Can't resolve '@/components/ui/form'
[10:19:30.904] 
[10:19:30.904] https://nextjs.org/docs/messages/module-not-found
[10:19:30.905] 
[10:19:30.905] Import trace for requested module:
[10:19:30.905] ./src/app/(app)/admin/components/data-table-toolbar.tsx
[10:19:30.905] ./src/app/(app)/admin/components/data-table.tsx
[10:19:30.905] ./src/app/(app)/admin/page.tsx
[10:19:30.905] 
[10:19:30.905] ./src/app/(app)/admin/components/add-user-form.tsx
[10:19:30.905] Module not found: Can't resolve '@/components/ui/input'
[10:19:30.905] 
[10:19:30.905] https://nextjs.org/docs/messages/module-not-found
[10:19:30.905] 
[10:19:30.905] Import trace for requested module:
[10:19:30.905] ./src/app/(app)/admin/components/data-table-toolbar.tsx
[10:19:30.905] ./src/app/(app)/admin/components/data-table.tsx
[10:19:30.906] ./src/app/(app)/admin/page.tsx
[10:19:30.906] 
[10:19:30.906] ./src/app/(app)/admin/components/add-user-form.tsx
[10:19:30.906] Module not found: Can't resolve '@/components/ui/select'
[10:19:30.906] 
[10:19:30.906] https://nextjs.org/docs/messages/module-not-found
[10:19:30.906] 
[10:19:30.906] Import trace for requested module:
[10:19:30.906] ./src/app/(app)/admin/components/data-table-toolbar.tsx
[10:19:30.906] ./src/app/(app)/admin/components/data-table.tsx
[10:19:30.906] ./src/app/(app)/admin/page.tsx
[10:19:30.906] 
[10:19:30.906] ./src/app/(app)/admin/components/add-user-form.tsx
[10:19:30.906] Module not found: Can't resolve '@/hooks/use-toast'
[10:19:30.906] 
[10:19:30.906] https://nextjs.org/docs/messages/module-not-found
[10:19:30.907] 
[10:19:30.907] Import trace for requested module:
[10:19:30.907] ./src/app/(app)/admin/components/data-table-toolbar.tsx
[10:19:30.907] ./src/app/(app)/admin/components/data-table.tsx
[10:19:30.907] ./src/app/(app)/admin/page.tsx
[10:19:30.907] 
[10:19:30.911] 
[10:19:30.912] > Build failed because of webpack errors
[10:19:30.946] Error: Command "npm run build" exited with 1