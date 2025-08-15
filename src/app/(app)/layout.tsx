
"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { DirtyStateProvider } from "@/contexts/dirty-state-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from 'next/image';
import { BottomNavbar } from "./components/bottom-navbar";
import { ModeToggle } from "@/components/mode-toggle";


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <Image
                    src="https://www.dropbox.com/scl/fi/i1a0m37imjn8sc2jpj3ey/GoTryke-animation.gif?rlkey=v4lik49g437gkl4k6g6h2jhyg&raw=1"
                    alt="GoTryke Animated Logo"
                    width={200}
                    height={200}
                    className="w-32 h-32"
                    unoptimized
                />
                <p className="text-muted-foreground animate-pulse">
                    Securing your session, please wait...
                </p>
            </div>
      </div>
    )
  }

  if (!user || !profile) {
    // This can be a blank screen or a minimal message, as the redirect will happen quickly.
    return null; 
  }
  
  const userRole = profile?.role || 'passenger';

  return (
    <DirtyStateProvider>
      <div className="min-h-screen bg-background flex">
          <div className="absolute top-4 right-4 z-50">
              <ModeToggle variant="outline" />
          </div>
        <Sidebar userRole={userRole} onSignOut={signOut} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <BottomNavbar />
      </div>
    </DirtyStateProvider>
  );
}
