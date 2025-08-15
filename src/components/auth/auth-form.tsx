
"use client";

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { DialogDescription, DialogTitle } from '../ui/dialog';
import PinInput from './pin-input';

interface AuthFormProps {
  onSwitchToSignUp?: (phone?: string) => void;
  hideHeader?: boolean;
}

export function AuthForm({ onSwitchToSignUp, hideHeader = false }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const { toast } = useToast();
  const { signInWithPin } = useAuth();

  const handleSignIn = async () => {
    setIsLoading(true);

    if (phone.length !== 10) {
        toast({
            title: "Invalid Phone Number",
            description: "Please enter a 10-digit mobile number.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    
    if (pin.length !== 6) {
        toast({
            title: "Invalid PIN",
            description: "Please enter your 6-digit PIN.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    try {
        const result = await signInWithPin(phone, pin);
        
        if (result.success) {
          toast({
              title: "Welcome back!",
              description: "You have been signed in successfully.",
          });
        } else {
          console.error('Sign in failed:', result.error);
          
          if (result.error?.includes('User not found') || result.error?.includes('Invalid login credentials')) {
            if (onSwitchToSignUp) {
              toast({
                title: "Account not found",
                description: "Let's create an account for you instead!",
              });
              onSwitchToSignUp(phone);
              return;
            }
          }
          
          toast({
            title: "Sign In Failed",
            description: result.error || "Invalid phone number or PIN.",
            variant: "destructive",
          });
        }
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up">
       <motion.div 
         className="flex justify-center mb-4"
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.6, ease: "easeOut" }}
       >
        <Link href="/">
          <motion.div
            whileHover={{ 
              scale: 1.1, 
              rotate: [0, -2, 2, 0],
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.9 }}
          >
            <Image
                src="https://elnntdfdlojxpcjiyehe.supabase.co/storage/v1/object/public/gotryke-bucket/public/images/gotryke-logo.png"
                alt="GoTryke Logo"
                width={120}
                height={80}
                data-ai-hint="logo tricycle"
                className="h-16 w-auto cursor-pointer drop-shadow-lg"
            />
          </motion.div>
        </Link>
      </motion.div>
      <Card className="shadow-none border-0">
        {!hideHeader && (
          <CardHeader className="text-center p-2">
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>Enter your mobile number and PIN to access your account</DialogDescription>
          </CardHeader>
        )}
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Mobile Number</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="sm:text-sm">🇵🇭</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    disabled={isLoading}
                    className="pl-12"
                  />
                </div>
                 <p className="text-xs text-muted-foreground">Enter your mobile number without the leading zero.</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="pin" className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> 6-Digit PIN</Label>
                <PinInput
                    length={6}
                    onComplete={(pin) => setPin(pin)}
                    disabled={isLoading}
                />
                 <p className="text-xs text-muted-foreground">Enter your 6-digit PIN.</p>
            </div>
            <Button 
              onClick={handleSignIn} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            <div className="text-center">
                 <Link href="/forgot-pin" className="text-sm text-primary hover:underline">
                    Forgot your PIN?
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
