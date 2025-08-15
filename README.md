## 🚀 **PRODUCTION READY v2.4.0** - Live at [gotrykeph.com](https://gotrykeph.com)

GoTryke is a comprehensive multi-role transportation management web application built with Next.js and Supabase. **Now fully deployed and operational in production**, it provides a unified platform for managing transportation services with phone-based SMS OTP authentication and role-based access for Admins, Dispatchers, Guides, Passengers, and Riders.

### ✅ **Production Status**
- **✅ Deployed and Live**: Fully operational at gotrykeph.com
- **✅ Security Hardened**: 6-digit PIN security and production-grade authentication
- **✅ Performance Optimized**: Core Web Vitals optimized with sub-2s load times
- **✅ Database Ready**: Complete Supabase integration with migration scripts
- **✅ Admin Dashboard**: Comprehensive system configuration components restored
- **✅ Routing Fixed**: Role-based routing now properly defaults to appropriate roles
- **✅ Zero Critical Issues**: All production blockers resolved

### Key Features
- **SMS-First Authentication**: Phone-only authentication with OTP delivery via Semaphore/Twilio
- **Multi-Role System**: Distinct interfaces and functionalities for Admin, Dispatcher, Guide, Passenger, and Rider roles
- **Real-Time Tracking**: Live map views with Mapbox integration for tracking rides and locations
- **PIN-Based Security**: Secondary authentication layer with bcrypt-hashed 6-digit PINs
- **Database Security**: PostgreSQL with Row Level Security (RLS) policies for data protection
- **System Configuration**: Comprehensive configuration components for all aspects of the system
- **Admin Dashboard**: Complete system management with configuration forms for security, communications, and fleet management
- **Dispatcher Control Center**: Enhanced dispatch interface with live mapping and configuration options
- **Role-Based Routing**: Fixed routing system that properly handles user roles and permissions
- **AI Integration**: Google Genkit with Gemini 2.0 Flash for intelligent features
- **Payment Management**: Built-in payment tracking and management system
- **Responsive Design**: Modern UI built with Shadcn UI and Tailwind CSS
- **Migration Ready**: Complete user migration from Firebase to Supabase

### Technical Architecture
- **Roles**: admin, dispatcher, trider, passenger
- **JWT Claims**: role, toda_id, zones
- **RLS Enforcement**: TODA/zone scoping with PostgreSQL Row Level Security
- **Edge Functions**: `auth-on-signup`, `admin-set-role`, `sms-hook`, `rides`, `wallet`
- **Public API**: Rides and wallet endpoints
- **Testing**: Comprehensive auth, policies, and rides lifecycle tests

### Prerequisites
- Supabase CLI installed
- Node 20+

### Setup
1) Copy `.env.example` to `.env` and fill values.
2) Start local stack:
   - `npm run dev:supabase`
3) Apply database (CLI resets DB automatically when linked). If needed:
   - `npm run db:reset`
4) Serve functions locally:
   - `npm run functions:serve`
5) Run tests:
   - `npm test`

### Roles via admin-set-role
- Call Edge Function `admin-set-role` with admin JWT.
- Body:
```json
{ "user_id": "<uuid>", "role": "dispatcher", "toda_id": "TODA_A", "zones": ["zone-1","zone-2"] }
```

### Configure SMS hook + Twilio
- Set env vars: `TWILIO_*`, `SMS_WEBHOOK_SECRET`
- In Supabase Dashboard → Authentication → SMS hooks:
  - Type: HTTPS
  - URL: `https://<project-ref>.functions.supabase.co/sms-hook`
  - Secret: same value as `SMS_WEBHOOK_SECRET`

### Seed data
- Create admin via seed:
  - `npm run seed:admin`

### Running tests
- Tests assume local Supabase on `127.0.0.1:54321` and `.env` loaded.
- `npm test`

### Security notes
- Rotate `SMS_WEBHOOK_SECRET` regularly
- Ensure CORS and rate limits in production (via CDN/WAF)
- Service role keys must never be exposed to clients; only on server/Edge

### Deploy functions
- `npm run deploy:functions`


## Complete Setup Guide

### 3. Configure Environment Variables
```bash
# Copy example file and configure
cp .env.example .env.local
```

Add your configuration to `.env.local`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# SMS Providers
SEMAPHORE_API_KEY=your_semaphore_key  # For Philippines
TWILIO_ACCOUNT_SID=your_twilio_sid    # For International
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Firebase (Legacy - for migration only)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# AI Services
GOOGLE_GENAI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:9002
NODE_ENV=development
```

4. Set up Supabase database:
```bash
# Create tables and RLS policies (run in Supabase SQL Editor)
# See Auth-PM.md for complete database schema
```

5. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:9002`

6. Test SMS authentication:
```bash
# Test SMS OTP with real phone number
curl -X POST http://localhost:9002/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9171841002","name":"Test User","role":"passenger"}'
```

## Available Scripts

```bash
npm run dev           # Start development server on port 9002
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run typecheck     # Run TypeScript type checking
npm run genkit:dev    # Start Genkit AI development server

# Development tools
./scripts/git-sync.sh  # Interactive git sync with branch selection

# Migration scripts (when ready)
node scripts/migrate-users.js --dry-run  # Test migration
node scripts/migrate-users.js            # Run actual migration
```

## Project Structure

```
/src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected routes with shared layout
│   │   ├── admin/         # Admin dashboard with configuration, reports, project planning
│   │   ├── dashboard/     # Main dashboard
│   │   ├── dispatcher/    # Dispatcher control center with configuration
│   │   ├── guide/         # Guide documentation
│   │   ├── passenger/     # Passenger management
│   │   ├── rider/         # Rider management
│   │   └── payments/      # Payment processing
│   ├── api/auth/          # Supabase authentication endpoints
│   ├── page.tsx           # Landing/login page
│   └── signup/            # User registration
├── components/
│   ├── ui/               # Shadcn UI components
│   └── auth/             # Authentication components
├── contexts/             # React contexts (auth, dirty state)
├── lib/
│   ├── supabase-client.ts # Supabase client configuration
│   ├── supabase-auth.ts   # Authentication functions
│   ├── role-routes.ts     # Role-based routing utilities
│   └── utils.ts          # Utility functions
├── middleware.ts         # Route protection with RLS
└── ai/                   # Genkit AI configuration

/scripts/                 # Migration and utility scripts
├── git-sync.sh           # Interactive git sync with branch selection
├── README.md             # Scripts documentation
├── migrate-users.js      # Firebase to Supabase user migration
├── database-schema.sql   # PostgreSQL schema with RLS
└── backup-firebase.js    # Firebase backup utility
```

## Role-Based Access (PostgreSQL RLS)

The application supports five distinct user roles with database-level security:

1. **Admin**: Full system access, configuration management, user management, analytics, reports, project planning, and documentation
2. **Dispatcher**: Operations management, dispatch configuration, ride assignment, live tracking
3. **Guide**: Access to documentation and guides
4. **Passenger**: Book rides, view history, manage profile via SMS auth
5. **Rider**: Accept rides, navigation, earnings tracking

**Security**: All roles are enforced via PostgreSQL Row Level Security (RLS) policies with proper routing fallbacks.

## Latest Updates (v2.4.0)

### System Configuration Components
- **System Config Form**: Security, operational, notification, and performance settings
- **Communication Settings**: SMS/Twilio, email, and AI chat configuration
- **Fleet Management**: Vehicle and rider management, zone settings, safety protocols
- **Dispatcher Configuration**: Auto-assignment algorithms and priority weighting

### Fixed Issues
- **Routing Bug**: Fixed critical issue where all users were routed to admin dashboard
- **Role Resolution**: Improved error handling and fallback to 'passenger' role
- **Environment Variables**: Added fallback configurations to prevent build failures

## Development Guidelines

1. **Code Style**: Follow TypeScript best practices and use ESLint
2. **Components**: Use Shadcn UI components, avoid custom implementations
3. **State Management**: Use React Context for auth and dirty state tracking
4. **Supabase Operations**: All database calls through `/src/lib/supabase-client.ts`
5. **Authentication**: Use `/src/lib/supabase-auth.ts` for auth operations
6. **Database Security**: Always use RLS policies, never bypass with service role in client
7. **SMS Integration**: Handle both Semaphore and Twilio providers gracefully
8. **Styling**: Use Tailwind CSS utilities with `cn()` helper, avoid inline styles
9. **Role-Based Routing**: Use `/src/lib/role-routes.ts` for consistent navigation

## SMS Provider Setup

### For Philippines (Semaphore)
1. Sign up at [semaphore.co](https://semaphore.co)
2. Add credits (minimum 10 PHP)
3. Get API key from dashboard
4. Update `.env` with `SEMAPHORE_API_KEY`

### For International (Twilio)
1. Sign up at [twilio.com](https://twilio.com)
2. Get free trial credits
3. Get Account SID, Auth Token, and Phone Number
4. Update `.env` with Twilio credentials

## Migration Status

✅ **Supabase Integration**: Complete with RLS policies  
✅ **SMS Authentication**: Semaphore + Twilio providers ready  
✅ **User Migration**: Scripts ready for Firebase → Supabase  
✅ **Database Schema**: PostgreSQL with comprehensive RLS  
✅ **Security Hardening**: bcrypt PIN hashing, audit logging  
✅ **System Configuration**: All admin configuration components restored  
✅ **Role-Based Routing**: Fixed and production ready  
✅ **Testing**: Functional tests passed, production ready  

## Team

- **Dagz**: Full Stack Developer
- **Ju**: UI/UX Design, QA Testing

## License

This project is proprietary software. All rights reserved.

## Support

### Documentation
- **Setup Guide**: See `Auth-PM.md` for complete Supabase setup
- **Migration Guide**: Check `DEPLOYMENT.md` for production deployment
- **SMS Setup**: Refer to `GET_REAL_SMS_NOW.md` for SMS configuration
- **Testing Results**: View `FUNCTIONAL_TESTING_RESULTS.md` for validation

### Troubleshooting
- **SMS Issues**: Check provider credentials and delivery logs
- **Database Issues**: Verify RLS policies and connection settings
- **Migration Issues**: Use dry-run mode first, check backup procedures
- **Routing Issues**: Check role assignments and middleware configuration

For issues or questions, please contact the development team or create an issue in the repository.
