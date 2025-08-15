import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { decodeJwt } from 'jose';
import { getDashboardRoute } from './lib/role-routes';

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/dispatcher',
  '/driver',
  '/rider',
  '/api/protected',
];

// Define role-specific routes and their required roles
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['admin', 'super_admin'],
  '/admin/users': ['admin', 'super_admin'],
  '/admin/settings': ['admin', 'super_admin'],
  '/admin/analytics': ['admin', 'super_admin'],
  '/dispatcher': ['dispatcher', 'admin', 'super_admin'],
  '/dispatcher/orders': ['dispatcher', 'admin', 'super_admin'],
  '/dispatcher/routes': ['dispatcher', 'admin', 'super_admin'],
  '/driver': ['driver', 'dispatcher', 'admin', 'super_admin'],
  '/driver/deliveries': ['driver', 'dispatcher', 'admin', 'super_admin'],
  '/driver/schedule': ['driver', 'dispatcher', 'admin', 'super_admin'],
  '/rider': ['rider'],
  '/rider/deliveries': ['rider'],
  '/rider/earnings': ['rider'],
  '/rider/schedule': ['rider'],
};

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/contact',
  '/api/public',
];

// Interface for JWT payload with user metadata
interface JWTPayload {
  sub: string;
  email?: string;
  role?: string;
  user_metadata?: {
    role?: string;
    [key: string]: any;
  };
  app_metadata?: {
    role?: string;
    [key: string]: any;
  };
  exp?: number;
  iat?: number;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Create response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Get session from Supabase auth cookies
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  // Log session retrieval errors
  if (sessionError) {
    console.error('Error retrieving session:', sessionError);
  }

  // Parse JWT token to extract user metadata including role
  let userRole: string | undefined;
  let userId: string | undefined;
  let userEmail: string | undefined;
  
  if (session?.access_token) {
    try {
      // Decode the JWT token to extract user metadata
      const decodedToken = decodeJwt(session.access_token) as JWTPayload;
      
      // Extract user information from the token
      userId = decodedToken.sub || session.user.id;
      userEmail = decodedToken.email || session.user.email;
      
      // Extract role from multiple possible locations in the JWT
      userRole = decodedToken.role || 
                 decodedToken.user_metadata?.role || 
                 decodedToken.app_metadata?.role;
      
      // Store the user's role and information in response headers for downstream use
      response.headers.set('x-user-id', userId || '');
      response.headers.set('x-user-email', userEmail || '');
      response.headers.set('x-user-role', userRole || '');
      
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }
  }

  // Check if the current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the current route requires specific roles
  const roleRoute = Object.keys(ROLE_ROUTES).find(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Handle authentication for protected routes
  if (isProtectedRoute && !session) {
    // If accessing a protected route without a session, redirect to login page
    const redirectUrl = new URL('/', request.url); // Redirect to home/login page
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle role-based access control for protected routes
  if (session) {
    // First try to use the role from JWT token
    if (!userRole) {
      try {
        // If role not in JWT, fetch from profiles table as fallback
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profileData) {
          console.error('Error fetching user role from profiles:', profileError);
          // If can't fetch role, default to passenger instead of redirecting to login
          userRole = 'passenger';
          console.log('🚨 Role fetch failed, defaulting to passenger role');
        } else {
          userRole = profileData.role;
          console.log(`✅ Role fetched from database: ${userRole}`);
        }
        
        // Store the fetched role in headers
        response.headers.set('x-user-role', userRole || '');
      } catch (error) {
        console.error('Error checking user role:', error);
        return NextResponse.redirect(new URL('/error', request.url));
      }
    }

    // Check role-based access for /admin routes
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        console.log(`Access denied to /admin: User role '${userRole}' is not admin`);
        const redirectPath = getDashboardRoute(userRole);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // Check role-based access for /dispatcher routes
    if (pathname.startsWith('/dispatcher')) {
      if (userRole !== 'dispatcher' && userRole !== 'admin' && userRole !== 'super_admin') {
        console.log(`Access denied to /dispatcher: User role '${userRole}' is not dispatcher or admin`);
        const redirectPath = getDashboardRoute(userRole);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // Check role-based access for /rider routes
    if (pathname.startsWith('/rider')) {
      if (userRole !== 'rider') {
        console.log(`Access denied to /rider: User role '${userRole}' is not rider`);
        const redirectPath = getDashboardRoute(userRole);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // Additional check using ROLE_ROUTES configuration for specific paths
    if (roleRoute) {
      const requiredRoles = ROLE_ROUTES[roleRoute];
      if (userRole && !requiredRoles.includes(userRole)) {
        console.log(`Access denied: User role '${userRole}' not in required roles:`, requiredRoles);
        const redirectPath = getDashboardRoute(userRole);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && (pathname === '/login' || pathname === '/signup')) {
    // Use the role-routes configuration to determine redirect
    const redirectPath = getDashboardRoute(userRole);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // The headers are already set in the response object above
  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all protected app routes that need authentication:
     * - /admin and all sub-routes
     * - /dispatcher and all sub-routes
     * - /rider and all sub-routes
     * - /dashboard and all sub-routes
     * - /profile, /settings, and other protected routes
     * 
     * Explicitly exclude:
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico, /robots.txt, /sitemap.xml (public files)
     * - /images, /fonts (public assets)
     * - /api routes (handled separately)
     * - Public routes: /, /login, /signup, /forgot-password, /reset-password, /about, /contact
     */
    '/admin/:path*',
    '/dispatcher/:path*',
    '/rider/:path*',
    '/dashboard/:path*',
    '/driver/:path*',
    '/profile/:path*',
    '/settings/:path*',
    
    // Include the root paths without sub-paths
    '/admin',
    '/dispatcher',
    '/rider',
    '/dashboard',
    '/driver',
    '/profile',
    '/settings',
    
    // Include auth pages for redirect logic when already authenticated
    '/login',
    '/signup',
    
    // Include API routes that need protection
    '/api/protected/:path*',
  ],
};
