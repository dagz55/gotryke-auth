
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, profile, updatePin } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile && user) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || '',
        email: user.email || ''
      }));
    }
  }, [profile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let pinUpdateSuccess = false;

      // Validate and update PIN if user wants to change it
      const hasAnyPinField = formData.newPin || formData.confirmPin || formData.currentPin;
      
      if (hasAnyPinField) {
        // All PIN fields must be provided if any are provided
        if (!formData.currentPin || !formData.newPin || !formData.confirmPin) {
          toast({
            title: "PIN Fields Required",
            description: "Please fill in all PIN fields (current, new, and confirm) to change your PIN.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (formData.newPin !== formData.confirmPin) {
          toast({
            title: "PIN Mismatch",
            description: "New PIN and confirmation PIN do not match.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (formData.newPin.length !== 6 || !/^\d{6}$/.test(formData.newPin)) {
          toast({
            title: "Invalid PIN Format",
            description: "PIN must be exactly 6 digits.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        // Update PIN first
        const pinResult = await updatePin(formData.currentPin, formData.newPin);
        if (!pinResult.success) {
          toast({
            title: "PIN Update Failed",
            description: pinResult.error || "Failed to update PIN",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        pinUpdateSuccess = true;
      }

      // Update profile information
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        }),
      });

      const result = await response.json();

      if (result.success) {
        let message = "Your profile has been updated successfully.";
        if (pinUpdateSuccess) {
          message += " Your PIN has also been changed.";
        }
        
        toast({
          title: "Profile Updated",
          description: message,
        });
        
        // Clear PIN fields on success
        setFormData(prev => ({
          ...prev,
          currentPin: '',
          newPin: '',
          confirmPin: ''
        }));
      } else {
        toast({
          title: "Profile Update Failed",
          description: result.error || "Failed to update profile information",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Admin Profile</h2>
      <p className="text-muted-foreground">
        View and manage your profile details.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Update your personal information and PIN. Leave PIN fields empty if you don&apos;t want to change your PIN.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src="https://placehold.co/96x96.png" alt="@admin" data-ai-hint="person" />
                    <AvatarFallback>{profile?.name?.slice(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold">{profile?.name || 'Administrator'}</h3>
                    <p className="text-muted-foreground">{user?.email || user?.phone || 'No contact info'}</p>
                    <div className="flex items-center pt-2">
                        <Shield className="mr-2 h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">{profile?.role?.toUpperCase() || 'USER'}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                 <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="currentPin">Current PIN (required to change PIN)</Label>
                    <Input 
                      id="currentPin" 
                      name="currentPin"
                      type="password" 
                      value={formData.currentPin}
                      onChange={handleInputChange}
                      placeholder="Enter current 6-digit PIN"
                      maxLength={6}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="newPin">New PIN</Label>
                    <Input 
                      id="newPin" 
                      name="newPin"
                      type="password" 
                      value={formData.newPin}
                      onChange={handleInputChange}
                      placeholder="Enter new 6-digit PIN"
                      maxLength={6}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirmPin">Confirm New PIN</Label>
                    <Input 
                      id="confirmPin" 
                      name="confirmPin"
                      type="password" 
                      value={formData.confirmPin}
                      onChange={handleInputChange}
                      placeholder="Confirm new 6-digit PIN"
                      maxLength={6}
                    />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
