
"use client";

import PinInput from '@/components/auth/pin-input';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';


function ForgotPinForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [step, setStep] = useState(1); // 1: enter phone, 2: enter OTP & new PIN, 3: success
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "OTP Sent!",
          description: `A verification code has been sent to +63${phone}.`,
        });
        setStep(2);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };
  
  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPin }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "PIN Reset Successful",
          description: "Your PIN has been updated. You can now sign in with your new PIN.",
        });
        setStep(3);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reset PIN",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Reset PIN error:', error);
      toast({
        title: "Error",
        description: "Failed to reset PIN. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
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
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </form>
        );
      case 2:
        return (
           <form onSubmit={handleResetPin} className="space-y-4">
             <p className="text-sm text-center text-muted-foreground">
                Enter the 6-digit code sent to +63{phone}.
            </p>
             <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <PinInput
                    length={6}
                    onComplete={(val) => setOtp(val)}
                    disabled={isLoading}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="new-pin">New 6-Digit PIN</Label>
                <PinInput
                    length={6}
                    onComplete={(val) => setNewPin(val)}
                    disabled={isLoading}
                />
            </div>
             <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                disabled={isLoading}
            >
                {isLoading ? 'Resetting PIN...' : 'Verify & Reset PIN'}
            </Button>
          </form>
        );
        case 3:
            return (
                 <div className="space-y-4 text-center">
                    <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold">PIN Reset Successful!</h3>
                    <p className="text-muted-foreground">You can now use your new PIN to sign in to your account.</p>
                     <Link href="/">
                        <Button className="w-full">
                          Back to Sign In
                        </Button>
                      </Link>
                </div>
            )
    }
  };


  return (
    <div className="w-full max-w-md animate-fade-in-up">
       <motion.div 
         className="flex justify-center mb-6"
         initial={{ opacity: 0, y: -30, scale: 0.7 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         transition={{ 
           duration: 0.8,
           ease: [0.25, 0.46, 0.45, 0.94]
         }}
       >
        <Link href="/">
          <motion.div
            whileHover={{ 
              scale: 1.05,
              rotate: [0, -1, 1, 0],
              transition: { duration: 0.4 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
                src="https://iuyuuyg0hjtnupaw.public.blob.vercel-storage.com/gotryke.png"
                alt="GoTryke Logo"
                width={200}
                height={150}
                priority
                data-ai-hint="logo tricycle"
                className="h-20 w-auto cursor-pointer drop-shadow-xl"
            />
          </motion.div>
        </Link>
      </motion.div>
      <h1 className="text-3xl font-bold text-center">Forgot Your PIN?</h1>
      <p className="text-muted-foreground text-center mt-2 mb-8">
        No worries, we&apos;ll help you reset it.
      </p>
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Reset PIN</CardTitle>
          <CardDescription>
            {step === 1 
                ? "Enter your mobile number to receive a verification code."
                : "Enter the code you received and your new PIN."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
            {renderStep()}
            <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                &larr; Back to Sign In
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPinPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary/10 p-4">
        <div className="absolute top-4 right-4">
            <ModeToggle variant="outline" />
        </div>
      <ForgotPinForm />
    </main>
  );
}
