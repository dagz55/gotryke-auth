
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Shield, ClipboardList, BookText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin", icon: Shield, label: "Admin" },
  { href: "/project-plan", icon: ClipboardList, label: "Plan" },
  { href: "/guide", icon: BookText, label: "Guide" },
];

export function BottomNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role || 'passenger';

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };
  
    const getNavItems = () => {
    switch (userRole) {
      case 'admin':
        return [
            { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin', icon: Shield, label: 'Admin' },
            { href: '/project-plan', icon: ClipboardList, label: 'Plan' },
            { href: '/guide', icon: BookText, label: 'Guide' },
        ];
      default:
        return [
            { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/guide', icon: BookText, label: 'Guide' },
        ];
    }
  };

  const currentNavItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex h-16 items-center justify-around">
        {currentNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary",
              isActive(item.href) && "text-primary"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
