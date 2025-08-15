
"use client";

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from "@/hooks/use-toast";
import { publicRoles } from "@/lib/public-roles";
import { Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SignupFormProps {
  prefilledPhone?: string;
}

export function SignupForm({ prefilledPhone = '' }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState(prefilledPhone);
  const [name, setName] = useState('');
  const [role, setRole] = useState('passenger');
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const { toast } = useToast();
  const { sendOTP, verifyOTP } = useAuth();

  useEffect(() => {
    if (prefilledPhone && prefilledPhone !== phone) {
      setPhone(prefilledPhone);
    }
  }, [prefilledPhone, phone]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (!name.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    if (pin.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "Please set a 6-digit PIN.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await sendOTP(phone, 'signup');
      if (res.success) {
        setIsOtpSent(true);
        toast({
          title: "Verification Required",
          description: "We sent a 6-digit code via SMS. Enter it below to complete sign up.",
        });
      } else {
        throw new Error(res.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!/^\d{6}$/.test(otp)) {
        throw new Error('Please enter the 6-digit code');
      }
      const verify = await verifyOTP(phone, otp);
      if (!verify.success) {
        throw new Error(verify.error || 'Verification failed');
      }
      const resp = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name: name.trim(), role, pin }),
      });
      const result = await resp.json();
      if (!result.success) {
        throw new Error(result.error || 'Account creation failed');
      }
      setIsSignedUp(true);
      toast({ title: 'Account created', description: 'You can now sign in with your mobile number and PIN.' });
    } catch (error: any) {
      toast({ title: 'Verification failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSignedUp) {
    return (
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Check your phone!</AlertTitle>
        <AlertDescription>
          Your account has been created for +63{phone}. You may now sign in with your PIN.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={isOtpSent ? handleVerifyAndCreate : handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Juan Dela Cruz"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
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
            disabled={isLoading || isOtpSent}
            className="pl-12"
          />
        </div>
        <p className="text-xs text-muted-foreground">We will send a 6-digit OTP to this number.</p>
      </div>
      {!isOtpSent && (
        <div className="space-y-2">
          <Label htmlFor="pin">Choose a 6-digit PIN</Label>
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            placeholder="******"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">You will use this PIN to sign in.</p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="role">I am a...</Label>
        <Select value={role} onValueChange={setRole} disabled={isLoading || isOtpSent}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {publicRoles.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                <div className="flex items-center">
                  <r.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {r.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isOtpSent && (
        <div className="space-y-2">
          <Label>Enter 6-digit OTP</Label>
          <Input
            type="tel"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            disabled={isLoading}
          />
        </div>
      )}
      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={isLoading}
      >
        {isLoading ? (isOtpSent ? 'Verifying...' : 'Sending OTP...') : (isOtpSent ? 'Verify & Create Account' : 'Send OTP')}
      </Button>
    </form>
  );
}
