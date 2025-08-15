
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Map, BarChart, Settings, User, LogOut, CreditCard, Shield, LifeBuoy, FileText } from 'lucide-react';
import { Button } from './button';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import Image from 'next/image';

const navItems = {
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin', label: 'User Management', icon: Users },
    { href: '/dispatcher', label: 'Dispatch', icon: Map },
    { href: '/reports', label: 'Reports', icon: BarChart },
    { href: '/payments', label: 'Payments', icon: CreditCard },
    { href: '/project-plan', label: 'Project Plan', icon: FileText },
    { href: '/guide', label: 'Guide', icon: LifeBuoy },
    { href: '/profile', label: 'Profile', icon: User }
  ],
  dispatcher: [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dispatcher', label: 'Dispatch', icon: Map },
    { href: '/rider', label: 'Riders', icon: Users },
    { href: '/passenger', label: 'Passengers', icon: Users },
    { href: '/profile', label: 'Profile', icon: User },
  ],
  guide: [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/guide', label: 'Guide', icon: LifeBuoy },
    { href: '/profile', label: 'Profile', icon: User },
  ],
  passenger: [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/passenger', label: 'Book a Ride', icon: Map },
    { href: '/profile', label: 'Profile', icon: User },
  ],
  rider: [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/rider', label: 'My Trips', icon: Map },
    { href: '/profile', label: 'Profile', icon: User },
  ],
  trider: [
    { href: '/trider', label: 'Trider Dashboard', icon: Home },
    { href: '/trider', label: 'Available Rides', icon: Map },
    { href: '/profile', label: 'Profile', icon: User },
  ],
};


interface SidebarProps {
  userRole: string | null;
  onSignOut: () => void;
}

export function Sidebar({ userRole, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const getNavItems = () => {
    switch (userRole) {
      case 'admin':
        return navItems.admin;
      case 'dispatcher':
        return navItems.dispatcher;
      case 'guide':
        return navItems.guide;
      case 'passenger':
        return navItems.passenger;
      case 'rider':
        return navItems.rider;
      default:
        return [];
    }
  };

  const currentNavItems = getNavItems();

  return (
    <aside className="w-64 min-h-screen bg-card text-card-foreground border-r hidden md:flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <Link href="/">
          <Image
            src="https://elnntdfdlojxpcjiyehe.supabase.co/storage/v1/object/public/gotryke-bucket/public/images/gotryke-logo.png"
            alt="GoTryke Logo"
            width={120}
            height={40}
            className="w-24 h-auto cursor-pointer"
            priority
          />
        </Link>
        {userRole && (
          <span className="px-2 py-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full">
            {userRole}
          </span>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {currentNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex justify-between items-center">
            <Button
                variant="ghost"
                onClick={onSignOut}
                className="w-full justify-start text-left"
            >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
      </div>
    </aside>
  );
}
