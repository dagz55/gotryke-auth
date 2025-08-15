
"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { SignupForm } from "@/components/auth/signup-form";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { BarChart, Phone, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [prefilledPhone, setPrefilledPhone] = useState("");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add a timeout for loading state to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Auth loading timeout - showing landing page anyway');
        setLoadingTimeout(true);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!loading && user) {
      // Don't interfere with auth context navigation
      // The auth context will handle role-based routing
      console.log('Landing page: User authenticated, auth context will handle routing');
    }
  }, [user, loading, router]);


  const handleSwitchToSignUp = (phone = "") => {
    setPrefilledPhone(phone);
    setShowSignInModal(false);
    // Timeout to allow the first modal to close gracefully
    setTimeout(() => {
        setIsSigningUp(true);
        setShowSignUpModal(true);
    }, 200);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUpModal(false);
     setTimeout(() => {
        setIsSigningUp(false);
        setShowSignInModal(true);
    }, 200);
  };
  
  // Show loading screen only if client is not ready, or if actually loading (but not if timeout exceeded)
  if (!isClient || (loading && !loadingTimeout)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="https://elnntdfdlojxpcjiyehe.supabase.co/storage/v1/object/public/gotryke-bucket/public/images/gotryke-logo.png"
            alt="GoTryke Logo"
            width={200}
            height={200}
            className="w-32 h-32"
            unoptimized
            priority
          />
          <p className="text-muted-foreground">Loading your experience...</p>
          {loadingTimeout && (
            <p className="text-xs text-yellow-600 mt-2">Taking longer than expected...</p>
          )}
        </div>
      </div>
    );
  }

  // If user is authenticated, let the auth context handle the redirect
  // Don't show loading screen for authenticated users
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="https://elnntdfdlojxpcjiyehe.supabase.co/storage/v1/object/public/gotryke-bucket/public/images/gotryke-logo.png"
            alt="GoTryke Logo"
            width={200}
            height={200}
            className="w-32 h-32"
            unoptimized
            priority
          />
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 md:px-8 bg-background/80 backdrop-blur-md border-b">
        <Link href="/">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="https://elnntdfdlojxpcjiyehe.supabase.co/storage/v1/object/public/gotryke-bucket/public/images/gotryke-logo.png"
              alt="GoTryke Logo"
              width={100}
              height={40}
              data-ai-hint="logo tricycle"
              className="h-8 w-auto cursor-pointer drop-shadow-md"
              priority
            />
          </motion.div>
        </Link>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => setShowSignInModal(true)}>
            Sign In
          </Button>
          <Button onClick={() => handleSwitchToSignUp()}>Sign Up</Button>
          <ModeToggle variant="ghost" />
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 md:pt-32 pb-16">
        <section className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Centered Animated Logo */}
            <motion.div 
              className="mb-8 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Entrance animation: grow + spin + sway, then settle at original spot */}
              <motion.div
                initial={{ scale: 1.2, rotate: 20, x: -60, opacity: 0 }}
                animate={{
                  scale: [1.2, 0.92, 1.05, 1],
                  rotate: [20, -10, 5, 0],
                  x: [-60, 32, -16, 0],
                  opacity: [0, 1, 1, 1],
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0], transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <Image
                  src="https://elnntdfdlojxpcjiyehe.supabase.co/storage/v1/object/public/gotryke-bucket/public/images/gotryke-logo.png"
                  alt="GoTryke Logo"
                  width={480}
                  height={480}
                  className="w-56 h-56 md:w-72 md:h-72 drop-shadow-2xl filter hover:brightness-110 transition-all duration-300"
                  priority
                />
              </motion.div>
            </motion.div>
            {/* Hero title and subtitle removed per request */}
            <div className="mt-8">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full"
                onClick={() => handleSwitchToSignUp()}
              >
                Get Started
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-secondary/50 mt-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Why GoTryke?</h2>
              <p className="mt-2 text-muted-foreground">
                Everything you need for a modern tricycle management system.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}>
                <Card className="text-center p-6">
                  <CardContent className="flex flex-col items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Phone className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Easy Booking</h3>
                    <p className="text-muted-foreground">
                      Passengers can book rides easily through our simplified interface.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }}>
                <Card className="text-center p-6">
                  <CardContent className="flex flex-col items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">User Management</h3>
                    <p className="text-muted-foreground">
                      Admins can manage roles for passengers, riders, and dispatchers.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }}>
                <Card className="text-center p-6">
                   <CardContent className="flex flex-col items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <BarChart className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Live Monitoring</h3>
                    <p className="text-muted-foreground">
                      Dispatchers can track riders and manage trips in real-time.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} viewport={{ once: true }}>
                <Card className="text-center p-6">
                   <CardContent className="flex flex-col items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Secure & Reliable</h3>
                    <p className="text-muted-foreground">
                      PIN-based auth and role-based access ensures platform security.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-background border-t">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GoTryke. All Rights Reserved.</p>
           <div className="flex justify-center space-x-4 mt-4">
             <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
             <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
           </div>
        </div>
      </footer>

      {/* Sign In Modal */}
       <Dialog open={showSignInModal} onOpenChange={setShowSignInModal}>
        <DialogContent>
            <DialogHeader>
                 <DialogTitle className="text-2xl text-center">Sign In</DialogTitle>
                 <DialogDescription className="text-center">
                     Enter your mobile number and PIN to access your account
                 </DialogDescription>
            </DialogHeader>
            <AnimatePresence mode="wait">
                <motion.div
                    key={isSigningUp ? "signup" : "signin"}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                >
                    <AuthForm hideHeader onSwitchToSignUp={handleSwitchToSignUp} />
                </motion.div>
            </AnimatePresence>
        </DialogContent>
      </Dialog>
      
      {/* Sign Up Modal */}
      <Dialog open={showSignUpModal} onOpenChange={setShowSignUpModal}>
          <DialogContent>
               <DialogHeader>
                  <DialogTitle className="text-2xl text-center">Create an Account</DialogTitle>
                  <DialogDescription className="text-center">
                    Join GoTryke today to get started.
                  </DialogDescription>
                </DialogHeader>
              <SignupForm prefilledPhone={prefilledPhone} />
              <div className="text-center mt-4">
                <p className="text-sm">
                  Already have an account?{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={handleSwitchToSignIn}>
                    Sign In
                  </Button>
                </p>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
