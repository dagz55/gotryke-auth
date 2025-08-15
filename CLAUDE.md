# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoTryke v2.3.1 is a multi-role transportation management web application built with Next.js App Router, React, TypeScript, and **Supabase**. It supports roles for Admin, Dispatcher, Guide, Passenger, and Rider.

**Version**: 2.3.1 - 🚀 **PRODUCTION READY** and deployed at [gotrykeph.com](https://gotrykeph.com). Latest updates include warning-free installation, 6-digit PIN security, enhanced admin features, complete Supabase integration, and production-grade optimizations.

## Essential Commands

```bash
# Development
npm run dev           # Start development server on http://localhost:9002
npm run genkit:dev    # Start AI development server (Google Genkit)

# Build and Production
npm run build         # Build for production
npm run start         # Start production server

# Code Quality
npm run lint          # Run ESLint
npm run typecheck     # Run TypeScript type checking
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.x with App Router
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: **Supabase** (PostgreSQL, Auth, Storage)
- **AI**: Google Genkit with Gemini 2.0 Flash
- **Maps**: Mapbox GL JS
- **State**: React Context for dirty state management

### Key Directory Structure
```
/src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected routes with shared layout
│   │   ├── admin/         # Admin dashboard with reports, project planning, documentation
│   │   ├── dashboard/     # Main dashboard
│   │   ├── dispatcher/    # Dispatcher interface
│   │   ├── passenger/     # Passenger management
│   │   ├── rider/         # Rider management
│   │   └── payments/      # Payment management
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   ├── page.tsx           # Landing/login page
│   └── signup/            # Registration
├── components/
│   ├── ui/               # Shadcn UI components
│   └── auth/             # Authentication components
├── contexts/             # React contexts (auth, dirty state)
├── lib/
│   ├── supabase-client.ts # Supabase client configuration
│   ├── supabase-auth.ts   # Supabase authentication functions
│   └── utils.ts          # Utilities
└── ai/                   # Genkit AI configuration
```

### Authentication
- **Supabase Auth** with SMS OTP verification via **Twilio**.
- **6-digit PIN** secondary authentication with bcrypt hashing.
- Role-based access control (Admin, Dispatcher, Guide, Passenger, Rider).
- Protected routes under `(app)` route group with middleware validation.

### UI Components
Uses Shadcn UI component library extensively. Components are in `/src/components/ui/`:
- Data tables with sorting, filtering, pagination
- Forms with validation
- Charts and visualizations
- Responsive sidebar navigation

### Important Configuration
- **Port**: Development server runs on port 9002
- **Environment Variables**: `.env.local` file contains API keys for Supabase, Twilio, and AI services.
- **Build**: Production builds ignore TypeScript and ESLint errors (see next.config.ts)

## Development Guidelines

1. **Component Patterns**: Follow existing patterns in `/src/app/(app)/` for new features
2. **State Management**: Use React Context for auth and dirty state tracking.
3. **Styling**: Use Tailwind CSS classes, avoid inline styles.
4. **Supabase**: All Supabase operations should go through `/src/lib/supabase-client.ts` and `/src/lib/supabase-auth.ts`.
5. **AI Features**: Genkit flows are defined in `/src/ai/`.

## Current Limitations

- No test framework configured
- No code formatter (Prettier) configured
- Production builds bypass TypeScript and ESLint errors
- No CI/CD pipeline

## Common Tasks

### Adding a New Role-Based Feature
1. Create new directory under `/src/app/(app)/`
2. Follow the pattern of existing role directories (admin, dispatcher, etc.)
3. Update navigation in the shared layout if needed

### Working with Mapbox
- Mapbox components are primarily in rider and dispatcher sections
- API key is in environment variables
- Follow existing map implementation patterns

### Supabase Operations
- Authentication: Use the `useAuth` hook from `auth-context.tsx`.
- Database: Use the Supabase client from `/src/lib/supabase-client.ts`.
- Always handle loading and error states.

### AI Integration
- Genkit server must be running: `npm run genkit:dev`
- AI flows are defined in `/src/ai/genkit.ts`
- Currently uses Gemini 2.0 Flash model
