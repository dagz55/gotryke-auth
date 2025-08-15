/**
 * Role-based routing configuration
 */

export type UserRole = 'admin' | 'dispatcher' | 'guide' | 'rider' | 'passenger';

interface RoleRoute {
  dashboard: string;
  defaultRoute: string;
}

const roleRoutes: Record<UserRole, RoleRoute> = {
  admin: {
    dashboard: '/admin',
    defaultRoute: '/admin'
  },
  dispatcher: {
    dashboard: '/dispatcher',
    defaultRoute: '/dispatcher'
  },
  guide: {
    dashboard: '/dashboard',
    defaultRoute: '/dashboard'
  },
  rider: {
    dashboard: '/rider',
    defaultRoute: '/rider'
  },
  passenger: {
    dashboard: '/dashboard',
    defaultRoute: '/dashboard'
  }
};

/**
 * Get the dashboard route for a specific role
 */
export function getDashboardRoute(role?: string | null): string {
  // If no role is provided or role is invalid, default to passenger dashboard
  if (!role || typeof role !== 'string') {
    console.log('🚨 No valid role provided to getDashboardRoute, defaulting to passenger dashboard');
    return '/dashboard';
  }
  
  const userRole = role.toLowerCase() as UserRole;
  
  // Ensure the role exists in our mapping
  if (!roleRoutes[userRole]) {
    console.log(`🚨 Invalid role "${userRole}" in getDashboardRoute, defaulting to passenger dashboard`);
    return '/dashboard';
  }
  
  const route = roleRoutes[userRole].dashboard;
  console.log(`✅ getDashboardRoute: ${role} -> ${route}`);
  return route;
}

/**
 * Get the default route for a specific role
 */
export function getDefaultRoute(role?: string | null): string {
  const userRole = (role?.toLowerCase() || 'passenger') as UserRole;
  return roleRoutes[userRole]?.defaultRoute || '/dashboard';
}

/**
 * Check if a route is accessible for a specific role
 */
export function canAccessRoute(role: string, route: string): boolean {
  const userRole = role.toLowerCase() as UserRole;
  
  // Admin can access all routes
  if (userRole === 'admin') return true;
  
  // Passengers can access /dashboard and general routes
  if (userRole === 'passenger' && (route.startsWith('/dashboard') || route.startsWith('/profile') || route.startsWith('/payments'))) {
    return true;
  }
  
  // Check if the route starts with the user's role path
  const rolePrefix = `/${userRole}`;
  
  // Other roles can access their specific routes and common routes
  if (route.startsWith(rolePrefix) || route.startsWith('/profile') || route.startsWith('/payments')) {
    return true;
  }
  
  return false;
}

/**
 * Redirect to the appropriate dashboard based on user role
 */
export function redirectToDashboard(role?: string | null): void {
  // Only redirect if we have a valid role
  if (!role) {
    console.log('🚨 No role provided, skipping redirect');
    return;
  }
  
  const route = getDashboardRoute(role);
  console.log(`🚀 Redirecting ${role} to ${route}`);
  
  // Use Next.js router if available, otherwise fallback to window.location
  if (typeof window !== 'undefined') {
    window.location.href = route;
  }
}